import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Configurações explícitas para garantir suporte a import.meta.env (ES2020+)
  esbuild: {
    supported: {
      'top-level-await': true //browsers can handle top-level-await features
    },
    target: 'es2020'
  },
  build: {
    target: 'es2020'
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
    },
  },
})