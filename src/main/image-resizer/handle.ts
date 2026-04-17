import { BrowserWindow, dialog, ipcMain } from 'electron';
import { join, basename, extname, relative, dirname } from 'path';
import { existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import sharp from 'sharp';
import { KEY_IPC } from '../../constants/common.constant';

export type ResizeFormat = 'jpeg' | 'png' | 'webp' | 'original';

export type ResizeOptions = {
  width: number | null;
  height: number | null;
  maintainAspectRatio: boolean;
  format: ResizeFormat;
  quality: number;
  outputFolder: string;
  suffix: string;
  sourceFolder?: string;
};

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'tiff', 'bmp']);

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

export const selectImagesForResize = async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Images', extensions: [...IMAGE_EXTENSIONS] }],
  });
  if (canceled) return undefined;
  return filePaths;
};

export const selectFolderForResize = async (): Promise<{ folderPath: string; imagePaths: string[] } | undefined> => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  if (canceled) return undefined;
  const folderPath = filePaths[0];
  const imagePaths = scanImages(folderPath);
  return { folderPath, imagePaths };
};

export const selectOutputFolder = async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory'],
  });
  if (canceled) return undefined;
  return filePaths[0];
};

export const resizeImages = async (
  event: Electron.IpcMainInvokeEvent,
  imagePaths: string[],
  options: ResizeOptions
): Promise<{ success: string[]; failed: { path: string; error: string }[] }> => {
  cancelled = false;

  const { width, height, maintainAspectRatio, format, quality, outputFolder, suffix } = options;

  if (!existsSync(outputFolder)) mkdirSync(outputFolder, { recursive: true });

  const success: string[] = [];
  const failed: { path: string; error: string }[] = [];
  const total = imagePaths.length;

  for (let i = 0; i < imagePaths.length; i++) {
    if (cancelled) break;

    const inputPath = imagePaths[i];
    const name = basename(inputPath, extname(inputPath));
    const originalExt = extname(inputPath).replace('.', '').toLowerCase();

    let outputFormat: 'jpeg' | 'png' | 'webp' = 'jpeg';
    let outputExt = 'jpg';

    if (format === 'original') {
      if (originalExt === 'png') { outputFormat = 'png'; outputExt = 'png'; }
      else if (originalExt === 'webp') { outputFormat = 'webp'; outputExt = 'webp'; }
      else { outputFormat = 'jpeg'; outputExt = 'jpg'; }
    } else if (format === 'png') {
      outputFormat = 'png';
      outputExt = 'png';
    } else if (format === 'webp') {
      outputFormat = 'webp';
      outputExt = 'webp';
    } else {
      outputFormat = 'jpeg';
      outputExt = 'jpg';
    }

    const outputFileName = `${name}${suffix}.${outputExt}`;
    const relativeDir = options.sourceFolder ? relative(options.sourceFolder, dirname(inputPath)) : '';
    const outputDir = relativeDir ? join(outputFolder, relativeDir) : outputFolder;
    if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });
    const outputPath = join(outputDir, outputFileName);

    try {
      let image = sharp(inputPath);
      const metadata = await image.metadata();

      if (width || height) {
        const resizeOpts: sharp.ResizeOptions = {};
        if (maintainAspectRatio) {
          resizeOpts.fit = 'inside';
          resizeOpts.withoutEnlargement = false;
        } else {
          resizeOpts.fit = 'fill';
        }
        image = image.resize(width || undefined, height || undefined, resizeOpts);
      }

      if (outputFormat === 'jpeg') {
        image = image.jpeg({ quality });
      } else if (outputFormat === 'webp') {
        image = image.webp({ quality });
      } else {
        image = image.png();
      }

      await image.toFile(outputPath);
      success.push(outputPath);
    } catch (err: any) {
      failed.push({ path: inputPath, error: err?.message || 'Unknown error' });
    }

    const progress = Math.round(((i + 1) / total) * 100);
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      win.webContents.send(KEY_IPC.IMAGE_RESIZER_PROGRESS, {
        current: i + 1,
        total,
        progress,
        file: basename(inputPath),
        outputPath: success[success.length - 1] ?? null,
      });
    }
  }

  return { success, failed };
};

export const cancelResize = () => {
  cancelled = true;
  return true;
};
