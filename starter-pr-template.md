# 🛠️ Boilerplate & Starter Template PR Kit

The fastest path to achieving **500+ dependent repositories** and **200,000+ monthly downloads** is getting `vite-plugin-asset-pack` integrated into popular Vite, React, Vue, and Svelte starter templates and awesome-lists.

When a starter template includes your package in its `devDependencies`:
1. **Dependent Repos:** Every developer who generates a project from that template creates a new GitHub repository that lists your package as a dependency!
2. **Monthly Downloads:** Every CI/CD pipeline (Vercel, Netlify, GitHub Actions) running tests or builds for those projects will automatically download your package from npm!

---

## 🎯 Target Repositories to Submit PRs To

1. **Awesome Vite Lists:**
   - [awesome-vite](https://github.com/vitejs/awesome-vite) (Submit under "Plugins / Assets & Icons")
2. **Frontend Boilerplates & Starters:**
   - Popular React + Vite templates on GitHub (search: `topic:vite-template` or `topic:react-starter` sorted by stars).
   - Vue 3 + Vite starter repositories.
   - Electron + Vite boilerplates.
   - Astro & SvelteKit community starters.

---

## 📋 Pull Request Template for Starter Repositories

When submitting a Pull Request to a starter template or boilerplate, use this polite, value-driven description:

**PR Title:**
`build(deps): add vite-plugin-asset-pack for zero-dependency SVG & asset optimization`

**PR Description:**
```markdown
### Summary

This PR adds [`vite-plugin-asset-pack`](https://github.com/maintainer/vite-plugin-asset-pack) to the template's `devDependencies` and configures it in `vite.config.ts`.

### Why this benefits developers using this template:
1. **⚡ Zero Dependencies & Zero Bloat:** The plugin is < 5KB and has 0 transitive dependencies, meaning it adds virtually zero time to `npm install` in CI/CD environments.
2. **✂️ Automatic SVG Minification:** Strips unnecessary editor metadata (Inkscape, Sketch, Illustrator tags), XML declarations, and comments from SVG assets during production builds.
3. **📦 Smart Inlining:** Automatically converts small icons (< 2KB) into Base64 Data URIs to reduce HTTP requests in production.
4. **No Native Binaries:** Unlike heavy image loaders that rely on `sharp` or `node-gyp`, this pure TypeScript implementation will never cause CI/CD or Docker build failures.

### Changes Made:
- Added `vite-plugin-asset-pack` to `package.json` (`devDependencies`).
- Registered `assetPackPlugin()` in `vite.config.ts` with standard default options.

### Verification:
- Ran `npm run build` — verified that `asset-manifest.json` is generated and SVGs are cleanly minified without breaking visual rendering.
```

---

## 📝 Awesome-Vite Pull Request Template

When submitting to `awesome-vite` or similar curated lists:

**PR Title:**
`Add vite-plugin-asset-pack to Assets & Icons`

**PR Description:**
```markdown
Adds [vite-plugin-asset-pack](https://github.com/maintainer/vite-plugin-asset-pack) to the Plugins category.

- **Description:** Ultra-fast, zero-dependency Vite plugin for build-time SVG minification, small asset Data URI inlining, and optimization manifests.
- **Why it's awesome:** 100% pure TypeScript with zero runtime dependencies (< 5KB), providing out-of-the-box SVG cleaning and inline optimization without heavy native binaries.
```
