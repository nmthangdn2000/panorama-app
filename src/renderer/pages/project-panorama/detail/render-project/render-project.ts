import { Modal } from 'flowbite';
import { deviceTileSizeSection } from './html';
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

    // Get metadata from location (now stored at location level)
    let widthPanorama: number | undefined;
    let heightPanorama: number | undefined;
    if (window.locations && window.locations.length > 0) {
      const metadata = window.locations[0].metadata;
      widthPanorama = metadata?.pc?.width || metadata?.tablet?.width || metadata?.mobile?.width;
      heightPanorama = metadata?.pc?.height || metadata?.tablet?.height || metadata?.mobile?.height;
    }

    if (!widthPanorama || !heightPanorama) {
      console.error('Panorama metadata not found');
      return;
    }

    // Calculate tile sizes for each device
    const calculateTileSizes = (width: number) => {
      const faceSize = width / 4;
      const tileSizes: number[] = [];
      const tileSizesOptions = [2, 4, 8, 16];

      for (let i = 0; i < tileSizesOptions.length; i++) {
        if (faceSize % tileSizesOptions[i] === 0) {
          tileSizes.push(faceSize / tileSizesOptions[i]);
        }
      }

      return tileSizes;
    };

    // PC: Original size
    const pcTileSizes = calculateTileSizes(widthPanorama);

    // Tablet: 4096x2048 (minimum)
    const tabletWidth = 4096;
    const tabletHeight = 2048;
    const tabletTileSizes = calculateTileSizes(tabletWidth);

    // Mobile: 2048x1024 (minimum)
    const mobileWidth = 2048;
    const mobileHeight = 1024;
    const mobileTileSizes = calculateTileSizes(mobileWidth);

    // Render device sections
    const container = formSettingRenderPanorama.querySelector('div')!;
    container.innerHTML = `
      ${deviceTileSizeSection('pc', pcTileSizes, widthPanorama, heightPanorama)}
      ${deviceTileSizeSection('tablet', tabletTileSizes, tabletWidth, tabletHeight)}
      ${deviceTileSizeSection('mobile', mobileTileSizes, mobileWidth, mobileHeight)}
    `;

    // get data from form
    formSettingRenderPanorama.addEventListener('submit', async (e) => {
      e.preventDefault();
      settingModalPanorama.hide();

      const data = new FormData(formSettingRenderPanorama);

      const pcSize = data.get('item_size_radio_pc') as string | null;
      const tabletSize = data.get('item_size_radio_tablet') as string | null;
      const mobileSize = data.get('item_size_radio_mobile') as string | null;

      if (!pcSize || !tabletSize || !mobileSize) {
        console.error('All device sizes are required');
        return;
      }

      handleRenderProject({
        pc: Number(pcSize),
        tablet: Number(tabletSize),
        mobile: Number(mobileSize),
      });
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

const handleRenderProject = async (sizes: { pc: number; tablet: number; mobile: number }) => {
  const url = new URL(window.location.href);
  const name = url.searchParams.get('name');

  if (!name) {
    console.error('Project name is required');
    return;
  }

  setTimeout(() => {
    progressModal.show();
  }, 500);

  // Update locations with faceSize and nbTiles for rendering
  let updatedLocations = window.locations;

  if (window.locations && window.locations.length > 0) {
    updatedLocations = window.locations.map((location) => ({
      ...location,
      metadata: {
        ...location.metadata,
        // PC faceSize and nbTiles
        pc: {
          ...location.metadata?.pc,
          faceSize: Number(sizes.pc),
          nbTiles: location.metadata?.pc?.width ? Math.floor(location.metadata.pc.width / 4 / sizes.pc) : 0,
        },
        // Tablet faceSize and nbTiles (based on 4096x2048)
        tablet: {
          faceSize: Number(sizes.tablet),
          nbTiles: Math.floor(4096 / 4 / sizes.tablet),
        },
        // Mobile faceSize and nbTiles (based on 2048x1024)
        mobile: {
          faceSize: Number(sizes.mobile),
          nbTiles: Math.floor(2048 / 4 / sizes.mobile),
        },
      },
    }));
  }

  // Use new structure (locations) with fallback to old structure (panoramas)
  let panoramas: any[] = [];

  if (updatedLocations && updatedLocations.length > 0) {
    panoramas = convertLocationsToPanoramas(updatedLocations);
  } else if (window.panoramas && window.panoramas.length > 0) {
    panoramas = window.panoramas;
  }

  const result = await window.api.projectPanorama.renderProject(name, sizes, {
    panoramas: panoramas,
    locations: updatedLocations, // Include updated locations with faceSize and nbTiles
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
