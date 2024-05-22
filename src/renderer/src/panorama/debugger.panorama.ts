import { ClickData, Viewer } from '@photo-sphere-viewer/core';
import { Marker, MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { btnHotSpot, formAddHotSpot, toolbarDebugHTML } from './html.panorama';
import { PanoramaDataType } from './panorama.type';

const INFO_OPTION_DEFAULT = 'Debug mode reserved for development teams';

export class DebuggerPanorama {
  private panoramaExport: PanoramaDataType[];
  private panoramas: PanoramaDataType[];
  private debugMode: boolean = false;
  private getCurrentPanorama: () => PanoramaDataType | undefined;
  private setMarkers: (panorama: PanoramaDataType) => void;
  private viewer: Viewer;
  private setAnimationToBtnArrow: () => void;

  private isAddHotSpot: boolean = false;
  private isOriginalPerspective: boolean = false;

  // function to remove event listener
  private functionClick: any = (e: any) => this.handleClickViewer(e);
  private functionEscKey: any = (e: any) => this.escKey(e);
  private functionSpaceKey: any = (e: any) => this.handleSpaceKey(e);

  constructor(
    viewer: Viewer,
    panorama: PanoramaDataType[],
    panoramaExport: PanoramaDataType[],
    debugMode: boolean,
    getCurrentPanorama: () => PanoramaDataType | undefined,
    setMarkers: (panorama: PanoramaDataType) => void,
    setAnimationToBtnArrow: () => void,
  ) {
    this.viewer = viewer;
    this.panoramas = panorama;
    this.panoramaExport = panoramaExport;
    this.debugMode = debugMode;
    this.getCurrentPanorama = getCurrentPanorama;
    this.setMarkers = setMarkers;
    this.setAnimationToBtnArrow = setAnimationToBtnArrow;

    this.openAndCloseDebugModeWithKey();
  }

  getDebugMode() {
    return this.debugMode;
  }

  private openAndCloseDebugModeWithKey() {
    // keystrokes to open debug mode (ctrl + shift + d)
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        this.debugMode = !this.debugMode;

        const currentPanorama = this.getCurrentPanorama();
        if (currentPanorama) this.setMarkers(currentPanorama);

        if (this.debugMode) {
          this.createToolbarDebug();
          this.registerEvents();
        } else {
          document.getElementById('toolbar_debug')?.remove();
          this.viewer.setCursor('all-scroll');
          this.unregisterEvents();
        }
      }
    });
  }

  private registerEvents() {
    this.viewer.addEventListener('click', this.functionClick);
    document.addEventListener('keydown', this.functionEscKey);
  }

  private unregisterEvents() {
    this.viewer.removeEventListener('click', this.functionClick);
    document.removeEventListener('keydown', this.functionEscKey);
    document.removeEventListener('keydown', this.functionSpaceKey);
  }

  private handleClickViewer({ data }: any) {
    if (!data) return;

    console.log(
      `${data.rightclick ? 'right ' : ''}clicked at yaw: ${data.yaw} pitch: ${data.pitch}`,
    );
    console.log({
      yaw: data.yaw,
      pitch: data.pitch,
    });

    if (this.isAddHotSpot) {
      this.createFormAddHotSpot(data);
    }
  }

  private createToolbarDebug() {
    const toolbarDebugElement = document.createElement('div');
    toolbarDebugElement.id = 'toolbar_debug';

    toolbarDebugElement.innerHTML = toolbarDebugHTML();

    this.viewer.container.parentElement!.appendChild(toolbarDebugElement);

    this.handleBtnAddHotSpot();
    this.handleBtnOriginalPerspective();
    this.handleButtonExport();
  }

  private removeActiveButtonOptionToolbar() {
    document.querySelectorAll('#toolbar_debug .btn_option_toolbar').forEach((element) => {
      element.classList.remove('active');
    });

    document.getElementById('debug_screen_center_viewer')?.remove();
    this.isAddHotSpot = false;
    this.viewer.setCursor('all-scroll');
    document.getElementById('debug_info_option')!.textContent = INFO_OPTION_DEFAULT;

    this.unregisterEvents();
  }

  // handle keydown
  private escKey(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      this.removeActiveButtonOptionToolbar();
    }
  }

  private handleSpaceKey(e: KeyboardEvent) {
    if (this.isOriginalPerspective && e.key === ' ') {
      const currentPanorama = this.getCurrentPanorama();
      if (!currentPanorama) return;

      const positionCenter = this.viewer.getPosition();

      const index = this.panoramas.findIndex((panorama) => panorama.id === currentPanorama.id);
      if (index < 0) return;

      this.panoramas[index].cameraPosition = positionCenter;
      this.panoramaExport[index].cameraPosition = positionCenter;

      // opacity 1 to 0.5 to 1
      this.viewer.container.style.transition = 'opacity 0.3s ease-in-out';
      this.viewer.container.style.opacity = '0.5';
      setTimeout(() => {
        this.viewer.container.style.opacity = '1';
      }, 300);

      setTimeout(() => {
        this.viewer.container.style.transition = 'none';
      }, 600);
    }
  }
  // handle keydown

  // handle button option toolbar
  private handleBtnAddHotSpot() {
    const btnAddHotSpot = document.getElementById('btn_add_hotspot')!;
    btnAddHotSpot.addEventListener('click', () => {
      if (btnAddHotSpot.classList.contains('active')) {
        btnAddHotSpot.classList.remove('active');
        this.viewer.setCursor('all-scroll');
        this.isAddHotSpot = false;
        document.getElementById('debug_info_option')!.textContent = INFO_OPTION_DEFAULT;
        return;
      }

      this.removeActiveButtonOptionToolbar();
      btnAddHotSpot.classList.add('active');
      this.viewer.setCursor('crosshair');
      this.isAddHotSpot = true;
      document.getElementById('debug_info_option')!.textContent =
        'Click on the panorama to add a new hotspot';
      this.viewer.addEventListener('click', this.functionClick);
    });
  }

  private handleBtnOriginalPerspective() {
    const btnOriginalPerspective = document.getElementById('btn_original_perspective')!;

    btnOriginalPerspective.addEventListener('click', () => {
      if (btnOriginalPerspective.classList.contains('active')) {
        document.getElementById('debug_screen_center_viewer')?.remove();
        btnOriginalPerspective.classList.remove('active');
        document.getElementById('debug_info_option')!.textContent = INFO_OPTION_DEFAULT;
        this.isOriginalPerspective = false;
        return;
      }

      this.removeActiveButtonOptionToolbar();
      btnOriginalPerspective.classList.add('active');
      const centerElement = document.createElement('div');
      centerElement.id = 'debug_screen_center_viewer';
      this.isOriginalPerspective = true;
      document.getElementById('debug_info_option')!.textContent =
        'Press "space" to save the current perspective';
      document.removeEventListener('keydown', this.functionEscKey);
      document.addEventListener('keydown', this.functionSpaceKey);

      this.viewer.container.appendChild(centerElement);
    });
  }

  private handleButtonExport() {
    document.getElementById('btn_export_data_panorama')!.addEventListener('click', () => {
      // create download link json file
      const a = document.createElement('a');
      const file = new Blob([JSON.stringify(this.panoramaExport)], { type: 'application/json' });
      a.href = URL.createObjectURL(file);
      a.download = `panoramas-${Date.now()}.json`;
      a.click();
    });
  }
  // handle button option toolbar

  private createFormAddHotSpot(data: ClickData) {
    const section = document.createElement('section');
    section.id = 'section-new-hotspot';

    section.innerHTML += formAddHotSpot(this.panoramas);

    this.viewer.container.parentElement!.appendChild(section);

    this.handleSubmitFormAddHotSpot(data);
    this.handleCancelFormAddHotSpot();
  }

  private handleSubmitFormAddHotSpot(data: ClickData) {
    document.getElementById('submit-new-hotspot')?.addEventListener('click', () => {
      const currentPanorama = this.getCurrentPanorama();

      if (!currentPanorama) return;

      const selectPanorama = document.getElementById('select-panorama') as HTMLSelectElement;
      const panoramaId = parseInt(selectPanorama.value);

      const toPanorama = this.panoramas.find((panorama) => panorama.id === panoramaId);

      if (!toPanorama) return;

      const markersPlugin = this.viewer.getPlugin<MarkersPlugin>(MarkersPlugin);

      const markerId = `marker${currentPanorama?.id}-${(currentPanorama?.markers.length || 0) + 1}`;

      const marker = {
        id: `marker${currentPanorama?.id}-${(currentPanorama?.markers.length || 0) + 1}`,
        zoomLvl: 90,
        position: {
          yaw: data.yaw,
          pitch: data.pitch,
        },
        html: btnHotSpot(`onMarkerClick(${toPanorama.id}, '${markerId}')`, `${toPanorama.title}`),
        style: {
          cursor: 'pointer',
          zIndex: '100',
        },
      };

      markersPlugin.addMarker(marker);

      this.createButtonRemoveMarker(markersPlugin.getMarker(marker.id));
      this.setAnimationToBtnArrow();

      const panorama = this.panoramas.findIndex((panorama) => panorama.id === currentPanorama.id);
      if (panorama < 0) return;

      this.panoramas[panorama].markers.push(marker);

      const markerExport = JSON.parse(JSON.stringify(marker));
      markerExport.html = `btnHotSpot("onMarkerClick(${toPanorama.id}, '${markerId}')", "${toPanorama.title}")`;

      this.panoramaExport[panorama].markers.push(markerExport);

      navigator.clipboard?.writeText(JSON.stringify(this.panoramaExport));

      document.getElementById('section-new-hotspot')?.remove();
    });
  }

  private handleCancelFormAddHotSpot() {
    document.getElementById('cancel-new-hotspot')?.addEventListener('click', () => {
      document.getElementById('section-new-hotspot')?.remove();
    });
  }

  createButtonRemoveMarker(marker: Marker) {
    const currentPanorama = this.getCurrentPanorama();

    if (!currentPanorama) return;

    const markersPlugin = this.viewer.getPlugin<MarkersPlugin>(MarkersPlugin);

    const btnRemove = document.createElement('button');
    btnRemove.innerText = 'X';
    btnRemove.className = 'btn-remove-marker';
    marker.domElement.appendChild(btnRemove);

    btnRemove.onclick = () => {
      markersPlugin.clearMarkers();

      const markerIndex = this.panoramas.findIndex(
        (panorama) => panorama.id === currentPanorama.id,
      );
      if (markerIndex < 0) return;

      const markerIndexRemove = this.panoramas[markerIndex].markers.findIndex(
        (m) => m.id === marker.id,
      );
      if (markerIndexRemove < 0) return;

      this.panoramas[markerIndex].markers.splice(markerIndexRemove, 1);
      this.panoramas[markerIndex].markers = this.panoramas[markerIndex].markers.map(
        (marker, index) => {
          return {
            ...marker,
            id: `marker${currentPanorama.id}-${index + 1}`,
            html: marker.html?.replace(
              /marker\d+-\d+/g,
              `marker${currentPanorama.id}-${index + 1}`,
            ),
          };
        },
      );

      this.panoramaExport[markerIndex].markers.splice(markerIndexRemove, 1);
      this.panoramaExport[markerIndex].markers = this.panoramaExport[markerIndex].markers.map(
        (marker, index) => {
          return {
            ...marker,
            id: `marker${currentPanorama.id}-${index + 1}`,
            html: marker.html?.replace(
              /marker\d+-\d+/g,
              `marker${currentPanorama.id}-${index + 1}`,
            ),
          };
        },
      );

      navigator.clipboard?.writeText(JSON.stringify(this.panoramas));

      this.setMarkers(currentPanorama);
    };
  }
}
