import { Modal } from 'flowbite';
import { Panorama } from '../lib-panorama';

const viewerElement = document.getElementById('viewer')! as HTMLElement;
const modalViewer = new Modal(document.getElementById('modal_viewer')!);

export let viewerPanorama: Panorama;

const onClickRenderPanorama = () => {
  const btnRenderPanorama = document.getElementById('btn_render_panorama')! as HTMLButtonElement;

  btnRenderPanorama.addEventListener('click', () => {
    modalViewer.show();
    renderPanorama();
  });
};

// modalViewer.updateOnHide(() => {
//   viewerPanorama.viewer.destroy();
// });

const renderPanorama = () => {
  if (window.panoramas.length === 0) return;

  if (viewerPanorama) {
    viewerPanorama.setData(window.panoramas);
    viewerPanorama.setDataImport(window.panoramasImport);
    return;
  }

  viewerPanorama = new Panorama(viewerElement, window.panoramas, window.panoramasImport, {
    debug: true,
  });
  viewerPanorama.setPanorama(window.panoramas[0].image);
};

export default () => {
  onClickRenderPanorama();
};
