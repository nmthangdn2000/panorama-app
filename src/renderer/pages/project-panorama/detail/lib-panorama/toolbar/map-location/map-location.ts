import { Viewer } from '@photo-sphere-viewer/core';
import { PanoramaDataType, ToolbarDebugHTML } from '../../panorama.type';
import { bodyMapMainHTML, bodyMapMiniHTML, btnMapHTML, itemMapMiniHTML, markerLocationHTML, modalMapLocationHTML, modalSelectPanoramaWithMapHTML } from './html';
import { EVENT_KEY } from '../../event.panorama';
import { initModals, Modal } from 'flowbite';
import Swiper from 'swiper';
import { Manipulation } from 'swiper/modules';
import { loadImageBackground } from '../../../../../../utils/util';

import 'swiper/css';
import { saveProjectPanorama } from '../../../detail-panorama/detail-panorama';
import { calculateEndPosition } from '../../util';

export class MapLocation implements ToolbarDebugHTML {
  private viewer: Viewer;
  private modalMapLocation: Modal | null = null;
  private modalSelectPanoramaWithMap: Modal | null = null;
  private panoramas: PanoramaDataType[];

  private miniMaps: string[] = [];

  constructor(viewer: Viewer, panorama: PanoramaDataType[]) {
    this.viewer = viewer;
    this.panoramas = panorama;

    this.panoramas.forEach((panorama) => {
      if (panorama.minimap && panorama.minimap.src) {
        const isExist = this.miniMaps.find((src) => src === panorama.minimap?.src);
        if (!isExist) {
          this.miniMaps.push(panorama.minimap.src);
        }
      }
    });
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
    divModal.innerHTML += modalMapLocationHTML();
    divModal.innerHTML += modalSelectPanoramaWithMapHTML();
    document.body.appendChild(divModal);

    const modalMapLocation = document.getElementById('modal_map_location')!;
    this.modalMapLocation = new Modal(modalMapLocation, {
      closable: false,
      onHide: () => {
        this.inactive();
      },
    });

    this.modalSelectPanoramaWithMap = new Modal(document.getElementById('modal_select_panorama_with_map')!, {
      closable: false,
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
      spaceBetween: 40,
      slidesPerView: 3,
      modules: [Manipulation],
    });

    this.miniMaps.forEach((src) => {
      mySwiper.appendSlide(itemMapMiniHTML(src));
    });

    document.getElementById('input_mini_map')!.addEventListener('change', (e) => {
      const input = e.target as HTMLInputElement;
      const files = input.files!;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        mySwiper.appendSlide(itemMapMiniHTML(`file://${file.path}`));
      }
    });

    window.removeItemMiniMap = (element: Element, src: string) => {
      this.panoramas.forEach((panorama) => {
        if (panorama.minimap && panorama.minimap.src === src) {
          delete panorama.minimap;
        }
      });

      element.parentElement?.parentElement?.remove();

      const imageMapLocationContainer = document.getElementById('image_map_location_container')!;
      const divImage = imageMapLocationContainer.querySelector('div')!;
      const image = divImage.querySelector('img')!;

      if (image.src === src) {
        const markers = divImage.querySelectorAll('.marker_location_map')! as NodeListOf<HTMLElement>;
        markers.forEach((marker) => {
          marker.remove();
        });

        image.src = '';

        if (mySwiper.slides.length > 0) mySwiper.slides[0].classList.add('swiper-slide-active');
      }
    };

    window.onClickItemMapMini = (src: string) => {
      const divImage = imageMapLocationContainer.querySelector('div')!;
      const image = divImage.querySelector('img')!;

      image.src = src;
      loadImageBackground(divImage, imageMapLocationContainer);

      this.renderMarkerMiniMapLocation();
    };

    const divImage = imageMapLocationContainer.querySelector('div')!;

    this.handleClickMiniMap();

    loadImageBackground(divImage, imageMapLocationContainer);

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

  private renderMarkerMiniMapLocation() {
    const imageMapLocationContainer = document.getElementById('image_map_location_container')!;
    const divImage = imageMapLocationContainer.querySelector('div')!;
    const image = divImage.querySelector('img')!;

    const markers = divImage.querySelectorAll('.marker_location_map')! as NodeListOf<HTMLElement>;
    markers.forEach((marker) => {
      marker.remove();
    });

    if (!image.src) return;

    const panoramasMiniMap = this.panoramas.filter((panorama) => panorama.minimap && panorama.minimap.src === image.src);

    panoramasMiniMap.forEach((panorama) => {
      if (!panorama.minimap) return;

      const divMarker = document.createElement('div');
      divMarker.classList.add('absolute');
      divMarker.style.left = `${panorama.minimap.position.x}%`;
      divMarker.style.top = `${panorama.minimap.position.y}%`;
      divMarker.style.transform = 'translate(-50%, -50%)';
      divImage.style.zIndex = '20';
      divMarker.innerHTML = markerLocationHTML();

      divImage.appendChild(divMarker);

      const path = divMarker.querySelector('path')!;

      path.dataset.previousRadian = panorama.minimap.radian.toString();
      path.setAttribute('d', panorama.minimap.d);
    });
  }

  private handleClickMiniMap() {
    const imageMapLocationContainer = document.getElementById('image_map_location_container')!;
    const divImage = imageMapLocationContainer.querySelector('div')!;
    const image = divImage.querySelector('img')!;

    let clientX = 0;
    let clientY = 0;

    const functionSubmitAddSelectPanoramaWithMap = (event: Event) => {
      event.preventDefault();

      const data = new FormData(event.target as HTMLFormElement);
      const panoramaId = data.get('select_panorama_with_map') as string;

      if (!panoramaId) return;

      const panoramaIndex = this.panoramas.findIndex((panorama) => panorama.id === panoramaId);

      if (panoramaIndex < 0) return;

      const markers = divImage.querySelectorAll('.marker_location_map')! as NodeListOf<HTMLElement>;
      markers.forEach((marker) => {
        marker.classList.remove('isActive');
      });

      const rect = image.getBoundingClientRect();
      const xCenter = clientX - rect.left;
      const yCenter = clientY - rect.top;

      const xCenterPercent = (xCenter / rect.width) * 100;
      const yCenterPercent = (yCenter / rect.height) * 100;

      const divMarker = document.createElement('div');
      divMarker.classList.add('absolute');
      divMarker.style.left = `${xCenterPercent}%`;
      divMarker.style.top = `${yCenterPercent}%`;
      divMarker.style.transform = 'translate(-50%, -50%)';
      divImage.style.zIndex = '20';
      divMarker.innerHTML = markerLocationHTML();

      divImage.appendChild(divMarker);

      const calculateRadian = (x: number, y: number) => {
        const deltaX = xCenter - x;
        const deltaY = yCenter - y;

        return Math.atan2(deltaY, deltaX);
      };

      const path = divMarker.querySelector('path')!;

      let previousRadian = parseFloat(path ? path.dataset.previousRadian! : '0');
      let radian = 0;

      this.updatePanoramaMiniMap(panoramaIndex, image, previousRadian, radian, path?.getAttribute('d') || '', xCenterPercent, yCenterPercent);

      divMarker.addEventListener('mousedown', (event) => {
        const marker = event.target as HTMLElement;
        marker.style.cursor = 'grabbing';
        document.body.style.cursor = 'grabbing';

        const xStart = 40;
        const yStart = 2;
        const radius = 38;

        previousRadian = parseFloat(path ? path.dataset.previousRadian! : '0');
        radian = 0;

        const startRadian = calculateRadian(event.clientX - rect.left, event.clientY - rect.top);

        const onMouseMove = (event: MouseEvent) => {
          const moveRadian = calculateRadian(event.clientX - rect.left, event.clientY - rect.top);

          radian = moveRadian - startRadian;

          const [xA, yA] = calculateEndPosition(xStart, yStart, previousRadian + radian, radius);
          const [xB, yB] = calculateEndPosition(xStart, yStart, previousRadian + radian + 130 * (Math.PI / 180), radius);

          const d = `M 40 40 L ${xA} ${yA} A ${radius} ${radius} 0 0 1 ${xB} ${yB} Z`;

          path?.setAttribute('d', d);
        };

        const onMouseUp = () => {
          marker.style.cursor = null as any;
          document.body.style.cursor = 'default';
          if (path) path.dataset.previousRadian = (previousRadian + radian).toString();
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', () => {
          onMouseUp();
          this.updatePanoramaMiniMap(panoramaIndex, image, previousRadian, radian, path?.getAttribute('d') || '', xCenterPercent, yCenterPercent);
        });

        document.addEventListener('mouseleave', onMouseUp);
      });

      document.getElementById('form_select_panorama_with_map')!.removeEventListener('submit', functionSubmitAddSelectPanoramaWithMap);
    };

    image.addEventListener('click', (imageEvent) => {
      clientX = imageEvent.clientX;
      clientY = imageEvent.clientY;

      this.modalSelectPanoramaWithMap?.show();

      document.getElementById('form_select_panorama_with_map')!.addEventListener('submit', functionSubmitAddSelectPanoramaWithMap);
    });

    document.getElementById('cancel_select_panorama_with_map')!.addEventListener('click', () => {
      document.getElementById('form_select_panorama_with_map')!.removeEventListener('submit', functionSubmitAddSelectPanoramaWithMap);
    });
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

  private updatePanoramaMiniMap(panoramaIndex: number, image: HTMLImageElement, previousRadian: number, radian: number, d: string, xCenterPercent: number, yCenterPercent: number) {
    if (!this.panoramas[panoramaIndex].minimap) {
      this.panoramas[panoramaIndex].minimap = {
        src: '',
        position: {
          x: 0,
          y: 0,
        },
        radian: 0,
        d: '',
      };
    }

    this.panoramas[panoramaIndex].minimap!.radian = previousRadian + radian;
    this.panoramas[panoramaIndex].minimap!.d = d;
    this.panoramas[panoramaIndex].minimap!.position = {
      x: xCenterPercent,
      y: yCenterPercent,
    };
    this.panoramas[panoramaIndex].minimap!.src = image.src;

    saveProjectPanorama();
  }
}
