import { initFlowbite } from 'flowbite';
import openDirectory from './open-directory/open-directory';
import renderPanorama from './render-panorama/render-panorama';

const main = () => {
  initFlowbite();
  openDirectory();
  renderPanorama();
};

main();
