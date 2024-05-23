import { WINDOW } from '../../../../common/constant';
import { Panorama } from '../lib-panorama';

const viewerElement = document.getElementById('viewer')! as HTMLElement;
export let viewerPanorama: Panorama;

const onClickRenderPanorama = () => {
  const btnRenderPanorama = document.getElementById('btn-render-panorama')! as HTMLButtonElement;
  const btnToggleModalPanorama = document.getElementById(
    'btn-toggle-modal-panorama',
  )! as HTMLButtonElement;

  btnRenderPanorama.addEventListener('click', () => {
    btnToggleModalPanorama.click();
    renderPanorama();
  });
};

const renderPanorama = () => {
  if (WINDOW.panoramas.length === 0) return;

  const panoramaImport = JSON.parse(JSON.stringify(WINDOW.panoramas));

  viewerPanorama = new Panorama(viewerElement, WINDOW.panoramas, panoramaImport);
  viewerPanorama.setPanorama(WINDOW.panoramas[0].image);
};

export default () => {
  onClickRenderPanorama();
};
