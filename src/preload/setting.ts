import { ipcRenderer } from 'electron';
import { Setting } from '../main/setting/type';
import { KEY_IPC } from '../constants/common.constant';

export type SettingApi = {
  setSetting: (settings: Setting) => Promise<boolean>;
  getSetting: () => Promise<Setting>;
};

const setSetting = (settings: Setting) => ipcRenderer.invoke(KEY_IPC.SET_SETTINGS, settings);
const getSetting = () => ipcRenderer.invoke(KEY_IPC.GET_SETTINGS);

export { setSetting, getSetting };
