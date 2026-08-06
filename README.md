# vite-plugin-asset-pack

[![CI Status](https://github.com/saitejabandaru-in/vite-plugin-asset-pack/actions/workflows/ci.yml/badge.svg)](https://github.com/saitejabandaru-in/vite-plugin-asset-pack/actions)
[![npm version](https://img.shields.io/npm/v/vite-plugin-asset-pack.svg)](https://www.npmjs.com/package/vite-plugin-asset-pack)
[![bundle size](https://img.shields.io/bundlephobia/minzip/vite-plugin-asset-pack)](https://bundlephobia.com/package/vite-plugin-asset-pack)
[![license](https://img.shields.io/npm/l/vite-plugin-asset-pack)](./LICENSE)

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/saitejabandaru-in/vite-plugin-asset-pack/tree/main/examples/vanilla)

An advanced, enterprise-grade Vite plugin for build-time SVG minification, raster image compression, automatic asset inlining, and beautiful terminal reporting.

---

## 🎮 Try it Online

Experience the powerful image compression engine instantly in your browser:
* [**Vanilla Vite Example**](https://stackblitz.com/github/saitejabandaru-in/vite-plugin-asset-pack/tree/main/examples/vanilla)

Or run the example locally:
```bash
git clone https://github.com/saitejabandaru-in/vite-plugin-asset-pack.git
cd vite-plugin-asset-pack
npm install
npm run dev:example
```

---

## ⚡ Features

- **🎨 True SVG Optimization:** Powered by `svgo` for AST-based, mathematically perfect vector minification.
- **📸 Next-Gen Raster Compression:** Powered by `sharp` to automatically compress JPEGs, PNGs, and auto-convert to WebP.
- **⚡ Build Caching Layer:** Avoids expensive re-compression of unchanged images across consecutive builds.
- **💅 Beautiful Terminal UI:** Prints a stunning, colored summary table of saved bytes directly in your Vite terminal using `picocolors`.
- **📦 Data URI Inlining:** Automatically inlines small assets into Base64 Data URIs below your custom size threshold.
- **📊 Asset Manifest:** Emits a detailed build-time `asset-manifest.json` report of original sizes, optimized sizes, and savings ratios.

---

## 🚀 Installation

```bash
npm install -D vite-plugin-asset-pack
# or
pnpm add -D vite-plugin-asset-pack
# or
yarn add -D vite-plugin-asset-pack
```

---

## 🛠️ Usage

Add `assetPackPlugin` to your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import assetPackPlugin from 'vite-plugin-asset-pack';

export default defineConfig({
  plugins: [
    assetPackPlugin({
      minifySvg: true,
      compressImages: true,
      convertToWebp: true, // Auto-convert PNG/JPG to WebP!
      inlineThresholdBytes: 2048,
      generateManifest: true,
      cache: true,
    }),
  ],
});
```

---

## ⚙️ Configuration Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `minifySvg` | `boolean` | `true` | Enable build-time SVG minification using SVGO. |
| `svgoConfig` | `object` | `{ multipass: true }` | Pass custom options directly to SVGO. |
| `compressImages` | `boolean` | `true` | Enable raster image (png, jpg, webp) compression via Sharp. |
| `convertToWebp` | `boolean` | `false` | Automatically convert png/jpg to WebP formats. |
| `inlineThresholdBytes` | `number` | `2048` | Assets below this byte size are inlined as Data URIs. Set to `0` to disable. |
| `generateManifest` | `boolean` | `true` | Emits `asset-manifest.json` with optimization stats. |
| `cache` | `boolean` | `true` | Caches compressed outputs to `node_modules/.cache/vite-plugin-asset-pack` for rapid rebuilds. |

---

## 📄 License

MIT © saitejabandaru-in
