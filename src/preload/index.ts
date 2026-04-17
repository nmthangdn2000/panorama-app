import { contextBridge } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import { Api } from './type';
import * as projectPanorama from './project-panorama';
import * as setting from './setting';
import * as imageResizer from './image-resizer';
import * as imageCompressor from './image-compressor';

// Custom APIs for renderer
const api: Api = {
  projectPanorama,
  setting,
  imageResizer,
  imageCompressor,
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
