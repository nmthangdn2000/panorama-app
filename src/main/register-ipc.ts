import * as projectPanoramaIpc from './project-panorama/ipc';
import * as settingIpc from './setting/ipc';

export const register = () => {
  projectPanoramaIpc.register();
  settingIpc.register();
};
