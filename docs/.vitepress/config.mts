import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Asset Pack",
  description: "Ultra-fast, zero-dependency Vite plugin for build-time SVG minification and asset optimization.",
  base: "/vite-plugin-asset-pack/",
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' }
    ],
    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Configuration', link: '/guide/configuration' }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/saitejabandaru-in/vite-plugin-asset-pack' }
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026-present Saiteja Bandaru'
    }
  }
})
