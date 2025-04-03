import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      host: true,
      port: parseInt(env.VITE_FRONTEND_PORT || '5173'),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@assets': path.resolve(__dirname, './src/assets')
      }
    },
    define: {
      'process.env': env
    }
  }
})
