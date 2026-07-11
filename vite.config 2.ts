import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-*.png', 'robots.txt', 'sitemap.xml', '_headers', '.htaccess', 'vercel.json'],
      manifest: false, // Use our custom manifest.json
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  base: './',
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    reportCompressedSize: false, // Disable to speed up build
    chunkSizeWarningLimit: 500, // Stricter limit
    sourcemap: false,
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React - keep small and separate
          if (id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/') || 
              id.includes('node_modules/scheduler/')) {
            return 'react';
          }
          
          // React Router - separate chunk
          if (id.includes('node_modules/react-router') || 
              id.includes('node_modules/@remix-run')) {
            return 'router';
          }
          
          // Chart.js - only load when needed
          if (id.includes('node_modules/chart.js') || 
              id.includes('node_modules/react-chartjs-2')) {
            return 'charts';
          }
          
          // DnD Kit - only for control center
          if (id.includes('node_modules/@dnd-kit')) {
            return 'dnd';
          }

          // Framer Motion - separate chunk
          if (id.includes('node_modules/framer-motion')) {
            return 'motion';
          }
          
          // Lucide Icons - split by usage frequency
          if (id.includes('node_modules/lucide-react')) {
            // Common icons used everywhere
            if (id.includes('activity') || id.includes('settings') || 
                id.includes('chevron') || id.includes('x')) {
              return 'icons-common';
            }
            // Monitoring specific icons
            if (id.includes('bar-chart') || id.includes('trending') || 
                id.includes('alert') || id.includes('clock')) {
              return 'icons-monitoring';
            }
            // Network specific icons
            if (id.includes('network') || id.includes('router') || 
                id.includes('cloud') || id.includes('server')) {
              return 'icons-network';
            }
            return 'icons-other';
          }
          
          // Zustand - small, can be with main bundle
          if (id.includes('node_modules/zustand')) {
            return 'store';
          }
          
          // Feature-based chunks - more granular
          if (id.includes('/src/components/monitoring/')) {
            if (id.includes('/charts/') || id.includes('/metrics/')) {
              return 'monitoring-charts';
            }
            if (id.includes('/mobile/')) {
              return 'monitoring-mobile';
            }
            return 'monitoring';
          }
          
          if (id.includes('/src/components/wizard/')) {
            return 'wizard';
          }
          
          if (id.includes('/src/components/network-designer/')) {
            return 'network-designer';
          }
          
          if (id.includes('/src/components/configure/')) {
            return 'configure';
          }
          
          if (id.includes('/src/components/control-center/')) {
            return 'control-center';
          }
          
          if (id.includes('/src/components/group')) {
            return 'groups';
          }
          
          // Keep connection components with main bundle as they're used frequently
          // Other vendor code
          if (id.includes('node_modules/')) {
            return 'vendor';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Enable more aggressive minification
  },
  server: {
    fs: {
      strict: true
    }
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      'zustand'
    ],
    exclude: [
      'chart.js', 
      'react-chartjs-2',
      'framer-motion', // Let this be dynamically imported
      '@dnd-kit/core',
      '@dnd-kit/sortable'
    ]
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    // Remove unused imports
    treeShaking: true
  }
}));