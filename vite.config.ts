import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProduction = mode === 'production'

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env.VITE_APP_ENV': JSON.stringify(env.VITE_APP_ENV || mode),
    },
    build: {
      sourcemap: !isProduction,
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
    envDir: '.',
    envPrefix: 'VITE_',
    server: {
      port: 3000,
      host: true,
    },
    preview: {
      port: 4173,
      host: true,
    },
  }
})
