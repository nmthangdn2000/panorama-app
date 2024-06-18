import { ClickData, Viewer } from '@photo-sphere-viewer/core';
import { Marker, MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { PanoramaDataType, ToolbarDebugHTML } from '../../panorama.type';
import { EVENT_KEY } from '../../event.panorama';
import { btnAddHotSpotHtml, btnHotSpot, formAddHotSpot } from './html';
import { saveProjectPanorama } from '../../../detail-panorama/detail-panorama';

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
    this.createToolbarAddHotSpot();
    this.viewer.addEventListener('click', this.functionClick);
    this.handleBtnAddHotSpot();

    document.addEventListener('keydown', (e) => {
      // press "v" to active add hot spot
      if (e.key.toLowerCase() === 'h') {
        if (this.isAddHotSpot) {
          return this.inactive();
        }
        return this.active();
      }
    });
  }

  active() {
    const btnAddHotSpot = document.getElementById('btn_add_hotspot')!;
    this.viewer.container.dispatchEvent(new Event(EVENT_KEY.REMOVE_ACTIVE_BUTTON_TOOLBAR));

    btnAddHotSpot.classList.add('active');
    this.viewer.setCursor('crosshair');
    this.isAddHotSpot = true;
  }

  inactive() {
    const btnAddHotSpot = document.getElementById('btn_add_hotspot')!;
    btnAddHotSpot.classList.remove('active');
    this.viewer.setCursor('all-scroll');
    this.isAddHotSpot = false;
  }

  destroy() {
    this.inactive();
    this.viewer.removeEventListener('click', this.functionClick);
  }

  private createToolbarAddHotSpot() {
    const toolbar = document.getElementById('toolbar_debug')! as HTMLElement;
    const btnAddHotSpot = document.createElement('div');
    btnAddHotSpot.id = 'btn_add_hotspot';
    btnAddHotSpot.className = 'btn_option_toolbar';
    btnAddHotSpot.innerHTML = btnAddHotSpotHtml();
    toolbar.appendChild(btnAddHotSpot);
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
      const panoramaId = selectPanorama.value;

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
        html: btnHotSpot(`onMarkerClick('${toPanorama.id}', '${markerId}')`, toPanorama.title),
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
