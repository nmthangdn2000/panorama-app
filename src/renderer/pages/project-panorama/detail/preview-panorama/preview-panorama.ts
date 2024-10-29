import { Modal } from 'flowbite';
import { Panorama } from '../lib-panorama';
import Swiper from 'swiper';

import 'swiper/css';
import { EffectCards, Manipulation } from 'swiper/modules';

const viewerElement = document.getElementById('viewer')! as HTMLElement;
const modalViewer = new Modal(document.getElementById('modal_viewer')!, {
  backdrop: 'static',
  closable: false,
});

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

  window.viewerPanorama = new Panorama(viewerElement, window.panoramas, {
    debug: true,
  });

  window.viewerPanorama.setPanorama(window.panoramas[0].image);

  const swiper = new Swiper('.carousel_swiper', {
    modules: [Manipulation, EffectCards],
    breakpoints: {
      768: {
        slidesPerView: window.panoramas.length > 3 ? 3 : window.panoramas.length,
        spaceBetween: 10,
      },
      1024: {
        slidesPerView: window.panoramas.length > 5 ? 5 : window.panoramas.length,
        spaceBetween: 10,
      },
      1280: {
        slidesPerView: window.panoramas.length > 6 ? 6 : window.panoramas.length,
        spaceBetween: 10,
      },
      1536: {
        slidesPerView: window.panoramas.length > 7 ? 7 : window.panoramas.length,
        spaceBetween: 10,
      },
      1792: {
        slidesPerView: window.panoramas.length > 8 ? 8 : window.panoramas.length,
        spaceBetween: 10,
      },
      2048: {
        slidesPerView: window.panoramas.length > 9 ? 9 : window.panoramas.length,
        spaceBetween: 10,
      },
    },
  });

  window.panoramas.forEach((panorama) => {
    swiper.appendSlide(
      `<div class="swiper-slide cursor-pointer p-[2px] border-2 border-transparent rounded [&.active]:border-red-500 transition-all" onclick="window.viewerPanorama.setPanorama('${panorama.image}')">
        <img src="${window.pathProject}/panoramas/${panorama.image}" alt="${panorama.image}" class="rounded" />
      </div>`,
    );
  });

  window.viewerPanorama.viewer.container.addEventListener('panorama-changed', ({ detail }) => {
    const { panorama } = detail;

    const index = window.panoramas.findIndex((p) => p.image === panorama.image);

    swiper.slides.forEach((slide) => {
      slide.classList.remove('active');
    });

    swiper.slides[index].classList.add('active');

    swiper.slideTo(index);
  });
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
