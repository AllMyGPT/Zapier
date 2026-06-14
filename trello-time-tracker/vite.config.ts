import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'popups/login.html'),
        timer: resolve(__dirname, 'popups/timer.html'),
        history: resolve(__dirname, 'popups/history.html'),
      },
    },
  },
  server: {
    port: 5173,
    // Allow all hosts for ngrok tunneling
    allowedHosts: 'all',
  },
})
