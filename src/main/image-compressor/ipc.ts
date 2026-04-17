import { ipcMain } from 'electron';
import { KEY_IPC } from '../../constants/common.constant';
import {
  cancelCompress,
  compressImages,
  selectFolderForCompress,
  selectImagesForCompress,
  selectOutputFolder,
  CompressOptions,
} from './handle';

export const register = () => {
  ipcMain.handle(KEY_IPC.IMAGE_COMPRESSOR_SELECT_IMAGES, selectImagesForCompress);
  ipcMain.handle(KEY_IPC.IMAGE_COMPRESSOR_SELECT_FOLDER, selectFolderForCompress);
  ipcMain.handle(KEY_IPC.IMAGE_COMPRESSOR_SELECT_OUTPUT_FOLDER, selectOutputFolder);
  ipcMain.handle(KEY_IPC.IMAGE_COMPRESSOR_COMPRESS, (event, imagePaths: string[], options: CompressOptions) =>
    compressImages(event, imagePaths, options)
  );
  ipcMain.handle(KEY_IPC.IMAGE_COMPRESSOR_CANCEL, cancelCompress);
};
