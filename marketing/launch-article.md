---
title: "Stop Serving Heavy Assets in Vite! ⚡ Introducing vite-plugin-asset-pack"
tags: [webdev, vite, javascript, performance]
published: false
---

Hey everyone! 👋 

If you're using Vite, you already know it's incredibly fast. But what about your assets? Are you still manually compressing JPEGs before uploading them? Are your SVGs carrying megabytes of unnecessary metadata from Illustrator?

I couldn't find a Vite plugin that did *everything* I wanted with zero runtime dependencies. 

So I built it. 

Introducing **`vite-plugin-asset-pack`**: an enterprise-grade, build-time asset optimizer powered by ASTs and Next-Gen compression algorithms. 

## ⚡ What does it do?

1. **🎨 True SVG Optimization:** It uses `svgo` to parse your SVGs into Abstract Syntax Trees (ASTs) and mathematically minify the vector data.
2. **📸 Next-Gen Raster Compression:** Powered by `sharp`, it automatically compresses your JPEGs and PNGs during the build.
3. **🪄 Auto-WebP & AVIF:** With a single boolean flag, it converts all your raster images into Next-Gen **WebP** or **AVIF** formats for up to 50% better compression.
4. **💅 Beautiful Terminal UI:** It uses `picocolors` to print a stunning summary table of your saved bytes directly in the terminal so you know *exactly* how much bandwidth you saved.
5. **⚡ Build Caching:** Image compression is expensive. That's why I added a caching layer—consecutive builds skip unchanged files, keeping your HMR blazing fast.

## 🚀 How to use it

It's literally 3 lines of code.

```bash
npm install -D vite-plugin-asset-pack
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import assetPackPlugin from 'vite-plugin-asset-pack';

export default defineConfig({
  plugins: [
    assetPackPlugin({
      minifySvg: true,
      compressImages: true,
      convertToAvif: true, // 🚀 Boom. AVIF format instantly.
    }),
  ],
});
```

## 🎮 Try it live

I set up interactive playgrounds so you can see it working right in your browser!
* [**Vanilla Vite Example**](https://stackblitz.com/github/saitejabandaru-in/vite-plugin-asset-pack/tree/main/examples/vanilla)
* [**React Example**](https://stackblitz.com/github/saitejabandaru-in/vite-plugin-asset-pack/tree/main/examples/react)
* [**Vue Example**](https://stackblitz.com/github/saitejabandaru-in/vite-plugin-asset-pack/tree/main/examples/vue)

## 🌟 Support Open Source!

If you care about web performance, I'd love it if you gave the repo a ⭐ on GitHub! 

👉 [**View on GitHub**](https://github.com/saitejabandaru-in/vite-plugin-asset-pack)

Let me know what you think in the comments below! What other asset formats would you like to see supported? 🚀
