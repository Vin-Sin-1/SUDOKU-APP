import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Sudoku',
        short_name: 'Sudoku',
        start_url: '/SUDOKU-APP/',
        display: 'standalone',
        background_color: '#e8f5ef',
        theme_color: '#2e9e6b',
        orientation: 'portrait',
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  base: '/SUDOKU-APP/',
})
