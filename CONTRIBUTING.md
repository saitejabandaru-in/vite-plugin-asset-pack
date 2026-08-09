# Contributing to vite-plugin-asset-pack

First off, thank you for considering contributing to `vite-plugin-asset-pack`! It's people like you that make open-source such a great community.

## 🛠️ Local Development Setup (Monorepo)

This project uses **NPM Workspaces** to manage the core plugin and the framework examples (React, Vue, Vanilla) in a single repository.

1. **Fork & Clone** the repository to your local machine.
2. **Install Dependencies** at the root. This will automatically link the plugin into the example directories:
   ```bash
   npm install
   ```
3. **Run the Test Suite** to ensure the core engine is working:
   ```bash
   npm test
   ```
4. **Run the Typechecker**:
   ```bash
   npm run typecheck
   ```

## 🏗️ Project Architecture

* `src/index.ts`: The core Vite plugin engine. It leverages `svgo` for AST-based SVG minification and `sharp` for Next-Gen raster image compression.
* `src/index.test.ts`: Contains the unit tests for the Vite hooks.
* `examples/`: Contains the interactive playgrounds. If you add a new feature, please test it against `examples/react`, `examples/vue`, and `examples/vanilla`.
* `docs/`: The VitePress documentation site.

## 📥 Pull Request Process

1. Create a descriptive branch name (e.g., `feat/avif-support` or `fix/svgo-config-merge`).
2. Implement your feature or bug fix.
3. Ensure all tests pass (`npm test`) and typechecks clear (`npm run typecheck`).
4. **Test the Examples**: CD into one of the examples (e.g., `cd examples/react`) and run `npm run build` to ensure the Picocolors summary table and asset compression works correctly.
5. Update the `README.md` and the VitePress `docs/` if your changes introduce new configuration options.
6. Submit your PR! We try to review all pull requests within 48 hours.

## 💡 What We Are Looking For

* **Asset Optimization Algorithms:** New ways to compress assets, like AVIF support, font subsetting, or CSS minification.
* **Test Coverage:** Every bug fix must include a test case in `src/index.test.ts` that reproduces the original issue using mocked Vite hooks.
* **Framework Examples:** Want to add `examples/svelte` or `examples/solid`? We'd love that! Just add them to the workspace and update the documentation.

Thanks for helping us build the ultimate Vite asset optimization engine! 🚀
