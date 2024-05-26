import { itemImagePanorama } from './html';

const btnRemoveAllPanorama = document.getElementById('btn_remove_all_panorama')! as HTMLButtonElement;

window.panoramas = [];
window.panoramasImport = [];

const openDirectory = () => {
  document.getElementById('btn-open-dialog')!.addEventListener('click', async () => {
    const folderPath = await window.api.projectPanorama.selectFolder();

    if (!folderPath) return;

    if (window.viewerPanorama) window.viewerPanorama.viewer.destroy();

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
  const imagePanoramaContainer = document.getElementById('image_panorama_container')! as HTMLDivElement;

  const html = window.panoramas.map((panorama) => {
    return itemImagePanorama(panorama.id, panorama.image, panorama.title, panorama.metadata);
  });

  imagePanoramaContainer.innerHTML = html.join('');

  const btnRenderPanorama = document.getElementById('btn_render_panorama')! as HTMLButtonElement;

  if (window.panoramas.length > 0) {
    btnRemoveAllPanorama.classList.remove('hidden');
    btnRenderPanorama.classList.remove('hidden');
    imagePanoramaContainer.parentElement!.querySelector('p')!.classList.add('hidden');
  } else {
    btnRemoveAllPanorama.classList.add('hidden');
    btnRenderPanorama.classList.add('hidden');
    imagePanoramaContainer.parentElement!.querySelector('p')!.classList.remove('hidden');
  }
};

window.onRemovePanorama = (id: number) => {
  window.panoramas = window.panoramas.filter((panorama) => panorama.id !== id);
  window.panoramas = window.panoramas.map((panorama) => {
    const markers = panorama.markers.filter((marker) => marker.toPanorama !== id);
    return {
      ...panorama,
      markers,
    };
  });

  window.panoramasImport = window.panoramasImport.filter((panorama) => panorama.id !== id);
  window.panoramasImport = window.panoramasImport.map((panorama) => {
    const markers = panorama.markers.filter((marker) => marker.toPanorama !== id);
    return {
      ...panorama,
      markers,
    };
  });

  if (window.viewerPanorama) {
    const parent = window.viewerPanorama.viewer.container.parentElement!;
    parent.innerHTML = '';
    window.viewerPanorama = undefined;
  }

  renderListImage();
};

btnRemoveAllPanorama.addEventListener('click', () => {
  window.panoramas = [];
  window.panoramasImport = [];

  if (window.viewerPanorama) {
    const parent = window.viewerPanorama.viewer.container.parentElement!;
    parent.innerHTML = '';
    window.viewerPanorama = undefined;
  }

  renderListImage();
});

export default () => {
  openDirectory();
};
