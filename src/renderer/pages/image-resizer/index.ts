import { initFlowbite } from 'flowbite';
import '../../assets/scss/main.scss';
import { toast } from '../../common/toast';
import { ResizeProgressPayload } from '../../../preload/image-resizer';

initFlowbite();

// State
let selectedImages: string[] = [];
let sourceFolder: string | undefined;
let outputFolder = '';
let isProcessing = false;

// DOM refs
const btnSelectImages = document.getElementById('btn_select_images') as HTMLButtonElement;
const btnSelectFolder = document.getElementById('btn_select_folder') as HTMLButtonElement;
const btnSelectOutput = document.getElementById('btn_select_output') as HTMLButtonElement;
const btnResize = document.getElementById('btn_resize') as HTMLButtonElement;
const btnCancel = document.getElementById('btn_cancel') as HTMLButtonElement;
const inputWidth = document.getElementById('input_width') as HTMLInputElement;
const inputHeight = document.getElementById('input_height') as HTMLInputElement;
const checkAspectRatio = document.getElementById('check_aspect_ratio') as HTMLInputElement;
const selectFormat = document.getElementById('select_format') as HTMLSelectElement;
const inputQuality = document.getElementById('input_quality') as HTMLInputElement;
const labelQuality = document.getElementById('label_quality') as HTMLSpanElement;
const inputSuffix = document.getElementById('input_suffix') as HTMLInputElement;
const labelOutputFolder = document.getElementById('label_output_folder') as HTMLSpanElement;
const labelImageCount = document.getElementById('label_image_count') as HTMLSpanElement;
const progressBar = document.getElementById('progress_bar') as HTMLDivElement;
const progressText = document.getElementById('progress_text') as HTMLSpanElement;
const progressSection = document.getElementById('progress_section') as HTMLDivElement;
const resultsSection = document.getElementById('results_section') as HTMLDivElement;
const resultsList = document.getElementById('results_list') as HTMLTableSectionElement;
const qualitySection = document.getElementById('quality_section') as HTMLDivElement;

// Show/hide quality based on format
selectFormat.addEventListener('change', () => {
  qualitySection.style.display = selectFormat.value === 'png' ? 'none' : 'block';
});

// Sync quality label
inputQuality.addEventListener('input', () => {
  labelQuality.textContent = inputQuality.value;
});

function setSelectedImages(paths: string[], folder?: string) {
  selectedImages = paths;
  sourceFolder = folder;
  labelImageCount.textContent = `${paths.length} file(s) selected${folder ? ` (from folder)` : ''}`;
  labelImageCount.className = 'text-sm text-green-600 dark:text-green-400 font-medium';
  updateResizeButton();
}

// Select individual images
btnSelectImages.addEventListener('click', async () => {
  const paths = await window.api.imageResizer.selectImages();
  if (!paths || paths.length === 0) return;
  setSelectedImages(paths, undefined);
});

// Select folder (scans images recursively)
btnSelectFolder.addEventListener('click', async () => {
  const result = await window.api.imageResizer.selectFolder();
  if (!result || result.imagePaths.length === 0) {
    if (result) toast({ message: 'No images found in the selected folder', type: 'error' });
    return;
  }
  setSelectedImages(result.imagePaths, result.folderPath);
});

// Select output folder
btnSelectOutput.addEventListener('click', async () => {
  const folder = await window.api.imageResizer.selectOutputFolder();
  if (!folder) return;
  outputFolder = folder;
  labelOutputFolder.textContent = folder;
  labelOutputFolder.className = 'text-sm text-green-600 dark:text-green-400 font-medium truncate';
  updateResizeButton();
});

function updateResizeButton() {
  btnResize.disabled = selectedImages.length === 0 || outputFolder === '' || isProcessing;
}

// Register progress listener once
window.api.imageResizer.onProgress((payload: ResizeProgressPayload) => {
  progressBar.style.width = `${payload.progress}%`;
  progressText.textContent = `${payload.progress}% — ${payload.current}/${payload.total}: ${payload.file}`;

  const row = document.createElement('tr');
  const status = payload.outputPath
    ? `<td class="px-4 py-2 text-green-600 dark:text-green-400">✔ Done</td>`
    : `<td class="px-4 py-2 text-red-500">✘ Failed</td>`;
  row.innerHTML = `
    <td class="px-4 py-2 text-gray-700 dark:text-gray-300 truncate max-w-xs" title="${payload.file}">${payload.file}</td>
    ${status}
    <td class="px-4 py-2 text-gray-500 dark:text-gray-400 truncate max-w-xs" title="${payload.outputPath ?? ''}">${payload.outputPath ?? '-'}</td>
  `;
  resultsList.appendChild(row);
  resultsSection.style.display = 'block';
});

// Start resize
btnResize.addEventListener('click', async () => {
  if (selectedImages.length === 0 || !outputFolder) return;

  const width = inputWidth.value ? parseInt(inputWidth.value) : null;
  const height = inputHeight.value ? parseInt(inputHeight.value) : null;

  if (!width && !height) {
    toast({ message: 'Enter at least Width or Height', type: 'error' });
    return;
  }

  isProcessing = true;
  btnResize.disabled = true;
  btnCancel.classList.remove('hidden');
  progressBar.style.width = '0%';
  progressText.textContent = '0%';
  progressSection.style.display = 'block';
  resultsSection.style.display = 'none';
  resultsList.innerHTML = '';

  try {
    const result = await window.api.imageResizer.resize(selectedImages, {
      width,
      height,
      maintainAspectRatio: checkAspectRatio.checked,
      format: selectFormat.value as any,
      quality: parseInt(inputQuality.value),
      outputFolder,
      suffix: inputSuffix.value,
      sourceFolder,
    });

    const failed = result.failed.length;
    const success = result.success.length;

    for (const f of result.failed) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="px-4 py-2 text-gray-700 dark:text-gray-300 truncate max-w-xs" title="${f.path}">${f.path.split(/[\\/]/).pop()}</td>
        <td class="px-4 py-2 text-red-500">✘ Failed</td>
        <td class="px-4 py-2 text-red-400 truncate max-w-xs" title="${f.error}">${f.error}</td>
      `;
      resultsList.appendChild(row);
    }

    progressBar.style.width = '100%';
    progressText.textContent = `Done — ${success} succeeded, ${failed} failed`;

    if (failed > 0) {
      toast({ message: `Done: ${success} OK, ${failed} failed`, type: 'error' });
    } else {
      toast({ message: `Done: ${success} image(s) resized`, type: 'success' });
    }
  } catch (err) {
    toast({ message: 'Resize failed', type: 'error' });
    console.error(err);
  } finally {
    isProcessing = false;
    btnCancel.classList.add('hidden');
    updateResizeButton();
  }
});

// Cancel
btnCancel.addEventListener('click', async () => {
  await window.api.imageResizer.cancel();
  toast({ message: 'Cancelled', type: 'error' });
  btnCancel.classList.add('hidden');
  isProcessing = false;
  updateResizeButton();
});
