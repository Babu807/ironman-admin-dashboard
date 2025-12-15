import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: "/",
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: [
      'untampered-kareem-radiative.ngrok-free.dev',
    ],
  },
})
