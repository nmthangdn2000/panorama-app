import { dialog } from 'electron';
import { getFiles } from '../panorama/panorama';

export const openDirectory = async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });

  if (canceled) return;

  const files = await getFiles(filePaths[0]);

  return files;
};
