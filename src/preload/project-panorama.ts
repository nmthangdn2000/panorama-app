import { ipcRenderer } from 'electron';
import { KEY_IPC } from '../constants/common.constant';
import { RenderProject, FileType, NewProject, ProjectPanorama } from '../main/project-panorama/type';

export type ProjectPanoramaApi = {
  openDirectory: () => Promise<string | undefined>;
  selectImages: () => Promise<FileType[] | undefined>;
  newProject: (data: NewProject) => Promise<string>;
  getProjects: () => Promise<ProjectPanorama[]>;
  deleteProject: (name: string) => Promise<boolean>;
  renderProject: (name: string, size: number | { pc: number; tablet: number; mobile: number }, data: RenderProject) => Promise<boolean>;
  processingProject: (cb: (progressPercentage: number) => void) => void;
  cancelProgress: () => Promise<boolean>;
  getProject: (name: string) => Promise<ProjectPanorama | null>;
  exportProject: (name: string, pathFolder: string) => Promise<boolean>;
  saveProject: (name: string, data: RenderProject) => void;
};

const openDirectory = () => ipcRenderer.invoke(KEY_IPC.OPEN_DIRECTORY);
const selectImages = () => ipcRenderer.invoke(KEY_IPC.OPEN_DIALOG_SELECT_IMAGES);
const newProject = (data: NewProject) => ipcRenderer.invoke(KEY_IPC.NEW_PROJECT, data);
const getProjects = () => ipcRenderer.invoke(KEY_IPC.GET_PROJECTS);
const deleteProject = (name: string) => ipcRenderer.invoke(KEY_IPC.DELETE_PROJECT, name);
const renderProject = (name: string, size: number | { pc: number; tablet: number; mobile: number }, data: RenderProject) => ipcRenderer.invoke(KEY_IPC.RENDER_PROJECT, name, size, data);
const processingProject = (cb: (progressPercentage: number) => void) =>
  ipcRenderer.on(KEY_IPC.PROCESSING_PROJECT, (_, progressPercentage: number) => {
    cb(progressPercentage);
  });
const cancelProgress = () => ipcRenderer.invoke(KEY_IPC.CANCEL_PROCESSING_PROJECT);
const getProject = (name: string) => ipcRenderer.invoke(KEY_IPC.GET_PROJECT, name);
const exportProject = (name: string, pathFolder: string) => ipcRenderer.invoke(KEY_IPC.EXPORT_PROJECT, name, pathFolder);
const saveProject = (name: string, data: RenderProject) => ipcRenderer.send(KEY_IPC.SAVE_PROJECT, name, data);

export { openDirectory, selectImages, newProject, getProjects, deleteProject, renderProject, processingProject, cancelProgress, getProject, exportProject, saveProject };
