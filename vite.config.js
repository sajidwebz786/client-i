import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['client-i.onrender.com']
  },
  preview: {
    allowedHosts: ['client-i.onrender.com']
  }
});
