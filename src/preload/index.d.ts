import { ElectronAPI } from '@electron-toolkit/preload';
import { FileType } from '../main/project-panorama/handle';
import { ProjectPanoramaApi } from './project-panorama';

export type Api = {
  projectPanorama: ProjectPanoramaApi;
};

declare global {
  interface Window {
    electron: ElectronAPI;
    api: Api;
  }
}
