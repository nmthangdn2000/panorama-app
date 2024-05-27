import sharp = require('sharp');
import { PanoramaDataType } from '../../renderer/pages/project-panorama/detail/lib-panorama/panorama.type';

export type FileType = {
  name: string;
  path: string;
  metadata: sharp.Metadata;
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
};

export type ExportProject = {
  panoramas: PanoramaDataType[];
  panoramasImport: PanoramaDataType[];
};
