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
  /** Automatically inline assets smaller than this size in bytes. @default 2048 */
  inlineThresholdBytes?: number;
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
    inlineThresholdBytes = 2048,
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
            const cacheKey = `raster_${convertToWebp}_${hashString(origBuffer.toString('base64').substring(0, 500))}_${origSize}`;

            let optimized = cache ? getCachedAsset(cacheKey) : null;

            if (!optimized) {
              let processor = sharp(origBuffer);
              if (convertToWebp) {
                processor = processor.webp({ quality: 80, effort: 6 });
              } else if (fileName.endsWith('.png')) {
                processor = processor.png({ quality: 80, compressionLevel: 9 });
              } else if (/\.jpe?g$/i.test(fileName)) {
                processor = processor.jpeg({ quality: 80, mozjpeg: true });
              }
              
              optimized = await processor.toBuffer();
              if (cache) setCachedAsset(cacheKey, optimized);
            }

            // Only use optimized if it's actually smaller
            if (optimized.byteLength < origSize) {
              fileAsset.source = new Uint8Array(optimized);
              recordStat(fileName, origSize, optimized.byteLength);
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
