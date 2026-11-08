import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Requests to /api go to the Express backend.
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});