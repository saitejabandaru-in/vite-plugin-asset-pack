import type { Plugin, ResolvedConfig } from 'vite';

export interface AssetPackOptions {
  /**
   * Enable SVG minification during build.
   * @default true
   */
  minifySvg?: boolean;

  /**
   * Automatically inline assets smaller than this size in bytes into base64 Data URIs.
   * Set to 0 to disable inlining.
   * @default 2048
   */
  inlineThresholdBytes?: number;

  /**
   * Generate an asset stats manifest file (`asset-manifest.json`) in output directory.
   * @default true
   */
  generateManifest?: boolean;

  /**
   * Remove XML metadata (Inkscape, Sketch, Adobe Illustrator artifacts) from SVGs.
   * @default true
   */
  stripMetadata?: boolean;
}

export interface AssetStat {
  filename: string;
  originalSize: number;
  optimizedSize: number;
  savedBytes: number;
  savingsRatio: string;
}

/**
 * Ultra-fast zero-dependency SVG minification logic.
 */
export function minifySvg(svg: string, stripMetadata = true): string {
  let result = svg;

  // Remove XML comments
  result = result.replace(/<!--[\s\S]*?-->/g, '');

  // Remove XML declarations & DOCTYPE
  result = result.replace(/<\?xml[\s\S]*?\?>/gi, '');
  result = result.replace(/<!DOCTYPE[\s\S]*?>/gi, '');

  if (stripMetadata) {
    // Remove Metadata tags (Inkscape, Sketch, Illustrator tags)
    result = result.replace(/<metadata[\s\S]*?<\/metadata>/gi, '');
    result = result.replace(/<sodipodi:namedview[\s\S]*?<\/sodipodi:namedview>/gi, '');

    // Remove editor-specific attributes
    result = result.replace(/\s(xmlns:sketch|xmlns:inkscape|xmlns:sodipodi|sketch:type|inkscape:[a-z-]+|sodipodi:[a-z-]+)="[^"]*"/gi, '');
  }

  // Remove redundant whitespace between tags
  result = result.replace(/>\s+</g, '><');

  // Collapse multiple spaces within tags
  result = result.replace(/\s{2,}/g, ' ');

  // Trim outer whitespace
  return result.trim();
}

/**
 * Convert string buffer to Base64 Data URI for inline SVG asset processing.
 */
export function toSvgDataUri(svg: string): string {
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

/**
 * Vite Plugin Asset Pack main entry point.
 */
export function assetPackPlugin(options: AssetPackOptions = {}): Plugin {
  const {
    minifySvg: shouldMinify = true,
    inlineThresholdBytes = 2048,
    generateManifest = true,
    stripMetadata = true,
  } = options;

  const statsMap: Map<string, AssetStat> = new Map();
  let viteConfig: ResolvedConfig;

  return {
    name: 'vite-plugin-asset-pack',
    enforce: 'post',
    apply: 'build',

    configResolved(resolvedConfig) {
      viteConfig = resolvedConfig;
    },

    async transform(code, id) {
      // Process direct SVG imports
      if (shouldMinify && id.endsWith('.svg')) {
        const originalSize = Buffer.byteLength(code, 'utf-8');
        const minified = minifySvg(code, stripMetadata);
        const optimizedSize = Buffer.byteLength(minified, 'utf-8');

        if (originalSize <= inlineThresholdBytes) {
          const dataUri = toSvgDataUri(minified);
          return {
            code: `export default ${JSON.stringify(dataUri)};`,
            map: null,
          };
        }

        statsMap.set(id, {
          filename: id,
          originalSize,
          optimizedSize,
          savedBytes: Math.max(0, originalSize - optimizedSize),
          savingsRatio: originalSize > 0
            ? `${(((originalSize - optimizedSize) / originalSize) * 100).toFixed(1)}%`
            : '0%',
        });

        return {
          code: `export default ${JSON.stringify(minified)};`,
          map: null,
        };
      }
      return null;
    },

    async generateBundle(_, bundle) {
      for (const [fileName, fileAsset] of Object.entries(bundle)) {
        if (fileAsset.type === 'asset' && typeof fileAsset.source === 'string') {
          if (shouldMinify && fileName.endsWith('.svg')) {
            const originalSize = Buffer.byteLength(fileAsset.source, 'utf-8');
            const minified = minifySvg(fileAsset.source, stripMetadata);
            const optimizedSize = Buffer.byteLength(minified, 'utf-8');

            fileAsset.source = minified;

            statsMap.set(fileName, {
              filename: fileName,
              originalSize,
              optimizedSize,
              savedBytes: Math.max(0, originalSize - optimizedSize),
              savingsRatio: originalSize > 0
                ? `${(((originalSize - optimizedSize) / originalSize) * 100).toFixed(1)}%`
                : '0%',
            });
          }
        }
      }

      if (generateManifest && statsMap.size > 0) {
        const manifestContent = JSON.stringify(Array.from(statsMap.values()), null, 2);
        this.emitFile({
          type: 'asset',
          fileName: 'asset-manifest.json',
          source: manifestContent,
        });
      }
    },
  };
}

export default assetPackPlugin;
