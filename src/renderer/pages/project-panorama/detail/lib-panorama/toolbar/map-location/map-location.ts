import { Viewer } from '@photo-sphere-viewer/core';
import { ToolbarDebugHTML } from '../../panorama.type';
import { btnMapHTML, modalMapLocationHTML } from './html';
import { EVENT_KEY } from '../../event.panorama';
import { initModals, Modal } from 'flowbite';

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
  }

  inactive() {
    const btnAddHotSpot = document.getElementById('btn_map_location')!;
    btnAddHotSpot.classList.remove('active');
    this.viewer.setCursor('all-scroll');
    this.modalMapLocation?.hide();
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

    this.modalMapLocation = new Modal(document.getElementById('modal_map_location')!, {});

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
}
