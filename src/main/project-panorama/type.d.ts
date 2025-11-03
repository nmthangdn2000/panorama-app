import { PanoramaDataType, PanoramaLocationType, DataVirtualTourType } from '../../renderer/pages/project-panorama/detail/lib-panorama/panorama.type';

export type FileType = {
  name: string;
  path: string;
  metadata: {
    width: number;
    height: number;
  };
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
  locations?: PanoramaLocationType[] | DataVirtualTourType; // Can be old structure (array) or new structure (DataVirtualTourType)
  panoramasImport?: PanoramaDataType[];
  imagesQuality?: string[];
  imagesLow?: string[];
  hasCube?: boolean;
  pathFolder: string;
};

export type RenderProject = {
  panoramas?: PanoramaDataType[];
  locations?: PanoramaLocationType[] | DataVirtualTourType; // Can be old structure (array) or new structure (DataVirtualTourType)
};
