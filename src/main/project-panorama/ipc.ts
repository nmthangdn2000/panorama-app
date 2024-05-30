import { ipcMain } from 'electron';
import { cancelProgress, deleteProject, renderProject, getProject, getProjects, newProject, openDirectory } from './handle';
import { KEY_IPC } from '../../constants/common.constant';
import { RenderProject, NewProject } from './type';

export const register = () => {
  ipcMain.handle(KEY_IPC.OPEN_DIALOG, openDirectory);
  ipcMain.handle(KEY_IPC.NEW_PROJECT, (_, input: NewProject) => newProject(input));
  ipcMain.handle(KEY_IPC.GET_PROJECTS, getProjects);
  ipcMain.handle(KEY_IPC.DELETE_PROJECT, (_, name: string) => deleteProject(name));
  ipcMain.handle(KEY_IPC.RENDER_PROJECT, (_, name: string, data: RenderProject) => renderProject(name, data));
  ipcMain.handle(KEY_IPC.CANCEL_PROCESSING_PROJECT, cancelProgress);
  ipcMain.handle(KEY_IPC.GET_PROJECT, (_, name: string) => getProject(name));
};
