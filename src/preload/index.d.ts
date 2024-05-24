import { ElectronAPI } from '@electron-toolkit/preload';
import { FileType } from '../main/project-panorama/handle';
import { ProjectPanoramaApi } from './project-panorama';
import { PanoramaDataType } from '../renderer/pages/project-panorama/detail/lib-panorama/panorama.type';
import { ProjectPanorama } from '../main/project-panorama/type';

export type Api = {
  projectPanorama: ProjectPanoramaApi;
};

declare global {
  interface Window {
    electron: ElectronAPI;
    api: Api;
    onMarkerClick: (id: number, markerId: string) => void;
    panoramas: PanoramaDataType[];
    panoramasImport: PanoramaDataType[];
    projectRemove: ProjectPanorama;
    onRemovePanorama: (id: number) => void;
  }
}
