# 📣 Community Showcase & Launch Templates

To achieve **200,000+ monthly downloads** or **500+ dependent repositories**, you need seed adoption from the frontend and Vite community. When developers add `vite-plugin-asset-pack` to their project, their automated CI/CD pipelines (GitHub Actions, Vercel, Netlify, Docker builds) will download your package on **every build**, rapidly scaling your download numbers!

Here are ready-to-post, high-converting templates for launch day.

---

## 1. 🚀 Hacker News ("Show HN") Template

**Title:**
`Show HN: vite-plugin-asset-pack – Zero-dependency SVG minifier & asset optimizer for Vite`

**Body:**
```markdown
Hi HN! We built `vite-plugin-asset-pack` because we were tired of bloated build-time image optimizers that add 50+ transitive dependencies, native C++ binaries (like sharp/libvips that fail in random CI environments), or slow down Vite's production build.

vite-plugin-asset-pack is an ultra-fast, 100% zero-dependency Vite plugin written in TypeScript (< 5KB bundle size). It automatically:
1. Minifies SVG imports at build-time (stripping XML declarations, comments, and Inkscape/Sketch editor metadata).
2. Automatically inlines assets smaller than your configurable byte threshold into Base64 Data URIs to reduce HTTP requests.
3. Emits a clean `asset-manifest.json` reporting original vs. optimized file sizes and exact savings percentages.

We designed it to be drop-in replacement for standard asset workflows with zero side-effects and instant installation in CI/CD pipelines.

GitHub: https://github.com/maintainer/vite-plugin-asset-pack
npm: https://www.npmjs.com/package/vite-plugin-asset-pack

Would love your feedback on our SVG minification heuristics or feature requests for additional asset formats!
```

---

## 2. 🤖 Reddit (`r/reactjs`, `r/vuejs`, `r/webdev`, `r/javascript`) Template

**Title:**
`We built an ultra-fast, zero-dependency Vite plugin to optimize SVGs and inline small assets automatically [Open Source]`

**Post Content:**
```markdown
Hey everyone 👋

If you use Vite for React, Vue, or Svelte, you've probably noticed that handling raw SVG assets or managing small icon bundles can either lead to too many network requests or bloat your build pipeline with heavy native dependencies.

To solve this without adding heavy tooling, we open-sourced **vite-plugin-asset-pack**: a lightweight (< 5KB), zero-dependency Vite plugin that handles build-time asset optimization automatically.

### ✨ What it does:
* **✂️ SVG Minification:** Automatically cleans up SVGs by stripping XML declarations, doctypes, comments, and editor metadata (Inkscape, Sketch, Illustrator) before bundling.
* **📦 Smart Data URI Inlining:** Automatically converts images/icons below a custom threshold (default 2KB) into Base64 Data URIs to eliminate extra network roundtrips.
* **📊 Build Manifest:** Generates an `asset-manifest.json` file in your `dist/` folder showing exactly how many bytes were saved per asset.
* **⚡ Zero Dependencies & Tree-Shakeable:** Installs in < 1 second in Vercel/Netlify/GitHub Actions CI/CD pipelines.

### 🛠️ Quick Setup:
```bash
npm install -D vite-plugin-asset-pack
```

In your `vite.config.ts`:
```ts
import { defineConfig } from 'vite';
import assetPackPlugin from 'vite-plugin-asset-pack';

export default defineConfig({
  plugins: [
    assetPackPlugin({
      minifySvg: true,
      inlineThresholdBytes: 2048,
      generateManifest: true,
    }),
  ],
});
```

Check it out on GitHub and let us know what you think: https://github.com/maintainer/vite-plugin-asset-pack
We are actively welcoming contributors and feedback! 🚀
```

---

## 3. 📝 Dev.to / Medium Blog Post Outline

**Title:**
`How We Reduced Vite Build Times and Asset Payloads with a Zero-Dependency Plugin`

**Structure:**
1. **The Problem:** Heavy dependencies in frontend CI/CD pipelines (e.g., node-gyp binaries, sharp compilation issues in Docker/serverless).
2. **The Solution:** Introducing `vite-plugin-asset-pack` as a lightweight alternative for SVGs and small icon assets.
3. **Benchmarks & CI Speed:** Show how installing a zero-dependency plugin saves 15–30 seconds in automated build pipelines compared to traditional image loaders.
4. **Step-by-Step Walkthrough:** How to configure it in a Vite + TypeScript project.
5. **Call to Action:** Ask readers to star the repository and try adding it to their starter templates!

---

## 4. 🐦 Twitter / X Launch Thread

**Tweet 1:**
🚀 Introducing `vite-plugin-asset-pack` — an ultra-fast, zero-dependency SVG minifier and asset optimizer for @vitejs! ⚡️

✂️ Strips editor metadata & XML bloat from SVGs
📦 Automatically inlines small icons to Data URIs
📊 Emits build-time asset savings reports
🪶 < 5KB install size!

GitHub 👇
[Link to Repo]

**Tweet 2:**
Why another asset plugin? 🤔

Most image optimization tools add 50+ dependencies or require native binaries (like sharp) that break in Docker or serverless CI/CD.

We built a 100% pure TypeScript, zero-dependency engine that installs in milliseconds and never fails your CI build! 📈✨

**Tweet 3:**
Drop it into your `vite.config.ts` with 3 lines of code:

```ts
plugins: [
  assetPackPlugin({ minifySvg: true, inlineThresholdBytes: 2048 })
]
```

Try it out today: `npm i -D vite-plugin-asset-pack` 📦
Would love your feedback! RTs appreciated 🙏 #webdev #javascript #vitejs
