import path from 'path';

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  const proxy_url =
    process.env.VITE_DEV_REMOTE === 'remote'
      ? process.env.VITE_BACKEND_SERVER
      : 'http://localhost:8888/';

  const APP_PATH = process.env.VITE_APP_PATH || '';

  const config = {
    plugins: [react()],
    base: APP_PATH || '/',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 3005,
      proxy: {
        [`${APP_PATH}/api`]: {
          target: proxy_url,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(new RegExp(`^${APP_PATH}`), ''),
        },
      },
    },
  };
  return defineConfig(config);
};
