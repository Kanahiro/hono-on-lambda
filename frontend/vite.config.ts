import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    define: {
        global: {},
    },
    server: {
        proxy: {
            '^/api/.*':
                'https://4ohztfdxknxk3mnxt5462p7xsq0txsxb.lambda-url.ap-northeast-1.on.aws/name/Kanahiro',
        },
    },
});
