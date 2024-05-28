import { Modal } from 'flowbite';

let currentProgress = 0;
let progressPercentage = 0;
let processing = false;

const progressBar = document.getElementById('progress_bar')! as HTMLDivElement;

const exportProject = () => {
  const btnRenderPanorama = document.getElementById('btn_render_panorama')! as HTMLButtonElement;
  const btnCancelProgress = document.getElementById('btn_cancel_progress')! as HTMLButtonElement;
  const progressModal = new Modal(document.getElementById('progress_modal')!, {
    backdrop: 'static',
    closable: false,
  });

  currentProgress = 0;
  progressPercentage = 0;
  processing = false;

  btnRenderPanorama.addEventListener('click', async () => {
    const url = new URL(window.location.href);
    const name = url.searchParams.get('name');
    console.log(name);

    setTimeout(() => {
      progressModal.show();
    }, 500);

    const result = await window.api.projectPanorama.exportProject(name!, {
      panoramas: window.panoramas,
      panoramasImport: window.panoramasImport,
    });

    console.log(result);
  });

  btnCancelProgress.addEventListener('click', async () => {
    const isCancel = await window.api.projectPanorama.cancelProgress();
    if (isCancel) {
      progressModal.hide();
      currentProgress = 0;
      progressPercentage = 0;
      processing = false;
    }
  });
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
          progressBar.classList.add('bg-success');
          progressBar.innerHTML = 'Done';
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
  exportProject();
};
