import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  server: {
    host: true, // Listen on all local IPs (0.0.0.0) as well as localhost
    port: 3030,
    strictPort: true,
  },
  resolve: {
    alias: {
      buffer: 'buffer/',
    },
  },
});
