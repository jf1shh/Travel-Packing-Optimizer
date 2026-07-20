import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Injected at build time only (the dev server needs inline scripts for HMR).
// 'wasm-unsafe-eval' is required by onnxruntime (background removal);
// staticimgly.com hosts the background-removal model assets.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' data: blob: https://geocoding-api.open-meteo.com https://api.open-meteo.com https://archive-api.open-meteo.com https://staticimgly.com https://api.frankfurter.dev https://www.gov.uk https://nominatim.openstreetmap.org",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'"
].join('; ')

const cspPlugin = () => ({
  name: 'inject-csp',
  apply: 'build',
  transformIndexHtml(html) {
    return html.replace(
      '<head>',
      `<head>\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`
    )
  }
})

export default defineConfig({
  // GitHub Pages serves from a subpath; the Capacitor WebView serves the
  // same dist/ from its root, so the Android build needs a relative base
  // (an absolute /Travel-Packing-Optimizer/ base 404s every asset in the APK).
  base: process.env.CAPACITOR ? './' : '/Travel-Packing-Optimizer/',
  plugins: [
    react(),
    cspPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        // zxing_reader.wasm (~1 MB): the barcode-decoder fallback must work
        // offline. Deliberately NOT a blanket **/*.wasm — that would sweep in
        // onnxruntime's 23.9 MB binary and break the service-worker build.
        globPatterns: ['**/*.{js,css,html,ico,png,svg}', '**/zxing_reader*.wasm']
      },
      manifest: {
        name: 'Travel Packing Optimizer',
        short_name: 'Packer',
        description: 'Mathematical capsule wardrobe and packing list optimizer.',
        theme_color: '#1a1a1a',
        background_color: '#1a1a1a',
        display: 'standalone',
        icons: [
          {
            src: 'favicon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  test: {
    // Playwright e2e specs also match *.spec.js -- exclude that directory
    // so vitest doesn't try to run them (different globals/API entirely).
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
})
