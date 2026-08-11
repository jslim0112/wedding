import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base must match the GitHub Pages repo name, or the deployed site loads as a
// blank white page. If you later point a custom domain at it, change this to '/'.
export default defineConfig({
  base: '/wedding/',
  plugins: [react(), tailwindcss()],
})
