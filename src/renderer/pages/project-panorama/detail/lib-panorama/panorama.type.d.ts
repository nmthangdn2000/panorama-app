import { Viewer } from '@photo-sphere-viewer/core';
import { MarkerConfig } from '@photo-sphere-viewer/markers-plugin';
import sharp from 'sharp';

export type PanoramaType = {
  /**
   * Set panorama image
   * @param image Panorama image
   * @description Set panorama image
   * @example
   * ```javascript
   * viewerPanorama.setPanorama(PANORAMA[0].image);
   * ```
   */
  setPanorama: (image: string) => void;

  /**
   * @description Panorama events
   * @example
   * ```javascript
   * viewerPanorama.events.onMarkerClick = (id: number, markerId: string) => {
   *  // TODO: Implement onMarkerClick
   * };
   * ```
   */
  events: EventListenerType;

  /**
   * Swap panorama
   * @description Swap panorama after marker click
   * @example
   * ```javascript
   * viewerPanorama.swapPanorama(1);
   * ```
   */
  swapPanorama: (id: string, markerId?: string, cb?: () => void) => void;

  /**
   * Get current panorama
   * @description Get current panorama
   * @example
   * ```javascript
   * const currentPanorama = viewerPanorama.getCurrentPanorama();
   * ```
   */
  getCurrentPanorama: () => PanoramaDataType | undefined;

  /**
   * Change texture panorama
   * @description Change texture panorama
   * @example
   * ```javascript
   * viewerPanorama.changeTexturePanorama(PANORAMA[0]);
   * ```
   */
  changeTexturePanorama: (panorama: PanoramaDataType, cb?: () => void, isRotate: boolean = false) => void;

  /**
   * Start gyroscope
   * @description Start gyroscope
   * @example
   * ```javascript
   * viewerPanorama.startGyroscope();
   * ```
   */
  startGyroscope: () => void;

  /**
   * Stop gyroscope
   * @description Stop gyroscope
   * @example
   * ```javascript
   * viewerPanorama.stopGyroscope();
   * ```
   */
  stopGyroscope: () => void;

  /**
   * Get viewer
   * @description Get viewer
   */
  viewer: Viewer;
};

export type PanoramaOptionsType = {
  /**
   * debug mode
   * @default false
   * @description If true, debug mode is enabled
   * @example
   * ```javascript
   * const viewerPanorama = new Panorama(viewerElement, PANORAMA, { debug: true });
   * ```
   */
  debug?: boolean;

  /**
   * gyro mode
   * @default false
   * @description If true, gyro mode is enabled
   * @example
   * ```javascript
   * const viewerPanorama = new Panorama(viewerElement, PANORAMA, { gyro: true });
   * ```
   */
  gyroscopeEnabled?: boolean;
};

export type EventListenerType = {
  /**
   * Event listener for marker click
   * @param id Panorama ID
   * @param markerId Marker ID
   */
  onMarkerClick: (id: string, markerId: string) => void;
};

export type PanoramaDataType = {
  id: string;
  title: string;
  subtitle: string;
  pointPosition: {
    bottom: string;
    left: string;
    [key: string]: string | number;
  };
  cameraPosition: {
    yaw: number;
    pitch: number;
    fov?: number;
  };
  minimap?: {
    src: string;
    position: {
      x: number;
      y: number;
    };
    radian: number;
    d: string;
  };
  description: string;
  image: string;
  thumbnail: string;
  markers: (MarkerConfig & {
    toPanorama?: string;
    toPanoramaTitle?: string;
  })[];
  metadata?: sharp.Metadata;
  // this field is used to determine if the panorama is new or not
  isNew?: boolean;
};

export type PanoramaOptionType = {
  id: string;
  name: string;
  panorama: PanoramaDataType;
};

export type PanoramaLocationType = {
  id: string;
  name: string;
  description: string;
  defaultOption: string;
  pointPosition: { bottom: string; left: string };
  options: PanoramaOptionType[];
};

export type ToolbarDebugHTML = {
  /**
   * Create button toolbar debug
   * @description Create button toolbar debug
   */
  initialize: () => void;

  /**
   * Tool active
   * @description Tool active
   */
  active: () => void;

  /**
   * Tool inactive
   * @description Tool inactive
   */
  inactive: () => void;

  /**
   * Destroy
   * @description Destroy
   */
  destroy: () => void;
};
