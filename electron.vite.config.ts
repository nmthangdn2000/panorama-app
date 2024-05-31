import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import { resolve } from 'path';

const isDev = process.env.NODE_ENV === 'development';

console.log('isDev', isDev);

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
            },
          },
        },
      },
});
