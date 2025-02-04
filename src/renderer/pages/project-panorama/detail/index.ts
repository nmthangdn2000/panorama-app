import { initFlowbite } from 'flowbite';
import detailPanorama, { renderListImage } from './detail-panorama/detail-panorama';
import previewPanorama from './preview-panorama/preview-panorama';
import renderProject from './render-project/render-project';
import exportPanorama from './export-panorama/export-panorama';

import '../../../assets/scss/main.scss';
import '../../../assets/scss/detail.scss';

const preload = async () => {
  const url = new URL(window.location.href);
  const name = url.searchParams.get('name');

  if (!name) {
    return;
  }

  document.getElementById('txt_project_name')!.textContent = name;

  const project = await window.api.projectPanorama.getProject(name);

  if (!project) {
    return;
  }

  window.panoramas = project.panoramas || [];
  window.pathProject = project.pathFolder;

  renderListImage();
};

const main = async () => {
  await preload();
  initFlowbite();
  detailPanorama();
  previewPanorama();
  renderProject();
  exportPanorama();
};

main();
