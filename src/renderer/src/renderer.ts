import 'flowbite';
import openDirectory from './open-directory/open-directory';
import renderPanorama from './render-panorama/render-panorama';

function init(): void {
  window.addEventListener('DOMContentLoaded', () => {
    doAThing();
  });
}

function doAThing(): void {
  openDirectory();
  renderPanorama();
}

init();
