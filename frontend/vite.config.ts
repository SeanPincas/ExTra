import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ----------------------------------------------
// VITE CONFIGURATION
// ----------------------------------------------
export default defineConfig({
  plugins: [react()],

  server: {
    host: true, // allows access from Docker container

    watch: {
      usePolling: true, // IMPORTANT for Docker live reload
      interval: 1000
    }
  }
})