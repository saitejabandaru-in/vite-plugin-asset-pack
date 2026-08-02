# Getting Started

## Installation

Install the plugin using your favorite package manager:

```bash
npm install vite-plugin-asset-pack -D
```

## Setup

Add it to your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import { assetPackPlugin } from 'vite-plugin-asset-pack';

export default defineConfig({
  plugins: [
    assetPackPlugin({
      minifySvg: true,
      inlineLimit: 4096
    })
  ]
});
```

And that's it! Your assets are now optimized at build time.
