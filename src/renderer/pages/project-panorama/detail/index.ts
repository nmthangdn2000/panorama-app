import { initFlowbite } from 'flowbite';
import openDirectory from './open-directory/open-directory';
import renderPanorama from './render-panorama/render-panorama';
import exportProject from './export-project/export-project';

const main = () => {
  initFlowbite();
  openDirectory();
  renderPanorama();
  exportProject();
};

main();
