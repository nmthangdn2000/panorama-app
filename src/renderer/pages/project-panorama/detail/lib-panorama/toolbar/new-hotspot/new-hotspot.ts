import { ClickData, Viewer } from '@photo-sphere-viewer/core';
import { Marker, MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { PanoramaDataType, PanoramaLocationType, ToolbarDebugHTML } from '../../panorama.type';
import { EVENT_KEY } from '../../event.panorama';
import { btnAddHotSpotHtml, btnHotSpot, formAddHotSpot } from './html';
import { saveProjectPanorama } from '../../../detail-panorama/detail-panorama';

export class NewHotSpot implements ToolbarDebugHTML {
  private viewer: Viewer;
  private locations: PanoramaLocationType[];
  private getCurrentPanorama: () => PanoramaDataType | undefined;
  private setMarkers: (panorama: PanoramaDataType) => void;
  private setAnimationToBtnArrow: () => void;

  private functionClick: any = (e: any) => this.handleClickViewer(e);

  private isAddHotSpot: boolean = false;

  constructor(
    viewer: Viewer,
    locations: PanoramaLocationType[],
    getCurrentPanorama: () => PanoramaDataType | undefined,
    setMarkers: (panorama: PanoramaDataType) => void,
    setAnimationToBtnArrow: () => void,
  ) {
    this.viewer = viewer;
    this.locations = locations;
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

    // Show all locations for selection
    section.innerHTML += formAddHotSpot(this.locations);

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
      const locationId = selectPanorama.value;

      // Find the location by ID
      const toLocation = this.locations.find((location) => location.id === locationId);
      if (!toLocation) return;

      // Get the default option of the target location
      // Prefer second option if available, otherwise first option
      const toOption =
        toLocation.options.find((option) => option.id === toLocation.defaultOption) || (toLocation.options.length > 1 ? toLocation.options[1] : toLocation.options[0]);
      if (!toOption) return;

      const markersPlugin = this.viewer.getPlugin<MarkersPlugin>(MarkersPlugin);

      // Find the current location that contains the current panorama
      let currentLocation: PanoramaLocationType | undefined;
      if (window.locations) {
        currentLocation = window.locations.find((location) => location.options.some((option) => option.panorama.image === currentPanorama.image));
      }

      if (!currentLocation) {
        console.log('ERROR: Could not find current location containing the panorama');
        return;
      }

      const markerId = `marker${Date.now()}-${(currentLocation.markers?.length || 0) + 1}`;

      const marker = {
        id: markerId,
        zoomLvl: 90,
        position: {
          yaw: data.yaw,
          pitch: data.pitch,
        },
        toPanorama: toOption.id,
        toPanoramaTitle: toLocation.name,
        style: {
          cursor: 'pointer',
          zIndex: '100',
        },
      };

      markersPlugin.addMarker({
        ...marker,
        html: btnHotSpot(`onMarkerClick('${toOption.id}', '${markerId}')`, toLocation.name),
      });

      this.createButtonRemoveMarker(markersPlugin.getMarker(marker.id));
      this.setAnimationToBtnArrow();

      // Add marker to location (shared across all options)
      if (window.locations) {
        // Ensure markers array exists
        if (!currentLocation.markers) {
          currentLocation.markers = [];
        }
        currentLocation.markers.push(marker);
        console.log('Added marker to location:', currentLocation.name);
        console.log('Total markers now:', currentLocation.markers.length);
      } else {
        console.log('window.locations is not defined, cannot save marker');
      }

      document.getElementById('section-new-hotspot')?.remove();

      console.log('Calling saveProjectPanorama() immediately after adding marker');
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
      console.log('Removing marker:', marker.id);

      // Find the current location that contains the current panorama
      let currentLocation: PanoramaLocationType | undefined;
      if (window.locations) {
        currentLocation = window.locations.find((location) => location.options.some((option) => option.panorama.image === currentPanorama.image));
      }

      if (!currentLocation || !currentLocation.markers) {
        console.log('ERROR: Could not find current location or location has no markers');
        return;
      }

      console.log('Found current location:', currentLocation.name);
      console.log('Current markers before removal:', currentLocation.markers.length);

      const markerIndexRemove = currentLocation.markers.findIndex((m) => m.id === marker.id);
      if (markerIndexRemove < 0) {
        console.log('ERROR: Marker not found in location markers');
        return;
      }

      // Remove only the specific marker from location
      currentLocation.markers.splice(markerIndexRemove, 1);
      console.log('Markers after removal:', currentLocation.markers.length);

      // Update marker IDs to be sequential
      currentLocation.markers = currentLocation.markers.map((marker, index) => {
        return {
          ...marker,
          id: `marker${Date.now()}-${index + 1}`,
        };
      });

      // Clear and re-set markers
      markersPlugin.clearMarkers();
      this.setMarkers(currentPanorama);

      console.log('Marker removal completed');
    };

    saveProjectPanorama();
  }
}
