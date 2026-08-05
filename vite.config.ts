import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base: './' — относительные пути к ассетам, чтобы сборка работала
// на GitHub Pages под любым именем репозитория без правки конфига.
export default defineConfig({
  base: './',
  plugins: [react()],
})
