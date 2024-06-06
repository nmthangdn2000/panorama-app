import { Viewer } from '@photo-sphere-viewer/core';
import { ToolbarDebugHTML } from '../../panorama.type';
import { bodyMapMainHTML, bodyMapMiniHTML, btnMapHTML, itemMapMiniHTML, markerLocationHTML, modalMapLocationHTML } from './html';
import { EVENT_KEY } from '../../event.panorama';
import { initModals, Modal } from 'flowbite';
import Swiper from 'swiper';
import { Manipulation } from 'swiper/modules';

import 'swiper/css';
import { loadImageBackground } from '../../../../../../utils/util';

export class MapLocation implements ToolbarDebugHTML {
  private viewer: Viewer;
  private modalMapLocation: Modal | null = null;

  constructor(viewer: Viewer) {
    this.viewer = viewer;
  }

  initialize() {
    this.createToolbarMap();
    this.handleClickBtnMap();
  }

  active() {
    const btnAddHotSpot = document.getElementById('btn_map_location')!;
    this.viewer.container.dispatchEvent(new Event(EVENT_KEY.REMOVE_ACTIVE_BUTTON_TOOLBAR));

    btnAddHotSpot.classList.add('active');
    this.viewer.setCursor('crosshair');

    initModals();
    this.modalMapLocation?.show();

    this.handleBtnGroupMapLocation();
  }

  inactive() {
    const btnAddHotSpot = document.getElementById('btn_map_location')!;
    btnAddHotSpot.classList.remove('active');
    this.viewer.setCursor('all-scroll');
  }

  destroy() {
    this.inactive();
  }

  private createToolbarMap() {
    const toolbar = document.getElementById('toolbar_debug')! as HTMLElement;
    const btnMap = document.createElement('div');
    btnMap.id = 'btn_map_location';
    btnMap.classList.add('btn_option_toolbar');
    btnMap.innerHTML = btnMapHTML();

    const divModal = document.createElement('div');
    divModal.innerHTML = modalMapLocationHTML();
    document.body.appendChild(divModal);

    const modalMapLocation = document.getElementById('modal_map_location')!;
    this.modalMapLocation = new Modal(modalMapLocation, {
      closable: false,
      onHide: () => {
        this.inactive();
      },
    });

    toolbar.appendChild(btnMap);
  }

  private handleClickBtnMap() {
    const btnMap = document.getElementById('btn_map_location')! as HTMLElement;
    btnMap.addEventListener('click', () => {
      if (btnMap.classList.contains('active')) {
        this.inactive();
        return;
      }

      this.active();
    });
  }

  private handleBtnGroupMapLocation() {
    const modalBodyMapLocation = document.getElementById('modal_body_map_location')!;
    const btnGroupMapLocations = document.getElementById('btn_group_map_location')!.querySelectorAll('button')!;

    this.createBodyMapMini();

    const removeActive = () => {
      btnGroupMapLocations.forEach((btn) => {
        btn.classList.remove('isActive');
      });
    };

    btnGroupMapLocations.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const type = target.getAttribute('data-type');

        removeActive();
        target.classList.add('isActive');

        if (type === 'mini-map') {
          this.createBodyMapMini();
        } else {
          this.createBodyMapMain();
        }
      });
    });
  }

  private createBodyMapMini() {
    const modalBodyMapLocation = document.getElementById('modal_body_map_location')!;

    modalBodyMapLocation.innerHTML = bodyMapMiniHTML();

    const imageMapLocationContainer = document.getElementById('image_map_location_container')!;

    const mySwiper = new Swiper('.swiper', {
      spaceBetween: 20,
      slidesPerView: 5,
      modules: [Manipulation],
    });

    mySwiper.appendSlide(
      Array.from({ length: 3 }).map(() => {
        return itemMapMiniHTML();
      }),
    );

    const divImage = imageMapLocationContainer.querySelector('div')!;
    const image = divImage.querySelector('img')!;

    loadImageBackground(divImage, imageMapLocationContainer);

    image.addEventListener('click', (event) => {
      const markers = divImage.querySelectorAll('.marker_location_map')! as NodeListOf<HTMLElement>;
      markers.forEach((marker) => {
        marker.classList.remove('isActive');
      });

      const rect = image.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const top = y;
      const left = x;
      const bottom = rect.height - y;
      const right = rect.width - x;

      const centerX = left - 80 / 2;
      const centerY = top - 80 / 2;

      const centerXPercent = (centerX / rect.width) * 100;
      const centerYPercent = (centerY / rect.height) * 100;

      const divMarker = document.createElement('div');
      divMarker.classList.add('absolute');
      divMarker.style.left = `${centerXPercent}%`;
      divMarker.style.top = `${centerYPercent}%`;
      divImage.style.zIndex = '20';
      divMarker.innerHTML = markerLocationHTML(centerXPercent, centerYPercent);

      divImage.appendChild(divMarker);

      divMarker.addEventListener('mousedown', (event) => {
        const marker = event.target as HTMLElement;
        marker.style.zIndex = '30';
        marker.style.cursor = 'grabbing';

        const onMouseMove = (event: MouseEvent) => {
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;

          const deltaX = centerX - x;
          const deltaY = centerY - y;

          const rad = Math.atan2(deltaY, deltaX);

          // const d = "M 39.7725,39.7725 L 60.28417779204103,6.943418249282229 A 38.55,38.55 0 0 1 60.28417779204103,71.60158175071777 Z";

          const lxDefault = 60;
          const lyDefault = 7;
          const rxDefault = 60;
          const ryDefault = 70;

          const lx = lxDefault + Math.cos(rad) * 20;
          const ly = lyDefault + Math.sin(rad) * 20;
          const rx = rxDefault + Math.cos(rad) * 20;
          const ry = ryDefault + Math.sin(rad) * 20;

          const d = `M 39.7725,39.7725 L ${lx},${ly} A 38.55,38.55 0 0 1 ${rx},${ry} Z`;

          const path = marker.querySelector('path')!;
          path.setAttribute('d', d);
        };

        const onMouseUp = () => {
          marker.style.zIndex = '20';
          marker.style.cursor = 'grab';
          divImage.removeEventListener('mousemove', onMouseMove);
          divImage.removeEventListener('mouseup', onMouseUp);
        };

        divImage.addEventListener('mousemove', onMouseMove);
        divImage.addEventListener('mouseup', onMouseUp);
      });
    });

    window.removeMarkerLocationHTML = (element: HTMLElement) => {
      element.parentElement?.parentElement?.remove();
    };

    window.clickMarkerLocation = (element: HTMLElement) => {
      const markers = divImage.querySelectorAll('.marker_location_map')! as NodeListOf<HTMLElement>;
      markers.forEach((marker) => {
        marker.classList.remove('isActive');
      });

      element.parentElement!.classList.add('isActive');
    };
  }

  private createBodyMapMain() {
    const modalBodyMapLocation = document.getElementById('modal_body_map_location')!;
    modalBodyMapLocation.innerHTML = bodyMapMainHTML();
  }
}
