import { ipcRenderer } from 'electron';
import { KEY_IPC } from '../constants/common.constant';
import { ExportProject, FileType, NewProject, ProjectPanorama } from '../main/project-panorama/type';

export type ProjectPanoramaApi = {
  selectFolder: () => Promise<FileType[] | undefined>;
  newProject: (data: NewProject) => Promise<string>;
  getProjects: () => Promise<ProjectPanorama[]>;
  deleteProject: (name: string) => Promise<boolean>;
  exportProject: (name: string, data: ExportProject) => Promise<boolean>;
};

const selectFolder = () => ipcRenderer.invoke(KEY_IPC.OPEN_DIALOG);
const newProject = (data: NewProject) => ipcRenderer.invoke(KEY_IPC.NEW_PROJECT, data);
const getProjects = () => ipcRenderer.invoke(KEY_IPC.GET_PROJECTS);
const deleteProject = (name: string) => ipcRenderer.invoke(KEY_IPC.DELETE_PROJECT, name);
const exportProject = (name: string, data: ExportProject) => ipcRenderer.invoke(KEY_IPC.EXPORT_PROJECT, name, data);

export { selectFolder, newProject, getProjects, deleteProject, exportProject };
