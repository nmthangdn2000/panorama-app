import { BrowserWindow, dialog } from 'electron';
import { join, basename, extname, relative, dirname } from 'path';
import { existsSync, mkdirSync, statSync, readdirSync } from 'fs';
import { cpus } from 'os';
import sharp from 'sharp';
import { KEY_IPC } from '../../constants/common.constant';

export type CompressPreset = 'low' | 'medium' | 'high' | 'custom';

export type CompressOptions = {
  preset: CompressPreset;
  customQuality: number;
  outputFolder: string;
  sourceFolder?: string;
  suffix: string;
};

export type CompressProgressPayload = {
  current: number;
  total: number;
  progress: number;
  file: string;
  originalSize: number;
  compressedSize: number;
  outputPath: string | null;
  error?: string;
};

const PRESET_QUALITY: Record<CompressPreset, { jpeg: number; webp: number; png: boolean }> = {
  low:    { jpeg: 90, webp: 90, png: false },
  medium: { jpeg: 75, webp: 75, png: false },
  high:   { jpeg: 55, webp: 55, png: true },
  custom: { jpeg: 80, webp: 80, png: false },
};

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'tiff', 'bmp']);

const CONCURRENCY = Math.max(2, Math.ceil(cpus().length / 2));

const scanImages = (folder: string): string[] => {
  const results: string[] = [];
  for (const entry of readdirSync(folder, { withFileTypes: true })) {
    const fullPath = join(folder, entry.name);
    if (entry.isDirectory()) {
      results.push(...scanImages(fullPath));
    } else if (IMAGE_EXTENSIONS.has(extname(entry.name).replace('.', '').toLowerCase())) {
      results.push(fullPath);
    }
  }
  return results;
};

let cancelled = false;

export const selectImagesForCompress = async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Images', extensions: [...IMAGE_EXTENSIONS] }],
  });
  if (canceled) return undefined;
  return filePaths;
};

export const selectFolderForCompress = async (): Promise<{ folderPath: string; imagePaths: string[] } | undefined> => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  if (canceled) return undefined;
  const folderPath = filePaths[0];
  return { folderPath, imagePaths: scanImages(folderPath) };
};

export const selectOutputFolder = async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory'],
  });
  if (canceled) return undefined;
  return filePaths[0];
};

export const compressImages = async (
  event: Electron.IpcMainInvokeEvent,
  imagePaths: string[],
  options: CompressOptions
): Promise<{ success: number; failed: number }> => {
  cancelled = false;

  const { preset, customQuality, outputFolder, sourceFolder, suffix } = options;
  const total = imagePaths.length;
  let completed = 0;
  let successCount = 0;
  let failedCount = 0;

  if (!existsSync(outputFolder)) mkdirSync(outputFolder, { recursive: true });

  const sendProgress = (payload: CompressProgressPayload) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.webContents.send(KEY_IPC.IMAGE_COMPRESSOR_PROGRESS, payload);
  };

  const processOne = async (inputPath: string): Promise<void> => {
    if (cancelled) return;

    const ext = extname(inputPath).replace('.', '').toLowerCase();
    const name = basename(inputPath, extname(inputPath));
    const originalSize = statSync(inputPath).size;

    const relativeDir = sourceFolder ? relative(sourceFolder, dirname(inputPath)) : '';
    const outputDir = relativeDir ? join(outputFolder, relativeDir) : outputFolder;
    if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

    const outputFileName = `${name}${suffix}${extname(inputPath).toLowerCase()}`;
    const outputPath = join(outputDir, outputFileName);

    const jpegQ = preset === 'custom' ? customQuality : PRESET_QUALITY[preset].jpeg;
    const webpQ = preset === 'custom' ? customQuality : PRESET_QUALITY[preset].webp;
    const usePaletteForPng = preset !== 'custom' && PRESET_QUALITY[preset].png;

    let payload: CompressProgressPayload;

    try {
      let image = sharp(inputPath);

      if (ext === 'png') {
        image = image.png({ compressionLevel: 9, palette: usePaletteForPng, quality: usePaletteForPng ? 80 : undefined });
      } else if (ext === 'webp') {
        image = image.webp({ quality: webpQ });
      } else {
        image = image.jpeg({ quality: jpegQ, mozjpeg: true });
      }

      await image.toFile(outputPath);
      const compressedSize = statSync(outputPath).size;
      successCount++;

      completed++;
      payload = {
        current: completed,
        total,
        progress: Math.round((completed / total) * 100),
        file: basename(inputPath),
        originalSize,
        compressedSize,
        outputPath,
      };
    } catch (err: any) {
      failedCount++;
      completed++;
      payload = {
        current: completed,
        total,
        progress: Math.round((completed / total) * 100),
        file: basename(inputPath),
        originalSize,
        compressedSize: 0,
        outputPath: null,
        error: err?.message || 'Unknown error',
      };
    }

    sendProgress(payload);
  };

  // Concurrent queue: spawn CONCURRENCY workers, each pulls from the queue
  const queue = [...imagePaths];
  const worker = async () => {
    while (queue.length > 0 && !cancelled) {
      const inputPath = queue.shift();
      if (inputPath) await processOne(inputPath);
    }
  };

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, total) }, worker));

  return { success: successCount, failed: failedCount };
};

export const cancelCompress = () => {
  cancelled = true;
  return true;
};
