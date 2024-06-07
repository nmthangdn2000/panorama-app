import { Viewer } from '@photo-sphere-viewer/core';
import { ToolbarDebugHTML } from '../../panorama.type';
import { bodyMapMainHTML, bodyMapMiniHTML, btnMapHTML, itemMapMiniHTML, markerLocationHTML, modalMapLocationHTML } from './html';
import { EVENT_KEY } from '../../event.panorama';
import { initModals, Modal } from 'flowbite';
import Swiper from 'swiper';
import { Manipulation } from 'swiper/modules';
import { loadImageBackground } from '../../../../../../utils/util';

import 'swiper/css';

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
    const bodyMapMainLocation = document.getElementById('body_map_main_location');
    if (bodyMapMainLocation) {
      bodyMapMainLocation.style.display = 'none';
    }

    const bodyMapMiniLocation = document.getElementById('body_map_mini_location');
    if (bodyMapMiniLocation) {
      bodyMapMiniLocation.style.display = 'block';
      return;
    }

    const modalBodyMapLocation = document.getElementById('modal_body_map_location')!;
    const divBodyMapMini = document.createElement('div');
    divBodyMapMini.id = 'body_map_mini_location';
    divBodyMapMini.innerHTML = bodyMapMiniHTML();
    modalBodyMapLocation.appendChild(divBodyMapMini);

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
      const xCenter = event.clientX - rect.left;
      const yCenter = event.clientY - rect.top;

      const top = yCenter;
      const left = xCenter;
      const bottom = rect.height - yCenter;
      const right = rect.width - xCenter;

      const xCenterPercent = (xCenter / rect.width) * 100;
      const yCenterPercent = (yCenter / rect.height) * 100;

      const divMarker = document.createElement('div');
      divMarker.classList.add('absolute');
      divMarker.style.left = `${xCenterPercent}%`;
      divMarker.style.top = `${yCenterPercent}%`;
      divMarker.style.transform = 'translate(-50%, -50%)';
      divImage.style.zIndex = '20';
      divMarker.innerHTML = markerLocationHTML(xCenterPercent, yCenterPercent);

      divImage.appendChild(divMarker);

      const calculateRadian = (x: number, y: number) => {
        const deltaX = xCenter - x;
        const deltaY = yCenter - y;

        return Math.atan2(deltaY, deltaX);
      };

      divMarker.addEventListener('mousedown', (event) => {
        const marker = event.target as HTMLElement;
        marker.style.zIndex = '30';
        marker.style.cursor = 'grabbing';
        document.body.style.cursor = 'grabbing';

        const path = marker.querySelector('path')!;

        const xStart = 40;
        const yStart = 2;
        const radius = 38;

        const startRadian = calculateRadian(event.clientX - rect.left, event.clientY - rect.top);

        let previousRadian = parseFloat(path ? path.dataset.previousRadian! : '0');
        let radian = 0;

        const onMouseMove = (event: MouseEvent) => {
          const moveRadian = calculateRadian(event.clientX - rect.left, event.clientY - rect.top);

          radian = moveRadian - startRadian;

          const [xA, yA] = this.calculateEndPosition(xStart, yStart, previousRadian + radian, radius);
          const [xB, yB] = this.calculateEndPosition(xStart, yStart, previousRadian + radian + 130 * (Math.PI / 180), radius);

          const d = `M 40 40 L ${xA} ${yA} A ${radius} ${radius} 0 0 1 ${xB} ${yB} Z`;

          path?.setAttribute('d', d);
        };

        const onMouseUp = () => {
          marker.style.zIndex = '20';
          marker.style.cursor = 'grab';
          document.body.style.cursor = 'default';
          if (path) path.dataset.previousRadian = (previousRadian + radian).toString();
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        document.addEventListener('mouseleave', onMouseUp);
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
    const bodyMapMiniLocation = document.getElementById('body_map_mini_location');
    if (bodyMapMiniLocation) {
      bodyMapMiniLocation.style.display = 'none';
    }

    const bodyMapMainLocation = document.getElementById('body_map_main_location');
    if (bodyMapMainLocation) {
      bodyMapMainLocation.style.display = 'block';
      return;
    }

    const modalBodyMapLocation = document.getElementById('modal_body_map_location')!;
    const divBodyMapMain = document.createElement('div');
    divBodyMapMain.id = 'body_map_main_location';
    divBodyMapMain.innerHTML = bodyMapMainHTML();

    modalBodyMapLocation.appendChild(divBodyMapMain);
  }

  private calculateEndPosition(xA: number, yA: number, radian: number, radius: number) {
    const xO = 40;
    const yO = 40;

    const xVectorOA = xA - xO;
    const yVectorOA = yA - yO;

    // xVectorOA * xVectorOB + yVectorOA * yVectorOB = 20 * 20 * Math.cos(radian);

    // yVectorOB = (20 * 20 * Math.cos(radian) - xVectorOA * xVectorOB) / yVectorOA;

    // xVectorOB^2 + yVectorOB^2 = 20^2

    // xVectorOB^2 + ((20 * 20 * Math.cos(radian) - xVectorOA * xVectorOB) / yVectorOA)^2 = 20^2

    // yVectorOA^2 * xVectorOB^2 + (20 * 20 * Math.cos(radian) - xVectorOA * xVectorOB)^2 - 20^2 * yVectorOA^2 = 0

    // yVectorOA^2 * xVectorOB^2 + xVectorOA^2 * xVectorOB^2 - 2 * 20 * 20 * Math.cos(radian) * xVectorOA * xVectorOB + 20^2 * 20^2 * Math.cos(radian)^2 - 20^2 * yVectorOA^2 = 0

    // (yVectorOA^2 + xVectorOA^2) * xVectorOB^2 - 2 * 20 * 20 * Math.cos(radian) * xVectorOA * xVectorOB + 20^2 * 20^2 * Math.cos(radian)^2 - 20^2 * yVectorOA^2 = 0

    // a = yVectorOA^2 + xVectorOA^2
    // b = -2 * 20 * 20 * Math.cos(radian) * xVectorOA
    // c = 20^2 * 20^2 * Math.cos(radian)^2 - 20^2 * yVectorOA^2

    // delta = b^2 - 4 * a * c

    // xVectorOB = (-b + Math.sqrt(delta)) / (2 * a)
    // yVectorOB = (20 * 20 * Math.cos(radian) - xVectorOA * xVectorOB) / yVectorOA;

    // xB = xO + xVectorOB;
    // yB = yO + yVectorOB;

    const finalRadian = radian - Math.floor(radian / (Math.PI * 2)) * Math.PI * 2;

    const a = yVectorOA ** 2 + xVectorOA ** 2;
    const b = -2 * radius * radius * Math.cos(finalRadian) * xVectorOA;
    const c = radius ** 2 * radius ** 2 * Math.cos(finalRadian) ** 2 - radius ** 2 * yVectorOA ** 2;

    const delta = b ** 2 - 4 * a * c;

    let modifierDelta = -1;
    if (finalRadian < Math.PI) modifierDelta = 1;

    const xVectorOB = (-b + modifierDelta * Math.sqrt(delta)) / (2 * a);
    const yVectorOB = (radius * radius * Math.cos(finalRadian) - xVectorOA * xVectorOB) / yVectorOA;

    const xB = xO + xVectorOB;
    const yB = yO + yVectorOB;

    return [xB, yB];
  }
}
