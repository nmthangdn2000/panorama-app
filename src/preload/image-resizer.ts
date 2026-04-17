import { ipcRenderer } from 'electron';
import { KEY_IPC } from '../constants/common.constant';
import { ResizeOptions } from '../main/image-resizer/handle';

export type ResizeProgressPayload = {
  current: number;
  total: number;
  progress: number;
  file: string;
  outputPath: string | null;
};

export type ResizeResult = {
  success: string[];
  failed: { path: string; error: string }[];
};

export type SelectFolderResult = {
  folderPath: string;
  imagePaths: string[];
};

export type ImageResizerApi = {
  selectImages: () => Promise<string[] | undefined>;
  selectFolder: () => Promise<SelectFolderResult | undefined>;
  selectOutputFolder: () => Promise<string | undefined>;
  resize: (imagePaths: string[], options: ResizeOptions) => Promise<ResizeResult>;
  onProgress: (cb: (payload: ResizeProgressPayload) => void) => void;
  cancel: () => Promise<boolean>;
};

const selectImages = () => ipcRenderer.invoke(KEY_IPC.IMAGE_RESIZER_SELECT_IMAGES);
const selectFolder = () => ipcRenderer.invoke(KEY_IPC.IMAGE_RESIZER_SELECT_FOLDER);
const selectOutputFolder = () => ipcRenderer.invoke(KEY_IPC.IMAGE_RESIZER_SELECT_OUTPUT_FOLDER);
const resize = (imagePaths: string[], options: ResizeOptions) =>
  ipcRenderer.invoke(KEY_IPC.IMAGE_RESIZER_RESIZE, imagePaths, options);
const onProgress = (cb: (payload: ResizeProgressPayload) => void) =>
  ipcRenderer.on(KEY_IPC.IMAGE_RESIZER_PROGRESS, (_, payload: ResizeProgressPayload) => cb(payload));
const cancel = () => ipcRenderer.invoke(KEY_IPC.IMAGE_RESIZER_CANCEL);

export { selectImages, selectFolder, selectOutputFolder, resize, onProgress, cancel };
