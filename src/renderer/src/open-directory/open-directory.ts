import { WINDOW } from '../../common/constant';
import { viewerPanorama } from '../render-panorama/render-panorama';
import { itemImagePanorama } from './html';

WINDOW.panoramas = [];

const openDirectory = () => {
  document.getElementById('btn-open-dialog')!.addEventListener('click', async () => {
    const folderPath = await window.api.selectFolder();

    if (!folderPath) return;

    if (viewerPanorama) viewerPanorama.viewer.destroy();

    document.getElementById('btn-render-panorama')!.removeAttribute('disabled');

    const imagePanoramaContainer = document.getElementById(
      'image-panorama-container',
    )! as HTMLDivElement;

    const html = folderPath.map((path, index) => {
      WINDOW.panoramas.push({
        id: index + 1,
        title: path.name,
        pointPosition: { bottom: '50%', left: '50%' },
        cameraPosition: { yaw: 4.720283855981834, pitch: -0.0004923518129509308 },
        subtitle: path.name,
        description: `This is the ${path.name} panorama`,
        image: `file://${path.path}`,
        thumbnail: '1.png',
        markers: [],
      });

      return itemImagePanorama(`data:image/png;base64,${path.base64}`, path.name, path.metadata);
    });

    imagePanoramaContainer.innerHTML = html.join('');
  });
};

export default () => {
  openDirectory();
};
