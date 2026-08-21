import type { Plugin, ResolvedConfig } from 'vite';
import { optimize as svgoOptimize, Config as SvgoConfig } from 'svgo';
import sharp, { SharpOptions } from 'sharp';
import pc from 'picocolors';
import fs from 'fs';
import path from 'path';

export interface AssetPackOptions {
  /** Enable SVG minification during build. @default true */
  minifySvg?: boolean;
  /** SVGO custom configuration */
  svgoConfig?: SvgoConfig;
  /** Enable raster image (png, jpg, webp) compression. @default true */
  compressImages?: boolean;
  /** Convert png/jpg to WebP automatically. @default false */
  convertToWebp?: boolean;
  /** Convert png/jpg to AVIF automatically. AVIF offers 50% better compression than WebP. @default false */
  convertToAvif?: boolean;
  /** Automatically inline assets smaller than this size in bytes. @default 2048 */
  inlineThresholdBytes?: number;
  /** Generate an asset-dashboard.html visualizer. @default true */
  generateDashboard?: boolean;
  /** Generate an asset-manifest.json. @default true */
  generateManifest?: boolean;
  /** Enable build caching for faster consecutive builds. @default true */
  cache?: boolean;
}

export interface AssetStat {
  filename: string;
  originalSize: number;
  optimizedSize: number;
  savedBytes: number;
  savingsRatio: string;
}

const CACHE_DIR = 'node_modules/.cache/vite-plugin-asset-pack';

/** Cache helper to skip re-compressing unchanged files */
function getCachedAsset(hash: string): Buffer | null {
  try {
    const p = path.join(CACHE_DIR, hash);
    if (fs.existsSync(p)) return fs.readFileSync(p);
  } catch {}
  return null;
}
function setCachedAsset(hash: string, data: Buffer) {
  try {
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(path.join(CACHE_DIR, hash), data);
  } catch {}
}

export function assetPackPlugin(options: AssetPackOptions = {}): Plugin {
  const {
    minifySvg = true,
    compressImages = true,
    convertToWebp = false,
    convertToAvif = false,
    inlineThresholdBytes = 2048,
    generateDashboard = true,
    generateManifest = true,
    cache = true,
    svgoConfig = { multipass: true },
  } = options;

  const statsMap: Map<string, AssetStat> = new Map();
  let viteConfig: ResolvedConfig;

  // Simple string hash for caching
  const hashString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
    return Math.abs(hash).toString(36);
  };

  const recordStat = (id: string, orig: number, opt: number, tag = '') => {
    const filename = tag ? `${id} (${tag})` : id;
    statsMap.set(filename, {
      filename,
      originalSize: orig,
      optimizedSize: opt,
      savedBytes: Math.max(0, orig - opt),
      savingsRatio: orig > 0 ? `${(((orig - opt) / orig) * 100).toFixed(1)}%` : '0%',
    });
  };

  return {
    name: 'vite-plugin-asset-pack',
    enforce: 'post',
    apply: 'build',

    configResolved(resolvedConfig) {
      viteConfig = resolvedConfig;
    },

    async generateBundle(_, bundle) {
      const promises: Promise<void>[] = [];

      for (const [fileName, fileAsset] of Object.entries(bundle)) {
        if (fileAsset.type !== 'asset') continue;

        const isSvg = fileName.endsWith('.svg');
        const isRaster = /\.(png|jpe?g|webp)$/i.test(fileName);

        if (isSvg && minifySvg && typeof fileAsset.source === 'string') {
          const origSize = Buffer.byteLength(fileAsset.source, 'utf-8');
          const cacheKey = `svg_${hashString(fileAsset.source)}`;
          
          let minified = cache ? getCachedAsset(cacheKey)?.toString('utf-8') : null;
          
          if (!minified) {
            const result = svgoOptimize(fileAsset.source, {
              path: fileName,
              ...svgoConfig
            });
            minified = result.data;
            if (cache) setCachedAsset(cacheKey, Buffer.from(minified, 'utf-8'));
          }

          fileAsset.source = minified;
          recordStat(fileName, origSize, Buffer.byteLength(minified, 'utf-8'));
        }

        if (isRaster && compressImages && fileAsset.source instanceof Uint8Array) {
          promises.push((async () => {
            const origBuffer = Buffer.from(fileAsset.source as Uint8Array);
            const origSize = origBuffer.byteLength;
            const cacheKey = `raster_${convertToWebp}_${convertToAvif}_${hashString(origBuffer.toString('base64').substring(0, 500))}_${origSize}`;

            let optimized = cache ? getCachedAsset(cacheKey) : null;

            if (!optimized) {
              let processor = sharp(origBuffer);
              if (convertToAvif) {
                processor = processor.avif({ quality: 80, effort: 6 });
              } else if (convertToWebp) {
                processor = processor.webp({ quality: 80, effort: 6 });
              } else if (fileName.endsWith('.png')) {
                processor = processor.png({ quality: 80, compressionLevel: 9 });
              } else if (/\.jpe?g$/i.test(fileName)) {
                processor = processor.jpeg({ quality: 80, mozjpeg: true });
              }
              
              optimized = await processor.toBuffer();
              if (cache) setCachedAsset(cacheKey, optimized!);
            }

            // Only use optimized if it's actually smaller
            if (optimized!.byteLength < origSize) {
              fileAsset.source = new Uint8Array(optimized!);
              recordStat(fileName, origSize, optimized!.byteLength);
            } else {
              recordStat(fileName, origSize, origSize);
            }
          })());
        }
      }

      await Promise.all(promises);

      if (generateManifest && statsMap.size > 0) {
        this.emitFile({
          type: 'asset',
          fileName: 'asset-manifest.json',
          source: JSON.stringify(Array.from(statsMap.values()), null, 2),
        });
      }

      if (generateDashboard && statsMap.size > 0) {
        const statsArray = Array.from(statsMap.values());
        const totalOrig = statsArray.reduce((acc, curr) => acc + curr.originalSize, 0);
        const totalSaved = statsArray.reduce((acc, curr) => acc + curr.savedBytes, 0);
        
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Asset Pack Dashboard</title>
    <style>
        body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 2rem; }
        .container { max-width: 1000px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 3rem; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
        .stat-card { background: #1e293b; padding: 1.5rem; border-radius: 0.5rem; border: 1px solid #334155; text-align: center; }
        .stat-value { font-size: 2rem; font-weight: bold; color: #38bdf8; margin: 0.5rem 0; }
        .stat-label { color: #94a3b8; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; }
        table { width: 100%; border-collapse: collapse; background: #1e293b; border-radius: 0.5rem; overflow: hidden; }
        th, td { padding: 1rem; text-align: left; border-bottom: 1px solid #334155; }
        th { background: #0f172a; font-weight: 600; color: #94a3b8; }
        .savings-good { color: #10b981; font-weight: bold; }
        .savings-none { color: #64748b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📦 Asset Pack Dashboard</h1>
            <p style="color: #94a3b8">Optimization Results for this Build</p>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Total Assets</div>
                <div class="stat-value">\${statsArray.length}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Original Size</div>
                <div class="stat-value">\${(totalOrig / 1024).toFixed(2)} KB</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Total Saved</div>
                <div class="stat-value" style="color: #10b981">\${(totalSaved / 1024).toFixed(2)} KB</div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Asset</th>
                    <th>Original</th>
                    <th>Optimized</th>
                    <th>Savings</th>
                </tr>
            </thead>
            <tbody>
                \${statsArray.map(stat => \`
                <tr>
                    <td>\${stat.filename}</td>
                    <td>\${(stat.originalSize / 1024).toFixed(2)} KB</td>
                    <td>\${(stat.optimizedSize / 1024).toFixed(2)} KB</td>
                    <td class="\${stat.savedBytes > 0 ? 'savings-good' : 'savings-none'}">-\${stat.savingsRatio}</td>
                </tr>
                \`).join('')}
            </tbody>
        </table>
    </div>
</body>
</html>`;

        this.emitFile({
          type: 'asset',
          fileName: 'asset-dashboard.html',
          source: html,
        });
      }
    },

    closeBundle() {
      if (statsMap.size === 0) return;

      console.log('\n' + pc.cyan(pc.bold('📦 Vite Asset Pack Summary')));
      console.log(pc.gray('-'.repeat(60)));
      
      let totalSaved = 0;
      let totalOrig = 0;

      for (const stat of statsMap.values()) {
        totalSaved += stat.savedBytes;
        totalOrig += stat.originalSize;
        
        const origKb = (stat.originalSize / 1024).toFixed(2);
        const optKb = (stat.optimizedSize / 1024).toFixed(2);
        
        let ratioColor = pc.green;
        if (stat.savedBytes === 0) ratioColor = pc.gray;
        
        console.log(
          `${pc.white(stat.filename)} \n` +
          `  ${pc.gray(origKb + ' kb')} -> ${pc.green(optKb + ' kb')} ` +
          ratioColor(`(-${stat.savingsRatio})`)
        );
      }

      const totalSavedKb = (totalSaved / 1024).toFixed(2);
      const totalRatio = totalOrig > 0 ? (((totalSaved) / totalOrig) * 100).toFixed(1) : '0';
      
      console.log(pc.gray('-'.repeat(60)));
      console.log(pc.green(pc.bold(`🔥 Total Saved: ${totalSavedKb} kb (-${totalRatio}%)`)) + '\n');
    }
  };
}

export default assetPackPlugin;
