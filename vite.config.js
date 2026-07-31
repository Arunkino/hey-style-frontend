import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            input: {
                main: fileURLToPath(new URL('./index.html', import.meta.url)),
                // Static legal page — built to dist/privacy-policy/index.html
                privacy: fileURLToPath(new URL('./privacy-policy/index.html', import.meta.url)),
                // Static legal page — built to dist/delete-account/index.html
                deleteAccount: fileURLToPath(new URL('./delete-account/index.html', import.meta.url)),
            },
        },
    },
})
