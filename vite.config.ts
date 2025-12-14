import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Exposes the process.env.API_KEY from the build environment (Netlify) to the client code
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});