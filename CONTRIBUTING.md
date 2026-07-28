# Contributing to vite-plugin-asset-pack

First off, thank you for considering contributing to `vite-plugin-asset-pack`! It's people like you that make open-source such a great community.

## 🛠️ Local Development Setup

1. **Fork & Clone** the repository to your local machine.
2. **Install Dependencies** (we use npm):
   ```bash
   npm install
   ```
3. **Run the Test Suite** to ensure everything is working:
   ```bash
   npm test
   ```
   > We use `vitest` for blazing-fast unit tests. Our goal is 100% test coverage for the SVG minifier engine.

4. **Run the Typechecker**:
   ```bash
   npm run typecheck
   ```

## 🏗️ Project Architecture

* `src/index.ts`: Contains the core Vite plugin logic, the regex-based zero-dependency SVG minifier, and the data URI converter.
* `src/index.test.ts`: Contains all the unit tests. Please add a test if you fix a bug or add a feature!
* `dist/`: The output folder (automatically generated via `tsup`).

## 📥 Pull Request Process

1. Create a descriptive branch name (e.g., `feat/webp-support` or `fix/inkscape-metadata-regex`).
2. Implement your feature or bug fix.
3. Ensure all tests pass (`npm test`) and typechecks clear (`npm run typecheck`).
4. Update the `README.md` if your changes introduce new configuration options.
5. Submit your PR! We try to review all pull requests within 48 hours.

## 💡 What We Are Looking For

* **Asset Optimization:** Enhancements to SVG minification, or safe strategies for optimizing other asset types *without adding external dependencies*.
* **Zero Runtime Dependencies:** We strictly enforce a zero-dependency architecture. Please do not add packages to `dependencies` (only `devDependencies` are allowed).
* **Test Coverage:** Every bug fix must include a test case that reproduces the original issue.

Thanks for helping us keep builds fast and asset sizes small! 🚀
