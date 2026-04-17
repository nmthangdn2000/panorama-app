import * as projectPanoramaIpc from './project-panorama/ipc';
import * as settingIpc from './setting/ipc';
import * as imageResizerIpc from './image-resizer/ipc';
import * as imageCompressorIpc from './image-compressor/ipc';

export const register = () => {
  projectPanoramaIpc.register();
  settingIpc.register();
  imageResizerIpc.register();
  imageCompressorIpc.register();
};
