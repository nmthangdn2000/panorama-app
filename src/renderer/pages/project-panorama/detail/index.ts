import { initFlowbite } from 'flowbite';
import openDirectory from './open-directory/open-directory';
import renderPanorama from './render-panorama/render-panorama';
import exportProject from './export-project/export-project';

const preload = async () => {
  const url = new URL(window.location.href);
  const name = url.searchParams.get('name');

  if (!name) {
    return;
  }

  const project = await window.api.projectPanorama.getProject(name);

  if (!project) {
    return;
  }
};

const main = async () => {
  await preload();
  initFlowbite();
  openDirectory();
  renderPanorama();
  exportProject();
};

main();
