import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "@/components": path.resolve(__dirname, "./components"),
      "@/utils": path.resolve(__dirname, "./utils"),
      "@/styles": path.resolve(__dirname, "./styles"),
      "@/contexts": path.resolve(__dirname, "./contexts"),
      "@/services": path.resolve(__dirname, "./services"),
    },
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      // Development-only proxy to Supabase Edge Functions to avoid browser CORS
      '/sbfunc': {
        target: (process.env.VITE_SUPABASE_URL || 'https://qudatjeaebentuiywftz.supabase.co') + '/functions/v1',
        changeOrigin: true,
        rewrite: (pathStr) => pathStr.replace(/^\/sbfunc/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // Add anon key if provided so requests work without manual headers
            if (process.env.VITE_SUPABASE_ANON_KEY) {
              proxyReq.setHeader('Authorization', `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`)
            }
          });
        }
      }
    }
  },
})
