import { describe, it, expect, vi } from 'vitest';
import { assetPackPlugin } from './index';

describe('Vite Asset Pack Plugin (Advanced Engine)', () => {
  it('returns a valid Vite plugin object', () => {
    const plugin = assetPackPlugin();
    expect(plugin.name).toBe('vite-plugin-asset-pack');
    expect(plugin.enforce).toBe('post');
    expect(typeof plugin.generateBundle).toBe('function');
  });

  it('optimizes SVGs in generateBundle hook', async () => {
    const plugin: any = assetPackPlugin({ minifySvg: true });
    
    const bundle: any = {
      'icon.svg': {
        type: 'asset',
        fileName: 'icon.svg',
        source: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <!-- A comment -->
  <circle cx="50" cy="50" r="40" />
</svg>`
      }
    };

    // mock emitFile
    const context = {
      emitFile: vi.fn(),
    };

    if (plugin.generateBundle) {
      await plugin.generateBundle.call(context, {}, bundle);
    }

    const outputSource = bundle['icon.svg'].source;
    expect(outputSource).not.toContain('<!--');
    expect(outputSource.length).toBeLessThan(110);
  });
});
