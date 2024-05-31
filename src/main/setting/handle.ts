import { join } from 'path';
import { Setting } from './type';
import { readFileSync, writeFileSync, existsSync } from 'fs';

export const pathSetting = join(process.cwd(), 'setting.json');

export const setSetting = async (setting: Setting) => {
  writeFileSync(pathSetting, JSON.stringify(setting, null, 2));

  return true;
};

export const getSetting = async (): Promise<Setting | undefined> => {
  // check is file exists
  if (!existsSync(pathSetting)) {
    return undefined;
  }

  const setting = readFileSync(pathSetting, 'utf-8');

  return JSON.parse(setting);
};
