import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import { resolve } from 'path';

const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
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
