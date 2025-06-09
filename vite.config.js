import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Agro',
        short_name: 'Agro',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        icons: [
          {
            src: 'agro.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'agro.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
