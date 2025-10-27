import { Modal } from 'flowbite';
import { itemRadioTileSize } from './html';
import { convertLocationsToPanoramas } from '../../../../common/panorama-utils';

let currentProgress = 0;
let progressPercentage = 0;
let processing = false;

const progressBar = document.getElementById('progress_bar')! as HTMLDivElement;
const iconSuccess = document.getElementById('icon_success')! as HTMLSpanElement;
const iconProcessing = document.getElementById('icon_processing')! as HTMLSpanElement;
const btnCancelProgress = document.getElementById('btn_cancel_progress')! as HTMLButtonElement;
const btnOkProgress = document.getElementById('btn_ok_progress')! as HTMLButtonElement;
const btnRenderPanorama = document.getElementById('btn_render_panorama')! as HTMLButtonElement;
const txtProgress = document.getElementById('txt_processing_render_project')! as HTMLSpanElement;
const progressModal = new Modal(document.getElementById('progress_modal')!, {
  backdrop: 'static',
  closable: false,
});
const settingModalPanorama = new Modal(document.getElementById('modal_setting_render_panorama')!);
const formSettingRenderPanorama = document.getElementById('form_setting_render_panorama')! as HTMLFormElement;

const resetRenderProject = () => {
  window.location.reload();
};

const renderProject = () => {
  currentProgress = 0;
  progressPercentage = 0;
  processing = false;

  btnRenderPanorama.addEventListener('click', async () => {
    settingModalPanorama.show();

    // Use only new structure (locations)
    const panoramas = window.locations && window.locations.length > 0 ? convertLocationsToPanoramas(window.locations) : [];

    if (panoramas.length === 0) {
      console.error('No panoramas available for rendering');
      return;
    }

    const widthPanorama = panoramas[0].metadata?.width;

    const faceSize = widthPanorama / 4;
    const tileSizes: number[] = [];
    const tileSizesOptions = [2, 4, 8, 16];

    for (let i = 0; i < tileSizesOptions.length; i++) {
      if (faceSize % tileSizesOptions[i] === 0) {
        tileSizes.push(faceSize / tileSizesOptions[i]);
      }
    }

    formSettingRenderPanorama.querySelector('div')!.innerHTML = tileSizes
      .sort((a, b) => a - b)
      .map((size, index) => itemRadioTileSize(size, index))
      .join('');

    // get data from form
    formSettingRenderPanorama.addEventListener('submit', async (e) => {
      e.preventDefault();
      settingModalPanorama.hide();

      const data = new FormData(formSettingRenderPanorama);

      const size = data.get('item_size_radio') as number | null;

      if (!size) return;

      handleRenderProject(size);
    });
  });

  settingModalPanorama.updateOnHide(() => {
    console.log('Hide setting modal');
  });

  document.getElementById('btn_close_modal_setting_render_panorama')!.addEventListener('click', () => {
    settingModalPanorama.hide();
  });

  btnCancelProgress.addEventListener('click', async () => {
    const isCancel = await window.api.projectPanorama.cancelProgress();
    if (isCancel) {
      currentProgress = 0;
      progressPercentage = 0;
      processing = false;
    }

    resetRenderProject();
  });

  btnOkProgress.addEventListener('click', () => resetRenderProject());
};

window.api.projectPanorama.processingProject((percentage: number) => {
  progressPercentage = percentage;

  if (!processing || currentProgress < progressPercentage) {
    processing = true;
    for (let i = currentProgress; i <= progressPercentage; i++) {
      setTimeout(
        () => {
          progressBar.style.width = `${i}%`;
          progressBar.innerHTML = `${i}%`;

          if (i === 100) {
            processing = false;
            currentProgress = 0;
            progressPercentage = 0;
            progressBar.classList.add('!bg-green-500');
            progressBar.innerHTML = 'Done';

            iconSuccess.classList.remove('hidden');
            iconProcessing.classList.add('hidden');

            btnOkProgress.classList.remove('hidden');
            btnCancelProgress.classList.add('hidden');

            txtProgress.textContent = 'Render project successfully!';
          }

          if (i === progressPercentage) {
            processing = false;
            currentProgress = percentage;
          }
        },
        50 * (i - currentProgress),
      );
    }
  }
});

const handleRenderProject = async (size: number) => {
  const url = new URL(window.location.href);
  const name = url.searchParams.get('name');

  if (!name) {
    console.error('Project name is required');
    return;
  }

  setTimeout(() => {
    progressModal.show();
  }, 500);

  // Use new structure (locations) with fallback to old structure (panoramas)
  let panoramas: any[] = [];

  if (window.locations && window.locations.length > 0) {
    panoramas = convertLocationsToPanoramas(window.locations);
  } else if (window.panoramas && window.panoramas.length > 0) {
    panoramas = window.panoramas;
  }

  // Calculate faceSize and nbTiles for each panorama
  const panoramasWithMetadata = panoramas.map((panorama) => {
    if (panorama.metadata) {
      const nbTiles = Math.floor(panorama.metadata.width / 4 / size);

      return {
        ...panorama,
        metadata: {
          ...panorama.metadata,
          faceSize: Number(size),
          nbTiles,
        },
      };
    }
    return panorama;
  });

  const result = await window.api.projectPanorama.renderProject(name, size, {
    panoramas: panoramasWithMetadata,
    locations: window.locations, // Include locations if available
  });

  if (!result) {
    processing = false;
    currentProgress = 0;
    progressPercentage = 0;
    progressBar.classList.add('!bg-red-500');
    progressBar.innerHTML = 'Failed';

    iconSuccess.classList.remove('hidden');
    iconProcessing.classList.add('hidden');

    btnOkProgress.classList.remove('hidden');
    btnCancelProgress.classList.add('hidden');

    txtProgress.textContent = 'Render project failed!';
  }
};

export default () => {
  renderProject();
};
