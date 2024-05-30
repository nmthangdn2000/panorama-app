import { Modal } from 'flowbite';

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

const resetRenderProject = () => {
  progressModal.hide();
  progressBar.style.width = '0%';
  progressBar.innerHTML = '0%';
  progressBar.classList.remove('bg-green-500');
  iconSuccess.classList.add('hidden');
  iconProcessing.classList.remove('hidden');
  btnOkProgress.classList.add('hidden');
  btnCancelProgress.classList.remove('hidden');
  txtProgress.innerHTML = 'Processing render project...';
};

const renderProject = () => {
  currentProgress = 0;
  progressPercentage = 0;
  processing = false;

  btnRenderPanorama.addEventListener('click', async () => {
    const url = new URL(window.location.href);
    const name = url.searchParams.get('name');

    setTimeout(() => {
      progressModal.show();
    }, 500);

    const result = await window.api.projectPanorama.renderProject(name!, {
      panoramas: window.panoramas,
      panoramasImport: window.panoramasImport,
    });

    if (result) {
    }
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
      setTimeout(() => {
        progressBar.style.width = `${i}%`;
        progressBar.innerHTML = `${i}%`;

        if (i === 100) {
          processing = false;
          currentProgress = 0;
          progressPercentage = 0;
          progressBar.classList.add('bg-green-500');
          progressBar.innerHTML = 'Done';

          iconSuccess.classList.remove('hidden');
          iconProcessing.classList.add('hidden');

          btnOkProgress.classList.remove('hidden');
          btnCancelProgress.classList.add('hidden');

          txtProgress.innerHTML = 'Render project successfully!';
        }

        if (i === progressPercentage) {
          processing = false;
          currentProgress = percentage;
        }
      }, 50 * i);
    }
  }
});

export default () => {
  renderProject();
};
