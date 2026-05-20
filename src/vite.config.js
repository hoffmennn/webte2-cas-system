import { defineConfig, loadEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
    base: env.VITE_BASE_PATH || '/',
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/main.jsx'],
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    optimizeDeps: {
        include: ['react-simple-code-editor'],
    },
    server: {
        host: 'localhost',
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
    };
});
