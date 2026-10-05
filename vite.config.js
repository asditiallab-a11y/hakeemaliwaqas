import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const root = path.dirname(fileURLToPath(import.meta.url))

// Galat jagah bane node_modules (public/ ya adminPanel/ ke andar) pakad kar saaf warning dikhata hai.
// public/node_modules hone par Vite bootstrap.css / env.mjs ko raw serve karta tha -> white screen.
// Ab static files 'site-public' se aati hain, to ye masla nahi hoga, phir bhi ye folders delete kar do.
for (const stray of ['public/node_modules', 'adminPanel/node_modules']) {
  if (fs.existsSync(path.join(root, stray))) {
    console.warn(`\n[hikmat] WARNING: "${stray}" mojood hai - isay delete kar do (npm install sirf root mein chalta hai).\n`)
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Static files (images, favicon) yahan se serve hoti hain. 'public' naam jaan boojh kar nahi rakha,
  // taake purana bacha hua public/node_modules kabhi serve na ho.
  publicDir: 'site-public',
  resolve: {
    // adminPanel/node_modules mein purani React (18) ho to bhi hamesha root wali ek hi copy istemal ho
    dedupe: ['react', 'react-dom', 'react-router-dom', 'lucide-react'],
  },
  // React se /api/... likhne par request backend (server/, port 5000) ko chali jati hai
  server: {
    proxy: { '/api': 'http://localhost:5000' },
  },
  // Admin panel lazy-load hota hai, to uski libraries dev server ko late milti thin aur
  // "504 Outdated Optimize Dep" aata tha. Yahan pehle se list kar di hain taake start par hi
  // pre-bundle ho jayen.
  optimizeDeps: {
    entries: ['index.html', 'adminPanel/AdminApp.jsx'],
    include: [
      'react',
      'react-dom/client',
      'react-router-dom',
      'lucide-react',
      'react-icons/fa',
    ],
  },
})
