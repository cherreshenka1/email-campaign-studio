import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/email-campaign-studio/',
  plugins: [react()],
})
