import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
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
    },
});
