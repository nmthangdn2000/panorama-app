import { ipcRenderer } from 'electron';
import { KEY_IPC } from '../constants/common.constant';
import { ExportProject, FileType, NewProject, ProjectPanorama } from '../main/project-panorama/type';

export type ProjectPanoramaApi = {
  selectFolder: () => Promise<FileType[] | undefined>;
  newProject: (data: NewProject) => Promise<string>;
  getProjects: () => Promise<ProjectPanorama[]>;
  deleteProject: (name: string) => Promise<boolean>;
  exportProject: (name: string, data: ExportProject) => Promise<boolean>;
  processingProject: (cb: (progressPercentage: number) => void) => void;
  cancelProgress: () => Promise<boolean>;
  getProject: (name: string) => Promise<ProjectPanorama | null>;
};

const selectFolder = () => ipcRenderer.invoke(KEY_IPC.OPEN_DIALOG);
const newProject = (data: NewProject) => ipcRenderer.invoke(KEY_IPC.NEW_PROJECT, data);
const getProjects = () => ipcRenderer.invoke(KEY_IPC.GET_PROJECTS);
const deleteProject = (name: string) => ipcRenderer.invoke(KEY_IPC.DELETE_PROJECT, name);
const exportProject = (name: string, data: ExportProject) => ipcRenderer.invoke(KEY_IPC.EXPORT_PROJECT, name, data);
const processingProject = (cb: (progressPercentage: number) => void) =>
  ipcRenderer.on(KEY_IPC.PROCESSING_PROJECT, (_, progressPercentage: number) => {
    cb(progressPercentage);
  });
const cancelProgress = () => ipcRenderer.invoke(KEY_IPC.CANCEL_PROCESSING_PROJECT);
const getProject = (name: string) => ipcRenderer.invoke(KEY_IPC.GET_PROJECT, name);

export { selectFolder, newProject, getProjects, deleteProject, exportProject, processingProject, cancelProgress, getProject };
