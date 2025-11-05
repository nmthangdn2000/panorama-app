import { Viewer } from '@photo-sphere-viewer/core';
import { PanoramaDataType } from './panorama.type';
import { convertLocationsToPanoramas } from '../../../../common/panorama-utils';
import { OriginalPerspective } from './toolbar/original-perspective/original-perspective';
import { Marker } from '@photo-sphere-viewer/markers-plugin';
import { EVENT_KEY } from './event.panorama';
import { NewHotSpot } from './toolbar/new-hotspot/new-hotspot';
import { MapLocation } from './toolbar/map-location/map-location';
import { initFlowbite, Modal } from 'flowbite';
import { closeToolbarDebugHTML } from './html.panorama';

initFlowbite();

export class DebuggerPanorama {
  private debugMode: boolean = false;
  private getCurrentPanorama: () => PanoramaDataType | undefined;
  private setMarkers: (panorama: PanoramaDataType) => void;
  private viewer: Viewer;

  // toolbar debug
  private newHotSpot: NewHotSpot | undefined;
  private originalPerspective: OriginalPerspective | undefined;
  private mapLocation: MapLocation | undefined;

  constructor(
    viewer: Viewer,
    panorama: PanoramaDataType[],
    debugMode: boolean,
    getCurrentPanorama: () => PanoramaDataType | undefined,
    setMarkers: (panorama: PanoramaDataType) => void,
    setAnimationToBtnArrow: () => void,
    setPanorama: (panoramaUrl: string) => void,
  ) {
    this.viewer = viewer;
    this.debugMode = debugMode;
    this.getCurrentPanorama = getCurrentPanorama;
    this.setMarkers = setMarkers;

    // Use locations if available, otherwise fall back to panoramas
    const locations = (window as any).locations || [];
    const panoramas = locations.length > 0 ? convertLocationsToPanoramas(locations) : panorama;

    this.newHotSpot = new NewHotSpot(viewer, locations, getCurrentPanorama, setMarkers, setAnimationToBtnArrow);
    this.originalPerspective = new OriginalPerspective(viewer, panoramas, getCurrentPanorama);
    this.mapLocation = new MapLocation(viewer, panoramas, setPanorama, getCurrentPanorama);

    this.toggleDebugMode();
    this.openAndCloseDebugModeWithKey();
    this.removeActiveButtonOptionToolbar();
  }

  getDebugMode() {
    return this.debugMode;
  }

  private openAndCloseDebugModeWithKey() {
    // keystrokes to open debug mode (ctrl + shift + d)
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        this.debugMode = !this.debugMode;

        this.toggleDebugMode();
      }

      // keystrokes to close debug mode (esc)
      if (e.key.toLowerCase() === 'escape') {
        this.newHotSpot?.inactive();
        this.originalPerspective?.inactive();
        this.mapLocation?.inactive();
      }
    });
  }

  private toggleDebugMode() {
    const currentPanorama = this.getCurrentPanorama();
    if (currentPanorama) this.setMarkers(currentPanorama);

    if (this.debugMode) {
      return this.init();
    }

    return this.destroy();
  }

  init() {
    this.createToolbarDebug();

    this.newHotSpot?.initialize();
    this.originalPerspective?.initialize();
    this.mapLocation?.initialize();
  }

  destroy() {
    this.viewer.setCursor('all-scroll');

    this.newHotSpot?.destroy();
    this.originalPerspective?.destroy();
    this.mapLocation?.destroy();

    document.getElementById('toolbar_debug')?.remove();
  }

  private createToolbarDebug() {
    const toolbarDebugElement = document.createElement('div');
    toolbarDebugElement.id = 'toolbar_debug';
    toolbarDebugElement.innerHTML = closeToolbarDebugHTML();

    const btnCloseModalPreview = toolbarDebugElement.querySelector('#btn_close_modal_preview')!;
    btnCloseModalPreview.addEventListener('click', () => {
      const modal = new Modal(document.getElementById('modal_viewer')!, {});
      modal.hide();
    });

    this.viewer.container.parentElement!.appendChild(toolbarDebugElement);
  }

  private removeActiveButtonOptionToolbar() {
    this.viewer.container.addEventListener(EVENT_KEY.REMOVE_ACTIVE_BUTTON_TOOLBAR, () => {
      document.querySelectorAll('#toolbar_debug .btn_option_toolbar').forEach((element) => {
        element.classList.remove('active');
      });

      this.newHotSpot?.inactive();
      this.originalPerspective?.inactive();
      this.mapLocation?.inactive();
    });
  }

  createButtonRemoveMarker(marker: Marker) {
    this.newHotSpot?.createButtonRemoveMarker(marker);
  }
}
