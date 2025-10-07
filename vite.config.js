import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react({
            babel: {
                plugins: [['babel-plugin-react-compiler']],
            },
        }),
    ],
    resolve: {
        alias: {
            "@": path.resolve(import.meta.dirname, "client", "src"),
            "@shared": path.resolve(import.meta.dirname, "shared"),
        },
    },
    root: path.resolve(import.meta.dirname, "client"),
    build: {
        outDir: path.resolve(import.meta.dirname, "dist/public"),
        emptyOutDir: true,
    },
    server: {
        host: "0.0.0.0",
        port: 5000,
        fs: {
            strict: true,
            deny: ["**/.*"],
        },
    },
})