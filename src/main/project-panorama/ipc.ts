import { ipcMain } from 'electron';
import { cancelProgress, deleteProject, exportProject, getProject, getProjects, newProject, openDirectory } from './handle';
import { KEY_IPC } from '../../constants/common.constant';
import { ExportProject, NewProject } from './type';

export const register = () => {
  ipcMain.handle(KEY_IPC.OPEN_DIALOG, openDirectory);
  ipcMain.handle(KEY_IPC.NEW_PROJECT, (_, input: NewProject) => newProject(input));
  ipcMain.handle(KEY_IPC.GET_PROJECTS, getProjects);
  ipcMain.handle(KEY_IPC.DELETE_PROJECT, (_, name: string) => deleteProject(name));
  ipcMain.handle(KEY_IPC.EXPORT_PROJECT, (_, name: string, data: ExportProject) => exportProject(name, data));
  ipcMain.handle(KEY_IPC.CANCEL_PROCESSING_PROJECT, cancelProgress);
  ipcMain.handle(KEY_IPC.GET_PROJECT, (_, name: string) => getProject(name));
};
