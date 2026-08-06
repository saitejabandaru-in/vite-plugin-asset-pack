import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { assetPackPlugin } from 'vite-plugin-asset-pack'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    assetPackPlugin({ compressImages: true })
  ],
})
