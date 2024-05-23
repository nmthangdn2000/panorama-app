import sharp from 'sharp';

export type FileType = {
  name: string;
  path: string;
  base64: string;
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
