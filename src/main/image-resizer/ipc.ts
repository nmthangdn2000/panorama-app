import { ipcMain } from 'electron';
import { KEY_IPC } from '../../constants/common.constant';
import { cancelResize, resizeImages, selectImagesForResize, selectFolderForResize, selectOutputFolder, ResizeOptions } from './handle';

export const register = () => {
  ipcMain.handle(KEY_IPC.IMAGE_RESIZER_SELECT_IMAGES, selectImagesForResize);
  ipcMain.handle(KEY_IPC.IMAGE_RESIZER_SELECT_FOLDER, selectFolderForResize);
  ipcMain.handle(KEY_IPC.IMAGE_RESIZER_SELECT_OUTPUT_FOLDER, selectOutputFolder);
  ipcMain.handle(KEY_IPC.IMAGE_RESIZER_RESIZE, (event, imagePaths: string[], options: ResizeOptions) =>
    resizeImages(event, imagePaths, options)
  );
  ipcMain.handle(KEY_IPC.IMAGE_RESIZER_CANCEL, cancelResize);
};
