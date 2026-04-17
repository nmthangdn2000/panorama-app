import * as projectPanoramaIpc from './project-panorama/ipc';
import * as settingIpc from './setting/ipc';
import * as imageResizerIpc from './image-resizer/ipc';

export const register = () => {
  projectPanoramaIpc.register();
  settingIpc.register();
  imageResizerIpc.register();
};
