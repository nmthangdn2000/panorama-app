import { ElectronAPI } from '@electron-toolkit/preload';
import { ProjectPanoramaApi } from './project-panorama';
import { PanoramaDataType, PanoramaLocationType } from '../renderer/pages/project-panorama/detail/lib-panorama/panorama.type';
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
    locations: PanoramaLocationType[];
    projectRemove: ProjectPanorama;
    onRemovePanorama: (id: string) => void;
    viewerPanorama: Panorama | undefined;
    onEditTitlePanorama: (element: HTMLButtonElement, id: string) => void;
    onSaveTitlePanorama: (id: string) => void;
    onSelectOption: (locationId: string, optionId: string) => void;
    onRemoveLocation: (locationId: string) => void;
    onRemoveOption: (locationId: string, optionId: string) => void;
    onAddOption: (locationId: string) => void;
    onSetDefaultOption: (locationId: string, optionId: string) => void;
    onEditLocationName: (locationId: string) => void;
    onEditPanoramaTitle: (locationId: string, optionId: string) => void;
    onCancelDeleteProject: () => void;
    removeMarkerLocationHTML: (element: HTMLElement) => void;
    clickMarkerLocation: (element: HTMLElement) => void;
    onClickItemMapMini: (src: string) => void;
    removeItemMiniMap: (element: Element, src: string) => void;
  }
  interface HTMLElementEventMap {
    'panorama-changed': CustomEvent<{ panorama: PanoramaDataType; action: 'change-texture' | 'change-panorama' }>;
  }
}
