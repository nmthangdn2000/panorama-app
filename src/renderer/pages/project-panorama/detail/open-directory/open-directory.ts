import { viewerPanorama } from '../render-panorama/render-panorama';
import { itemImagePanorama } from './html';

window.panoramas = [];
window.panoramasImport = [];

const openDirectory = () => {
  document.getElementById('btn-open-dialog')!.addEventListener('click', async () => {
    const folderPath = await window.api.projectPanorama.selectFolder();

    if (!folderPath) return;

    if (viewerPanorama) viewerPanorama.viewer.destroy();

    folderPath.forEach((path, index) => {
      const d = {
        id: index + 1,
        title: path.name,
        pointPosition: { bottom: '50%', left: '50%' },
        cameraPosition: { yaw: 4.720283855981834, pitch: -0.0004923518129509308 },
        subtitle: path.name,
        description: `This is the ${path.name} panorama`,
        image: `file://${path.path}`,
        thumbnail: '1.png',
        markers: [],
        metadata: path.metadata,
      };

      window.panoramas.push(d);
      window.panoramasImport.push(JSON.parse(JSON.stringify(d)));
    });

    renderListImage();
  });
};

const renderListImage = () => {
  const imagePanoramaContainer = document.getElementById('image-panorama-container')! as HTMLDivElement;

  const html = window.panoramas.map((panorama) => {
    return itemImagePanorama(panorama.id, panorama.image, panorama.title, panorama.metadata);
  });

  imagePanoramaContainer.innerHTML = html.join('');

  const btnRenderPanorama = document.getElementById('btn_render_panorama')! as HTMLButtonElement;

  if (window.panoramas.length > 0) {
    btnRenderPanorama.removeAttribute('disabled');
  } else {
    btnRenderPanorama.setAttribute('disabled', 'true');
  }
};

window.onRemovePanorama = (id: number) => {
  window.panoramas = window.panoramas.filter((panorama) => panorama.id !== id);
  window.panoramasImport = window.panoramasImport.filter((panorama) => panorama.id !== id);
  renderListImage();
};

export default () => {
  openDirectory();
};
