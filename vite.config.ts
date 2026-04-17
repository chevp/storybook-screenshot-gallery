import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    port: 4200,
    strictPort: true,
  },
  preview: {
    port: 4200,
    strictPort: true,
  },
});