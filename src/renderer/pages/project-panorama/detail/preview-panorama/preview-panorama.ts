import { Modal } from 'flowbite';
import { Panorama } from '../lib-panorama';

const viewerElement = document.getElementById('viewer')! as HTMLElement;
const modalViewer = new Modal(document.getElementById('modal_viewer')!);

const onClickPreviewPanorama = () => {
  const btnPreviewPanorama = document.getElementById('btn_preview_panorama')! as HTMLButtonElement;

  btnPreviewPanorama.addEventListener('click', () => {
    modalViewer.show();
    previewPanorama();
  });
};

const previewPanorama = () => {
  if (window.panoramas.length === 0) return;

  if (window.viewerPanorama) {
    return;
  }

  console.log('window.panoramas', window.panoramas);
  console.log('window.panoramasImport', window.panoramasImport);

  window.viewerPanorama = new Panorama(viewerElement, window.panoramas, window.panoramasImport, {
    debug: true,
  });

  // window.viewerPanorama.setPanorama(window.panoramas[0].image);
};

export const destroyViewerPanorama = () => {
  if (window.viewerPanorama) {
    const parent = window.viewerPanorama.viewer.container.parentElement!;
    window.viewerPanorama.viewer.destroy();
    parent.innerHTML = '';
    window.viewerPanorama = undefined;
  }
};

export default () => {
  onClickPreviewPanorama();
};
