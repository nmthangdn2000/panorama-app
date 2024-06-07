import { Viewer } from '@photo-sphere-viewer/core';
import { saveProjectPanorama } from '../../../detail-panorama/detail-panorama';
import { PanoramaDataType, ToolbarDebugHTML } from '../../panorama.type';
import { EVENT_KEY } from '../../event.panorama';
import { btnOriginalPerspectiveHTML } from './html';

export class OriginalPerspective implements ToolbarDebugHTML {
  private viewer: Viewer;
  private panoramas: PanoramaDataType[];
  private isOriginalPerspective: boolean = false;
  private getCurrentPanorama: () => PanoramaDataType | undefined;

  private functionSpaceKey: any = (e: any) => this.handleSpaceKey(e);

  constructor(viewer: Viewer, panorama: PanoramaDataType[], getCurrentPanorama: () => PanoramaDataType | undefined) {
    this.viewer = viewer;
    this.panoramas = panorama;
    this.getCurrentPanorama = getCurrentPanorama;
  }

  initialize() {
    this.createToolbarOriginalPerspective();
    this.handleBtnOriginalPerspective();
  }

  active() {
    const btnOriginalPerspective = document.getElementById('btn_original_perspective')!;

    this.viewer.container.dispatchEvent(new Event(EVENT_KEY.REMOVE_ACTIVE_BUTTON_TOOLBAR));

    btnOriginalPerspective.classList.add('active');
    const centerElement = document.createElement('div');
    centerElement.id = 'debug_screen_center_viewer';
    this.isOriginalPerspective = true;
    document.addEventListener('keydown', this.functionSpaceKey);

    this.viewer.container.appendChild(centerElement);
  }

  inactive() {
    const btnOriginalPerspective = document.getElementById('btn_original_perspective')!;
    document.getElementById('debug_screen_center_viewer')?.remove();
    btnOriginalPerspective.classList.remove('active');
    this.isOriginalPerspective = false;
  }

  destroy() {
    this.inactive();
    document.removeEventListener('keydown', this.functionSpaceKey);
  }

  private createToolbarOriginalPerspective() {
    const toolbar = document.getElementById('toolbar_debug')! as HTMLElement;
    const btnOriginalPerspective = document.createElement('div');
    btnOriginalPerspective.id = 'btn_original_perspective';
    btnOriginalPerspective.classList.add('btn_option_toolbar');
    btnOriginalPerspective.innerHTML = btnOriginalPerspectiveHTML();

    toolbar.appendChild(btnOriginalPerspective);
  }

  private handleBtnOriginalPerspective() {
    const btnOriginalPerspective = document.getElementById('btn_original_perspective')!;

    btnOriginalPerspective.addEventListener('click', () => {
      if (btnOriginalPerspective.classList.contains('active')) {
        this.inactive();
        return;
      }

      return this.active();
    });
  }

  private async handleSpaceKey(e: KeyboardEvent) {
    if (this.isOriginalPerspective && e.key === ' ') {
      this.viewer.addEventListener(
        'render',
        async () => {
          const currentPanorama = this.getCurrentPanorama();

          if (!currentPanorama) return;

          const index = this.panoramas.findIndex((panorama) => panorama.id === currentPanorama.id);
          if (index < 0) return;

          this.panoramas[index].cameraPosition = this.viewer.getPosition();
          this.panoramas[index].cameraPosition.fov = this.viewer.getZoomLevel();
          this.panoramas[index].thumbnail = await new Promise((resolve) => {
            (document.querySelector('.psv-container canvas')! as HTMLCanvasElement).toBlob((blob) => {
              if (!blob) {
                resolve(this.panoramas[index].thumbnail);
                return;
              }

              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result! as string);
              reader.readAsDataURL(blob);
            });
          });

          console.log('save panorama', this.panoramas[index]);

          // opacity 1 to 0.5 to 1
          this.viewer.container.style.transition = 'opacity 0.3s ease-in-out';
          this.viewer.container.style.opacity = '0.5';
          setTimeout(() => {
            this.viewer.container.style.opacity = '1';
          }, 300);

          setTimeout(() => {
            this.viewer.container.style.transition = 'none';
          }, 600);

          saveProjectPanorama();
        },
        { once: true },
      );
      this.viewer.needsUpdate();
    }
  }
}
