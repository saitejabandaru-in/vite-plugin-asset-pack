import { defineConfig } from 'vite';
import { assetPackPlugin } from 'vite-plugin-asset-pack';

export default defineConfig({
  plugins: [
    assetPackPlugin({
      minifySvg: true,
      inlineThresholdBytes: 2048,
      generateManifest: true,
    }),
  ],
});
