import { EquirectangularAdapter, Viewer } from '@photo-sphere-viewer/core';
// import { CubemapTilesAdapter } from '@photo-sphere-viewer/cubemap-tiles-adapter';
import { GyroscopePlugin } from '@photo-sphere-viewer/gyroscope-plugin';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import Lottie from 'lottie-web';
import { DebuggerPanorama } from './debugger.panorama';
import { EventListenerType, PanoramaOptionsType, PanoramaDataType, PanoramaType } from './panorama.type';

import './panorama.scss';
import '@photo-sphere-viewer/core/index.css';
import '@photo-sphere-viewer/markers-plugin/index.css';

export const CURRENT_TIME_MS = '1710909225459';

export class Panorama implements PanoramaType {
  public viewer: Viewer;
  private _events: EventListenerType;
  private _panoramas: PanoramaDataType[] = [];
  private _animationDataBtnArrow: any;
  private _debuggerPanorama: DebuggerPanorama;
  private _gyroscopeEnabled: boolean;

  /**
   * @param container - The container element or selector
   * @param panorama - The panorama data
   * @description Create a panorama viewer
   * @returns void
   * @example
   * const panorama = new Panorama(document.querySelector('#viewer')! as any, PANORAMA);
   * panorama.swapPanorama(1);
   */
  constructor(container: string | HTMLElement, panoramas: PanoramaDataType[], panoramaImport: PanoramaDataType[], options?: PanoramaOptionsType) {
    this.viewer = new Viewer({
      container,
      adapter: EquirectangularAdapter,
      plugins: [
        MarkersPlugin,
        [
          GyroscopePlugin,
          {
            absolutePosition: false,
            roll: false,
          },
        ],
      ],
    });

    this._panoramas = panoramas;

    this._events = {
      onMarkerClick: () => {},
    };
    this.__events();

    this._gyroscopeEnabled = options?.gyroscopeEnabled || false;

    this.__preloadBtnArrowAnimation();

    this.__handleGyroscope();

    this._debuggerPanorama = new DebuggerPanorama(
      this.viewer,
      this._panoramas,
      panoramaImport,
      options?.debug || false,
      this.getCurrentPanorama.bind(this),
      this.__setMarkers.bind(this),
      this.__setAnimationToBtnArrow.bind(this),
    );
  }

  private __handleGyroscope() {
    let timer: any = 0;
    this.viewer.addEventListener('position-updated', () => {
      if (this._gyroscopeEnabled) {
        this.viewer.getPlugin<GyroscopePlugin>(GyroscopePlugin).stop();
        return;
      } else {
        clearTimeout(timer);
        timer = setTimeout(() => {
          this.viewer
            .getPlugin<GyroscopePlugin>(GyroscopePlugin)
            .start()
            .then(() => {})
            .catch(() => {});
        }, 100);
      }
    });
  }

  /**
   * @description Stop gyroscope
   * @returns void
   * @example
   * panorama.stopGyroscope();
   */
  stopGyroscope() {
    this.viewer.getPlugin<GyroscopePlugin>(GyroscopePlugin).stop();

    this._gyroscopeEnabled = true;
  }

  /**
   * @description Start gyroscope
   * @returns void
   * @example
   * panorama.startGyroscope();
   */
  startGyroscope() {
    this.viewer
      .getPlugin<GyroscopePlugin>(GyroscopePlugin)
      .start()
      .then(() => {})
      .catch(() => {});

    this._gyroscopeEnabled = false;
  }

  private async __setMarkers(panorama: PanoramaDataType) {
    const markersPlugin = this.viewer.getPlugin<MarkersPlugin>(MarkersPlugin);
    markersPlugin.clearMarkers();
    markersPlugin.setMarkers(panorama.markers);

    this.__setAnimationToBtnArrow();

    if (this._debuggerPanorama.getDebugMode()) {
      const markerElement = markersPlugin.getMarkers();

      markerElement.forEach((marker) => {
        this._debuggerPanorama.createButtonRemoveMarker(marker);
      });
    }

    const markerVideos = panorama.markers.filter((marker) => marker.videoLayer);
    if (markerVideos.length < 1) return;

    markerVideos.forEach(async (marker) => {
      const videoElement = markersPlugin.getMarker(marker.id).video;
      videoElement.muted = false;
    });
  }

  private async __transitionPanorama(panoramaImage: string, cb: () => void, isFirstLoadPanorama: boolean) {
    const panorama = this._panoramas.find((panorama) => panorama.image === panoramaImage);

    if (!panorama) return;

    let isGotoMarkerDone = false;

    const markersPlugin = this.viewer.getPlugin<MarkersPlugin>(MarkersPlugin);
    markersPlugin.addEventListener(
      'goto-marker-done',
      () => {
        isGotoMarkerDone = true;
      },
      { once: true },
    );

    const textureData = (await this.viewer.textureLoader.preloadPanorama(this.__formatPanoramaPath(panoramaImage))) as any;

    if (isFirstLoadPanorama) {
      this.changeTexturePanorama(panorama, cb, true);
      return;
    }

    if (isGotoMarkerDone) {
      this.viewer.addEventListener('render', () => this.__handleChangePanorama(textureData, panorama, cb), { once: true });
      this.viewer.needsUpdate();
      return;
    }

    return markersPlugin.addEventListener('goto-marker-done', () => this.__handleChangePanorama(textureData, panorama, cb), { once: true });
  }

  /**
   * @description Swap panorama
   * @param id - The panorama id
   * @param markerId - The marker id
   * @param cb - The callback function
   * @returns void
   * @example
   * panorama.swapPanorama(1, 'marker-1', () => {});
   * */
  async swapPanorama(id: number, markerId?: string, cb?: () => void) {
    const markersPlugin = this.viewer.getPlugin<MarkersPlugin>(MarkersPlugin);

    if (markerId) {
      markersPlugin.gotoMarker(markerId, 800);
      // await delay(300);
    }

    this._panoramas.forEach(async (panorama) => {
      if (panorama.id === id) {
        await this.__transitionPanorama(
          panorama.image,
          () => {
            this.__setMarkers(panorama);
            if (cb) cb();
          },
          !markerId,
        );
      }
    });
  }

  /**
   * @description Change texture panorama
   * @param panorama - The panorama data
   * @param cb - The callback function
   * @param isRotate - The boolean value
   * @returns void
   * @example
   * panorama.changeTexturePanorama(panorama, () => {}, true);
   * */
  async changeTexturePanorama(panorama: PanoramaDataType, cb?: () => void, isRotate: boolean = false) {
    const textureData = (await this.viewer.textureLoader.preloadPanorama(this.__formatPanoramaPath(panorama.image))) as any;

    this.viewer.addEventListener('render', () => this.__handleChangePanorama(textureData, panorama, cb, isRotate, true), { once: true });
    this.viewer.needsUpdate();
  }

  /**
   * @description Set panorama
   * @param panoramaUrl - The panorama url
   * @returns void
   * @example
   * panorama.setPanorama('panorama.jpg');
   **/
  async setPanorama(panoramaUrl: string) {
    if (!this._gyroscopeEnabled) {
      this.viewer
        .getPlugin<GyroscopePlugin>(GyroscopePlugin)
        .start()
        .then(() => {})
        .catch(() => {});
    }

    const panorama = this._panoramas.find((pano) => pano.image === panoramaUrl)!;

    await this.viewer.setPanorama(this.__formatPanoramaPath(panoramaUrl), {
      speed: 0,
      zoom: 45,
      showLoader: false,
      transition: false,
      position: panorama.cameraPosition,
    });

    this.__setMarkers(panorama);
  }

  private async __handleChangePanorama(textureData: any, panorama: PanoramaDataType, cb?: () => void, isRotate: boolean = true, changeTexture?: boolean) {
    (document.querySelector('.psv-container canvas')! as HTMLCanvasElement).toBlob(
      (blob) => {
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const imgElement = document.createElement('img');
        if (changeTexture) {
          imgElement.id = 'panorama-texture-transition';
        } else {
          imgElement.id = 'panorama-image-transition';
        }

        imgElement.src = url;
        this.viewer.container.appendChild(imgElement);

        imgElement.onload = async () => {
          await this.__delay(100);

          await this.viewer.setPanorama(textureData.panorama, {
            panoData: textureData.panoData,
            speed: 0,
            zoom: !changeTexture ? 45 : undefined,
            showLoader: false,
            transition: false,
          });

          this.__setMarkers(panorama);

          if (panorama && isRotate) this.viewer.rotate(panorama.cameraPosition);
          if (cb) cb();

          if (changeTexture) {
            imgElement.style.opacity = '0';
          } else {
            imgElement.style.opacity = '0';
            imgElement.style.transform = 'scale(1.5)';
          }

          setTimeout(() => {
            // imgElement.remove();
          }, 2000);
        };

        imgElement.onerror = () => {
          console.log('error');
        };
      },
      'image/jpeg',
      0.5,
    );
  }

  private __formatPanoramaPath(panorama: string) {
    return panorama;
    const path = `./images/panoramas/${panorama.split('.jpg')[0]}`;

    return {
      name: panorama,
      faceSize: 1500,
      nbTiles: 4,
      baseUrl: {
        left: `${path}/tile_low/left.jpg`,
        front: `${path}/tile_low/front.jpg`,
        right: `${path}/tile_low/right.jpg`,
        back: `${path}/tile_low/back.jpg`,
        top: `${path}/tile_low/top.jpg`,
        bottom: `${path}/tile_low/bottom.jpg`,
      },
      tileUrl: (face: string, col: string, row: string) => {
        return `${path}/tile/${face}_${col}_${row}.jpg`;
      },
    };
  }

  /**
   * @description Get current panorama
   * @returns PanoramaDataType | undefined
   * @example
   * panorama.getCurrentPanorama();
   * */
  getCurrentPanorama(): PanoramaDataType | undefined {
    if (!this.viewer.config.panorama) return;

    return this._panoramas.find((panorama) => panorama.image === this.viewer.config.panorama);
  }

  private async __preloadBtnArrowAnimation() {
    if (this._animationDataBtnArrow) return;
    const response = await fetch('/assets/lottie/hotspot.json');
    this._animationDataBtnArrow = await response.json();
  }

  private async __setAnimationToBtnArrow() {
    if (!this._animationDataBtnArrow) {
      await this.__preloadBtnArrowAnimation();
    }

    const btnArrow = document.querySelectorAll('.hotspot-arrow');
    btnArrow.forEach((element, index) => {
      const name = 'hotspot' + index;
      Lottie.destroy(name);
      Lottie.loadAnimation({
        container: element,
        name: name,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: this._animationDataBtnArrow,
      });
    });
  }

  private async __delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  get events() {
    return this._events;
  }

  set events(value: EventListenerType) {
    this._events = value;
    this.__events();
  }

  private __events() {
    // onMarkerClick
    window.onMarkerClick = (id: number, markerId: string) => {
      this.swapPanorama(id, markerId);
      this._events.onMarkerClick(id, markerId);
    };
  }
}
