import { ipcMain } from 'electron';
import { KEY_IPC } from '../../constants/common.constant';
import { getSetting, setSetting } from './handle';

export const register = () => {
  ipcMain.handle(KEY_IPC.SET_SETTINGS, (_, settings) => setSetting(settings));
  ipcMain.handle(KEY_IPC.GET_SETTINGS, () => getSetting());
};
