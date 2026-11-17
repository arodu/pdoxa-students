
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Carga las variables de entorno para poder leer VITE_API_BASE_URL aquí mismo
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: process.env.VITE_BASE_PATH || '/',
    server: {
      proxy: {
        '/api': {
          // Si definiste una URL en tu .env la usa; si no, usa la oficial por defecto
          target: env.VITE_API_BASE_URL || 'https://pdoxa.arodu.dev',
          changeOrigin: true,
        }
      }
    },
    plugins: [vue()],
    test: {
      environment: 'happy-dom',
      include: ['src/**/*.{test,spec}.js'],
      exclude: ['node_modules/**', 'public/**', 'dist/**'],
    },
  }
})