import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  build: {
    // Output goes to a dedicated folder in the backend. emptyOutDir only clears this folder.
    outDir: 'C:/Users/sandi/OneDrive/Documents/Freelance/freelance_demo_projects/agentic-chatbot-be/ui_dist',
    emptyOutDir: true, // required because outDir is outside this project
  },
})
