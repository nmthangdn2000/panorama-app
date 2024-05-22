import { ElectronAPI } from '@electron-toolkit/preload';
import { FileType } from '../main/panorama/panorama.d';

export type Api = {
  selectFolder: () => Promise<FileType[] | undefined>;
};

declare global {
  interface Window {
    electron: ElectronAPI;
    api: Api;
  }
}
