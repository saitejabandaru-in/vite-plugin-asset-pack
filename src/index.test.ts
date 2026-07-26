import { describe, it, expect } from 'vitest';
import { minifySvg, toSvgDataUri, assetPackPlugin } from './index';

describe('SVG Minifier (Zero-Dependency Engine)', () => {
  it('removes comments, doctype, and xml declarations', () => {
    const rawSvg = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<!-- Created with Inkscape -->
<svg width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="red" />
</svg>`;

    const minified = minifySvg(rawSvg);
    expect(minified).not.toContain('<?xml');
    expect(minified).not.toContain('<!DOCTYPE');
    expect(minified).not.toContain('<!-- Created with Inkscape -->');
    expect(minified).toBe('<svg width="100" height="100"><circle cx="50" cy="50" r="40" fill="red" /></svg>');
  });

  it('strips editor metadata attributes when enabled', () => {
    const rawSvg = `<svg xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" inkscape:version="1.0" width="50" height="50"><g><path d="M0 0h10v10H0z"/></g></svg>`;

    const minified = minifySvg(rawSvg, true);
    expect(minified).not.toContain('xmlns:inkscape');
    expect(minified).not.toContain('inkscape:version');
    expect(minified).toContain('<svg width="50" height="50">');
  });

  it('generates valid SVG data URIs', () => {
    const minifiedSvg = `<svg width="10" height="10"></svg>`;
    const dataUri = toSvgDataUri(minifiedSvg);
    expect(dataUri).toBe('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2210%22%20height%3D%2210%22%3E%3C%2Fsvg%3E');
  });

  it('returns valid Vite plugin hook metadata', () => {
    const plugin = assetPackPlugin({ inlineThresholdBytes: 1024 });
    expect(plugin.name).toBe('vite-plugin-asset-pack');
    expect(plugin.apply).toBe('build');
    expect(plugin.enforce).toBe('post');
  });
});
