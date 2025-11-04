import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: import.meta.env.VITE_BUILD_ENV === "server" ? "./" : "/ironman-admin-dashboard/",
  plugins: [react()],
})
