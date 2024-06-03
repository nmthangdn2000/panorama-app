import { PanoramaDataType } from '../../renderer/pages/project-panorama/detail/lib-panorama/panorama.type';

export type FileType = {
  name: string;
  path: string;
  metadata: {
    width: number;
    height: number;
  }
};

export type NewProject = {
  name: string;
  description?: string;
  avatar: {
    name: string;
    path: string;
  };
};

export type ProjectPanorama = {
  name: string;
  avatar: string;
  description?: string;
  panoramas?: PanoramaDataType[];
  panoramasImport?: PanoramaDataType[];
  imagesQuality?: string[];
  imagesLow?: string[];
  hasCube?: boolean;
};

export type RenderProject = {
  panoramas: PanoramaDataType[];
  panoramasImport: PanoramaDataType[];
};
