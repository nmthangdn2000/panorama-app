import { ipcMain } from 'electron';
import { cancelProgress, deleteProject, renderProject, getProject, getProjects, newProject, openDialogSelectImages, openDirectory, exportProject, saveProject } from './handle';
import { KEY_IPC } from '../../constants/common.constant';
import { RenderProject, NewProject } from './type';

export const register = () => {
  ipcMain.handle(KEY_IPC.OPEN_DIRECTORY, openDirectory);
  ipcMain.handle(KEY_IPC.OPEN_DIALOG_SELECT_IMAGES, openDialogSelectImages);
  ipcMain.handle(KEY_IPC.NEW_PROJECT, (_, input: NewProject) => newProject(input));
  ipcMain.handle(KEY_IPC.GET_PROJECTS, getProjects);
  ipcMain.handle(KEY_IPC.DELETE_PROJECT, (_, name: string) => deleteProject(name));
  ipcMain.handle(KEY_IPC.RENDER_PROJECT, (_, name: string, sizes: { pc: number; tablet: number; mobile: number } | number, data: RenderProject) => {
    // Backward compatibility: if sizes is a number, convert to object
    if (typeof sizes === 'number') {
      return renderProject(name, { pc: sizes, tablet: sizes, mobile: sizes }, data);
    }
    return renderProject(name, sizes, data);
  });
  ipcMain.handle(KEY_IPC.CANCEL_PROCESSING_PROJECT, cancelProgress);
  ipcMain.handle(KEY_IPC.GET_PROJECT, (_, name: string) => getProject(name));
  ipcMain.handle(KEY_IPC.EXPORT_PROJECT, (_, name: string, pathFolder: string) => exportProject(name, pathFolder));
  ipcMain.on(KEY_IPC.SAVE_PROJECT, (_, name: string, data: RenderProject) => saveProject(name, data));
};
