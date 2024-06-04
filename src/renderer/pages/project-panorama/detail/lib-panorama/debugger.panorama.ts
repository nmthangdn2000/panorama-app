import { Viewer } from '@photo-sphere-viewer/core';
import { toolbarDebugHTML } from './html.panorama';
import { PanoramaDataType } from './panorama.type';
import { NewHotSpot } from './toolbar/new-hotspot';
import { OriginalPerspective } from './toolbar/original-perspective';
import { Marker } from '@photo-sphere-viewer/markers-plugin';
import { EVENT_KEY } from './event.panorama';

export class DebuggerPanorama {
  private debugMode: boolean = false;
  private getCurrentPanorama: () => PanoramaDataType | undefined;
  private setMarkers: (panorama: PanoramaDataType) => void;
  private viewer: Viewer;

  // toolbar debug
  private newHotSpot: NewHotSpot | undefined;
  private originalPerspective: OriginalPerspective | undefined;

  constructor(
    viewer: Viewer,
    panorama: PanoramaDataType[],
    debugMode: boolean,
    getCurrentPanorama: () => PanoramaDataType | undefined,
    setMarkers: (panorama: PanoramaDataType) => void,
    setAnimationToBtnArrow: () => void,
  ) {
    this.viewer = viewer;
    this.debugMode = debugMode;
    this.getCurrentPanorama = getCurrentPanorama;
    this.setMarkers = setMarkers;

    this.newHotSpot = new NewHotSpot(viewer, panorama, getCurrentPanorama, setMarkers, setAnimationToBtnArrow);
    this.originalPerspective = new OriginalPerspective(viewer, panorama, getCurrentPanorama);

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
  }

  destroy() {
    this.viewer.setCursor('all-scroll');

    this.newHotSpot?.destroy();
    this.originalPerspective?.destroy();

    document.getElementById('toolbar_debug')?.remove();
  }

  private createToolbarDebug() {
    const toolbarDebugElement = document.createElement('div');
    toolbarDebugElement.id = 'toolbar_debug';

    toolbarDebugElement.innerHTML = toolbarDebugHTML();

    this.viewer.container.parentElement!.appendChild(toolbarDebugElement);
  }

  private removeActiveButtonOptionToolbar() {
    this.viewer.container.addEventListener(EVENT_KEY.REMOVE_ACTIVE_BUTTON_TOOLBAR, () => {
      console.log(EVENT_KEY.REMOVE_ACTIVE_BUTTON_TOOLBAR);

      document.querySelectorAll('#toolbar_debug .btn_option_toolbar').forEach((element) => {
        element.classList.remove('active');
      });

      this.newHotSpot?.inactive();
      this.originalPerspective?.inactive();
    });
  }

  createButtonRemoveMarker(marker: Marker) {
    this.newHotSpot?.createButtonRemoveMarker(marker);
  }
}
