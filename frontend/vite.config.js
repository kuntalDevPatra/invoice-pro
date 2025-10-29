import path from 'path';

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  // backend URL used for proxying in remote mode
  const proxy_url = process.env.VITE_BACKEND_SERVER || 'http://localhost:8888/';
  const isProd = process.env.PROD === 'true' || process.env.NODE_ENV === 'production';

  // app path (if your app is served under a subpath). Fixed env var name.
  const APP_PATH = process.env.VITE_APP_PATH || '';
  // Vite cache directory: set VITE_CACHE_DIR to override (use a path writable by CI user)
  const CACHE_DIR = process.env.VITE_CACHE_DIR || '.vite';
  const HOST = process.env.VITE_HOST || '127.0.0.1';
  const PORT = parseInt(process.env.VITE_PORT, 10) || 3005;

  const config = {
    plugins: [react()],
    base: APP_PATH || '/',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      host: HOST,
      port: PORT,
      allowedHosts: ['invoice.reddensoft.com'],
      proxy: APP_PATH
        ? {
            [`${APP_PATH}/api`]: {
              target: proxy_url,
              changeOrigin: true,
              secure: false,
            },
          }
        : undefined,
    },
    // Put Vite cache outside node_modules by default to avoid permission issues in CI
    cacheDir: CACHE_DIR,
    preview: {
      host: HOST,
      // host: '0.0.0.0',
      port: 3005,
    },
  };
  return defineConfig(config);
};
