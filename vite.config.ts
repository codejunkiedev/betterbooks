import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')

  const isProduction = mode === 'production'
  const isDevelopment = mode === 'development'

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Environment-specific configuration
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env.VITE_APP_ENV': JSON.stringify(env.VITE_APP_ENV || mode),
    },
    // Build configuration
    build: {
      sourcemap: isDevelopment,
      minify: isProduction,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-label'],
          },
        },
      },
    },
    // Environment file loading
    envDir: '.',
    envPrefix: 'VITE_',
    // Development server configuration
    server: {
      port: 3000,
      host: true,
    },
    // Preview server configuration
    preview: {
      port: 4173,
      host: true,
    },
  }
})
