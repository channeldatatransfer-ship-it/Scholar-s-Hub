
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set base to './' to allow the app to work on any GitHub Pages URL
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
    emptyOutDir: true
  }
});
