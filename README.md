# vite-plugin-asset-pack

[![CI Status](https://github.com/maintainer/vite-plugin-asset-pack/actions/workflows/ci.yml/badge.svg)](https://github.com/maintainer/vite-plugin-asset-pack/actions)
[![npm version](https://img.shields.io/npm/v/vite-plugin-asset-pack.svg)](https://www.npmjs.com/package/vite-plugin-asset-pack)
[![bundle size](https://img.shields.io/bundlephobia/minzip/vite-plugin-asset-pack)](https://bundlephobia.com/package/vite-plugin-asset-pack)
[![license](https://img.shields.io/npm/l/vite-plugin-asset-pack)](./LICENSE)

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/maintainer/vite-plugin-asset-pack/tree/main/examples/vanilla)

An ultra-fast, **zero-dependency** Vite plugin for build-time SVG minification, automatic asset inlining, and asset manifest generation.

---

## 🎮 Try it Online

Experience the zero-dependency minifier instantly in your browser:
* [**Vanilla Vite Example**](https://stackblitz.com/github/maintainer/vite-plugin-asset-pack/tree/main/examples/vanilla)

Or run the example locally:
```bash
git clone https://github.com/maintainer/vite-plugin-asset-pack.git
cd vite-plugin-asset-pack
npm install
npm run dev:example
```

---

## ⚡ Features

- **🚀 Zero Runtime Dependencies:** Super lightweight, clean, fast builds.
- **✂️ SVG Minification:** Strips XML declarations, comments, doctypes, Inkscape/Sketch editor metadata, and redundant whitespace.
- **📦 Data URI Inlining:** Automatically inlines small assets into Base64 Data URIs below your custom size threshold.
- **📊 Asset Manifest:** Emits a detailed build-time `asset-manifest.json` report of original sizes, optimized sizes, and savings ratios.
- **⚡ First-Class TypeScript:** Ships native `.d.ts` type declarations.

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
      inlineThresholdBytes: 2048, // Inline SVGs smaller than 2KB
      generateManifest: true,     // Create asset-manifest.json in dist/
    }),
  ],
});
```

---

## ⚙️ Configuration Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `minifySvg` | `boolean` | `true` | Enable build-time SVG minification. |
| `inlineThresholdBytes` | `number` | `2048` | Assets below this byte size are inlined as Data URIs. Set to `0` to disable. |
| `generateManifest` | `boolean` | `true` | Emits `asset-manifest.json` with optimization stats. |
| `stripMetadata` | `boolean` | `true` | Removes Inkscape, Sketch, and Illustrator metadata attributes. |

---

## 📄 License

MIT © Maintainer
