import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { assetPackPlugin } from 'vite-plugin-asset-pack'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    assetPackPlugin({ compressImages: true })
  ],
})
