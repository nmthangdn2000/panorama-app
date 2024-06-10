import { ElectronAPI } from '@electron-toolkit/preload';
import { ProjectPanoramaApi } from './project-panorama';
import { PanoramaDataType } from '../renderer/pages/project-panorama/detail/lib-panorama/panorama.type';
import { ProjectPanorama } from '../main/project-panorama/type';
import { Panorama } from '../renderer/pages/project-panorama/detail/lib-panorama';
import { SettingApi } from './setting';

export type Api = {
  projectPanorama: ProjectPanoramaApi;
  setting: SettingApi;
};

declare global {
  interface Window {
    electron: ElectronAPI;
    api: Api;
    pathProject: string;
    onMarkerClick: (id: string, markerId: string) => void;
    panoramas: PanoramaDataType[];
    projectRemove: ProjectPanorama;
    onRemovePanorama: (id: string) => void;
    viewerPanorama: Panorama | undefined;
    onEditTitlePanorama: (element: HTMLButtonElement, id: string) => void;
    onSaveTitlePanorama: (id: string) => void;
    onCancelDeleteProject: () => void;
    removeMarkerLocationHTML: (element: HTMLElement) => void;
    clickMarkerLocation: (element: HTMLElement) => void;
    onClickItemMapMini: (src: string) => void;
    removeItemMiniMap: (element: Element, src: string) => void;
  }
}
