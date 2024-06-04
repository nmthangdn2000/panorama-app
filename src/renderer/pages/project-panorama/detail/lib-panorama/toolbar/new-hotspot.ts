import { ClickData, Viewer } from '@photo-sphere-viewer/core';
import { PanoramaDataType, ToolbarDebugHTML } from '../panorama.type';
import { btnHotSpot, formAddHotSpot } from '../html.panorama';
import { Marker, MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { saveProjectPanorama } from '../../detail-panorama/detail-panorama';
import { EVENT_KEY } from '../event.panorama';

const INFO_OPTION_DEFAULT = 'Debug mode reserved for development teams';

export class NewHotSpot implements ToolbarDebugHTML {
  private viewer: Viewer;
  private panoramas: PanoramaDataType[];
  private getCurrentPanorama: () => PanoramaDataType | undefined;
  private setMarkers: (panorama: PanoramaDataType) => void;
  private setAnimationToBtnArrow: () => void;

  private functionClick: any = (e: any) => this.handleClickViewer(e);

  private isAddHotSpot: boolean = false;

  constructor(
    viewer: Viewer,
    panorama: PanoramaDataType[],
    getCurrentPanorama: () => PanoramaDataType | undefined,
    setMarkers: (panorama: PanoramaDataType) => void,
    setAnimationToBtnArrow: () => void,
  ) {
    this.viewer = viewer;
    this.panoramas = panorama;
    this.getCurrentPanorama = getCurrentPanorama;
    this.setMarkers = setMarkers;
    this.setAnimationToBtnArrow = setAnimationToBtnArrow;
  }

  initialize() {
    this.handleBtnAddHotSpot();
    this.viewer.addEventListener('click', this.functionClick);
  }

  active() {
    const btnAddHotSpot = document.getElementById('btn_add_hotspot')!;
    this.viewer.container.dispatchEvent(new Event(EVENT_KEY.REMOVE_ACTIVE_BUTTON_TOOLBAR));

    btnAddHotSpot.classList.add('active');
    this.viewer.setCursor('crosshair');
    this.isAddHotSpot = true;
    document.getElementById('debug_info_option')!.textContent = 'Click on the panorama to add a new hotspot';
    this.viewer.addEventListener('click', this.functionClick);
  }

  inactive() {
    const btnAddHotSpot = document.getElementById('btn_add_hotspot')!;
    btnAddHotSpot.classList.remove('active');
    this.viewer.setCursor('all-scroll');
    this.isAddHotSpot = false;
    document.getElementById('debug_info_option')!.textContent = INFO_OPTION_DEFAULT;
  }

  destroy() {
    this.inactive();
    this.viewer.removeEventListener('click', this.functionClick);
  }

  private handleBtnAddHotSpot() {
    const btnAddHotSpot = document.getElementById('btn_add_hotspot')!;
    btnAddHotSpot.addEventListener('click', () => {
      if (btnAddHotSpot.classList.contains('active')) {
        this.inactive();
        return;
      }

      return this.active();
    });
  }

  private handleClickViewer({ data }: any) {
    if (!data) return;

    console.log(`${data.rightclick ? 'right ' : ''}clicked at yaw: ${data.yaw} pitch: ${data.pitch}`);
    console.log({
      yaw: data.yaw,
      pitch: data.pitch,
    });

    if (this.isAddHotSpot) {
      this.createFormAddHotSpot(data);
    }
  }

  private createFormAddHotSpot(data: ClickData) {
    const section = document.createElement('section');
    section.id = 'section-new-hotspot';

    section.innerHTML += formAddHotSpot(this.panoramas);

    this.viewer.container.parentElement!.appendChild(section);

    this.handleSubmitFormAddHotSpot(data);
    this.handleCancelFormAddHotSpot();
  }

  private handleCancelFormAddHotSpot() {
    document.getElementById('cancel-new-hotspot')?.addEventListener('click', () => {
      document.getElementById('section-new-hotspot')?.remove();
    });
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
        id: markerId,
        zoomLvl: 90,
        position: {
          yaw: data.yaw,
          pitch: data.pitch,
        },
        toPanorama: toPanorama.id,
        toPanoramaTitle: toPanorama.title,
        style: {
          cursor: 'pointer',
          zIndex: '100',
        },
      };

      markersPlugin.addMarker({
        ...marker,
        html: btnHotSpot(`onMarkerClick(${toPanorama.id}, '${markerId}')`, toPanorama.title),
      });

      this.createButtonRemoveMarker(markersPlugin.getMarker(marker.id));
      this.setAnimationToBtnArrow();

      const panorama = this.panoramas.findIndex((panorama) => panorama.id === currentPanorama.id);
      if (panorama < 0) return;

      this.panoramas[panorama].markers.push(marker);

      document.getElementById('section-new-hotspot')?.remove();

      saveProjectPanorama();
    });
  }

  createButtonRemoveMarker(marker: Marker) {
    const currentPanorama = this.getCurrentPanorama();

    if (!currentPanorama) return;

    const markersPlugin = this.viewer.getPlugin<MarkersPlugin>(MarkersPlugin);

    const btnRemove = document.createElement('button');
    btnRemove.innerText = '×';
    btnRemove.className = 'btn-remove-marker';
    marker.domElement.appendChild(btnRemove);

    btnRemove.onclick = () => {
      markersPlugin.clearMarkers();

      const markerIndex = this.panoramas.findIndex((panorama) => panorama.id === currentPanorama.id);
      if (markerIndex < 0) return;

      const markerIndexRemove = this.panoramas[markerIndex].markers.findIndex((m) => m.id === marker.id);
      if (markerIndexRemove < 0) return;

      this.panoramas[markerIndex].markers.splice(markerIndexRemove, 1);
      this.panoramas[markerIndex].markers = this.panoramas[markerIndex].markers.map((marker, index) => {
        return {
          ...marker,
          id: `marker${currentPanorama.id}-${index + 1}`,
        };
      });

      this.setMarkers(currentPanorama);
    };

    saveProjectPanorama();
  }
}
