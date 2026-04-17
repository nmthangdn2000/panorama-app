import { ipcRenderer } from 'electron';
import { KEY_IPC } from '../constants/common.constant';
import { CompressOptions, CompressProgressPayload } from '../main/image-compressor/handle';

export type { CompressProgressPayload };

export type CompressResult = {
  success: number;
  failed: number;
};

export type SelectFolderResult = {
  folderPath: string;
  imagePaths: string[];
};

export type ImageCompressorApi = {
  selectImages: () => Promise<string[] | undefined>;
  selectFolder: () => Promise<SelectFolderResult | undefined>;
  selectOutputFolder: () => Promise<string | undefined>;
  compress: (imagePaths: string[], options: CompressOptions) => Promise<CompressResult>;
  onProgress: (cb: (payload: CompressProgressPayload) => void) => void;
  cancel: () => Promise<boolean>;
};

const selectImages = () => ipcRenderer.invoke(KEY_IPC.IMAGE_COMPRESSOR_SELECT_IMAGES);
const selectFolder = () => ipcRenderer.invoke(KEY_IPC.IMAGE_COMPRESSOR_SELECT_FOLDER);
const selectOutputFolder = () => ipcRenderer.invoke(KEY_IPC.IMAGE_COMPRESSOR_SELECT_OUTPUT_FOLDER);
const compress = (imagePaths: string[], options: CompressOptions) =>
  ipcRenderer.invoke(KEY_IPC.IMAGE_COMPRESSOR_COMPRESS, imagePaths, options);
const onProgress = (cb: (payload: CompressProgressPayload) => void) =>
  ipcRenderer.on(KEY_IPC.IMAGE_COMPRESSOR_PROGRESS, (_, payload: CompressProgressPayload) => cb(payload));
const cancel = () => ipcRenderer.invoke(KEY_IPC.IMAGE_COMPRESSOR_CANCEL);

export { selectImages, selectFolder, selectOutputFolder, compress, onProgress, cancel };
