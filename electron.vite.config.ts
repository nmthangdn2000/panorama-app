import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import { resolve } from 'path';

const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'src/main/index.ts'),
          worker: resolve(__dirname, 'src/main/project-panorama/worker.ts'),
        },
        output: {
          entryFileNames: (chunkInfo) => {
            if (chunkInfo.name === 'worker') {
              return 'worker.js';
            }
            return 'index.js';
          },
          chunkFileNames: (chunkInfo) => {
            if (chunkInfo.name === 'worker') {
              return 'worker.js';
            }
            return 'index.js';
          },
          manualChunks: (id) => {
            if (id.includes('worker.ts')) {
              return 'worker';
            }
            return 'index';
          },
        },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: isDev
    ? {}
    : {
        root: '.',
        build: {
          rollupOptions: {
            input: {
              index: resolve(__dirname, 'src/renderer/index.html'),
              project: resolve(__dirname, 'src/renderer/pages/project-panorama/index.html'),
              detailProject: resolve(__dirname, 'src/renderer/pages/project-panorama/detail/index.html'),
              settings: resolve(__dirname, 'src/renderer/pages/settings/index.html'),
            },
          },
        },
      },
});
