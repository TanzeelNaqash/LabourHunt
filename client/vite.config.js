import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, dirname(fileURLToPath(import.meta.url)), '')
  const gatewayUrl = env.VITE_GATEWAY_URL  
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: gatewayUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(dirname(fileURLToPath(import.meta.url)), './src'),
      },
    },
  }
})