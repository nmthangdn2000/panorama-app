import { initFlowbite } from 'flowbite';
import '../../assets/scss/main.scss';
import { toast } from '../../common/toast';
import { CompressProgressPayload } from '../../../preload/image-compressor';

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
const btnCompress = document.getElementById('btn_compress') as HTMLButtonElement;
const btnCancel = document.getElementById('btn_cancel') as HTMLButtonElement;
const labelImageCount = document.getElementById('label_image_count') as HTMLSpanElement;
const labelOutputFolder = document.getElementById('label_output_folder') as HTMLSpanElement;
const presetBtns = document.querySelectorAll<HTMLButtonElement>('[data-preset]');
const customQualitySection = document.getElementById('custom_quality_section') as HTMLDivElement;
const inputCustomQuality = document.getElementById('input_custom_quality') as HTMLInputElement;
const labelCustomQuality = document.getElementById('label_custom_quality') as HTMLSpanElement;
const inputSuffix = document.getElementById('input_suffix') as HTMLInputElement;
const progressBar = document.getElementById('progress_bar') as HTMLDivElement;
const progressText = document.getElementById('progress_text') as HTMLSpanElement;
const progressSection = document.getElementById('progress_section') as HTMLDivElement;
const resultsSection = document.getElementById('results_section') as HTMLDivElement;
const resultsList = document.getElementById('results_list') as HTMLTableSectionElement;
const statsSaved = document.getElementById('stats_saved') as HTMLSpanElement;
const statsTotal = document.getElementById('stats_total') as HTMLSpanElement;

// Preset state
let selectedPreset: string = 'medium';

presetBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    selectedPreset = btn.dataset.preset!;
    presetBtns.forEach((b) => {
      b.className = b.className.replace('bg-blue-600 text-white dark:bg-blue-500', 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300');
    });
    btn.className = btn.className.replace('bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300', 'bg-blue-600 text-white dark:bg-blue-500');
    customQualitySection.style.display = selectedPreset === 'custom' ? 'block' : 'none';
  });
});

inputCustomQuality.addEventListener('input', () => {
  labelCustomQuality.textContent = inputCustomQuality.value;
});

function setSelectedImages(paths: string[], folder?: string) {
  selectedImages = paths;
  sourceFolder = folder;
  labelImageCount.textContent = `${paths.length} file(s) selected${folder ? ' (from folder)' : ''}`;
  labelImageCount.className = 'text-sm text-green-600 dark:text-green-400 font-medium';
  updateCompressButton();
}

btnSelectImages.addEventListener('click', async () => {
  const paths = await window.api.imageCompressor.selectImages();
  if (!paths || paths.length === 0) return;
  setSelectedImages(paths, undefined);
});

btnSelectFolder.addEventListener('click', async () => {
  const result = await window.api.imageCompressor.selectFolder();
  if (!result || result.imagePaths.length === 0) {
    if (result) toast({ message: 'No images found in the selected folder', type: 'error' });
    return;
  }
  setSelectedImages(result.imagePaths, result.folderPath);
});

btnSelectOutput.addEventListener('click', async () => {
  const folder = await window.api.imageCompressor.selectOutputFolder();
  if (!folder) return;
  outputFolder = folder;
  labelOutputFolder.textContent = folder;
  labelOutputFolder.className = 'text-sm text-green-600 dark:text-green-400 font-medium truncate';
  updateCompressButton();
});

function updateCompressButton() {
  btnCompress.disabled = selectedImages.length === 0 || outputFolder === '' || isProcessing;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

let totalOriginalSize = 0;
let totalCompressedSize = 0;

window.api.imageCompressor.onProgress((payload: CompressProgressPayload) => {
  progressBar.style.width = `${payload.progress}%`;
  progressText.textContent = `${payload.progress}% — ${payload.current}/${payload.total}: ${payload.file}`;

  if (payload.outputPath) {
    totalOriginalSize += payload.originalSize;
    totalCompressedSize += payload.compressedSize;
    const savedBytes = payload.originalSize - payload.compressedSize;
    const savedPct = payload.originalSize > 0 ? Math.round((savedBytes / payload.originalSize) * 100) : 0;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="px-4 py-2 text-gray-700 dark:text-gray-300 truncate max-w-xs" title="${payload.file}">${payload.file}</td>
      <td class="px-4 py-2 text-gray-500 dark:text-gray-400">${formatSize(payload.originalSize)}</td>
      <td class="px-4 py-2 text-green-600 dark:text-green-400">${formatSize(payload.compressedSize)}</td>
      <td class="px-4 py-2 font-medium ${savedPct > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}">-${savedPct}%</td>
    `;
    resultsList.appendChild(row);

    const totalSaved = totalOriginalSize - totalCompressedSize;
    const totalPct = totalOriginalSize > 0 ? Math.round((totalSaved / totalOriginalSize) * 100) : 0;
    statsSaved.textContent = `Saved: ${formatSize(totalSaved)} (-${totalPct}%)`;
    statsTotal.textContent = `${formatSize(totalOriginalSize)} → ${formatSize(totalCompressedSize)}`;
  } else if (payload.error) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="px-4 py-2 text-gray-700 dark:text-gray-300 truncate max-w-xs" title="${payload.file}">${payload.file}</td>
      <td class="px-4 py-2 text-gray-500 dark:text-gray-400">${formatSize(payload.originalSize)}</td>
      <td class="px-4 py-2 text-red-500" colspan="2">✘ ${payload.error}</td>
    `;
    resultsList.appendChild(row);
  }

  resultsSection.style.display = 'block';
});

btnCompress.addEventListener('click', async () => {
  if (selectedImages.length === 0 || !outputFolder) return;

  isProcessing = true;
  totalOriginalSize = 0;
  totalCompressedSize = 0;
  btnCompress.disabled = true;
  btnCancel.classList.remove('hidden');
  progressBar.style.width = '0%';
  progressText.textContent = '0%';
  progressSection.style.display = 'block';
  resultsSection.style.display = 'none';
  resultsList.innerHTML = '';
  statsSaved.textContent = '';
  statsTotal.textContent = '';

  try {
    const result = await window.api.imageCompressor.compress(selectedImages, {
      preset: selectedPreset as any,
      customQuality: parseInt(inputCustomQuality.value),
      outputFolder,
      sourceFolder,
      suffix: inputSuffix.value,
    });

    progressBar.style.width = '100%';
    progressText.textContent = `Done — ${result.success} succeeded, ${result.failed} failed`;

    if (result.failed > 0) {
      toast({ message: `Done: ${result.success} OK, ${result.failed} failed`, type: 'error' });
    } else {
      toast({ message: `Done: ${result.success} image(s) compressed`, type: 'success' });
    }
  } catch (err) {
    toast({ message: 'Compression failed', type: 'error' });
    console.error(err);
  } finally {
    isProcessing = false;
    btnCancel.classList.add('hidden');
    updateCompressButton();
  }
});

btnCancel.addEventListener('click', async () => {
  await window.api.imageCompressor.cancel();
  toast({ message: 'Cancelled', type: 'error' });
  btnCancel.classList.add('hidden');
  isProcessing = false;
  updateCompressButton();
});
