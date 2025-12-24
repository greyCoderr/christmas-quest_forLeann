import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages tip:
// - With `base: './'`, the built site uses relative asset paths and works on GitHub Pages
//   regardless of the repo name.
export default defineConfig({
  plugins: [react()],
  base: './',
})
