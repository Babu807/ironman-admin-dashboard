import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: "/ironman-admin-dashboard/",
  plugins: [react()],
});
