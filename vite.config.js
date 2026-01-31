import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(() => ({
  plugins: [
    vue(),
    viteStaticCopy({
      targets: [
        {
          src: 'assets/scenario/**/*',
          dest: 'scenario',
        },
      ],
    }),
  ],
  base: '/dummy/',
  root: '.', // 既存のプロジェクト直下をルートにする
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/composable': path.resolve(__dirname, './composable'),
      '@/util': path.resolve(__dirname, './util'),
      '@/assets': path.resolve(__dirname, './assets'),
    },
  },
  build: {
    outDir: 'dist', // ビルド後の出力先
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8000', // /api/* を PHP サーバーに転送
    },
  },
}));
