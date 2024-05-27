import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'fs';
import { join } from 'path';
import { ExportProject, FileType, NewProject, ProjectPanorama } from './type';
import { dialog } from 'electron';
import { convertImage, OptionsType } from './panorama-to-cubemap';
import sharp = require('sharp');

const options: OptionsType = {
  rotation: 180,
  interpolation: 'lanczos',
  outformat: 'jpg',
  outtype: 'buffer',
  width: Infinity,
};

export const getFiles = async (filePaths: string[]): Promise<FileType[]> => {
  return Promise.all(
    filePaths.map(async (filePath) => {
      const metadata = await sharp(filePath).metadata();

      return {
        name: filePath.split('/').pop()!,
        path: filePath,
        metadata,
      };
    }),
  );
};

export const openDirectory = async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif'] }],
  });

  if (canceled) return;

  const files = await getFiles(filePaths);

  return files;
};

export const newProject = async ({ name, description, avatar }: NewProject) => {
  const path = join(process.cwd(), 'projects', name);

  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }

  if (avatar && avatar.path) {
    const buffer = readFileSync(avatar.path);
    // convert to jpeg
    await sharp(buffer).toFile(join(path, `avatar.jpg`));
  }

  if (description) {
    const descriptionPath = join(path, 'description.txt');
    writeFileSync(descriptionPath, description);
  }

  return path;
};

export const getProjects = async () => {
  const path = join(process.cwd(), 'projects');

  if (!existsSync(path)) {
    return [];
  }

  const readDir = readdirSync(path);

  const projects: ProjectPanorama[] = [];
  readDir.forEach((dir) => {
    const stats = statSync(join(path, dir));

    if (!stats.isDirectory()) return;

    projects.push({
      name: dir,
      avatar: `file://${path}/${dir}/avatar.jpg`,
      description: existsSync(join(path, dir, 'description.txt')) ? readFileSync(join(path, dir, 'description.txt'), 'utf-8') : '',
    });
  });

  return projects;
};

export const deleteProject = async (name: string) => {
  const path = join(process.cwd(), 'projects', name);

  if (!existsSync(path)) {
    return false;
  }

  rmSync(path, { recursive: true });

  return true;
};

export const exportProject = async (name: string, exportData: ExportProject) => {
  const { panoramasImport, panoramas } = exportData;

  const newPanoramas = panoramas.map((panorama) => {
    if (!existsSync(join(process.cwd(), 'projects', name, 'panoramas', panorama.title))) {
      mkdirSync(join(process.cwd(), 'projects', name, 'panoramas', panorama.title), { recursive: true });
    }

    copyFileSync(panorama.image.substring(7), join(process.cwd(), 'projects', name, 'panoramas', panorama.title, `${panorama.title}.jpg`));

    return {
      ...panorama,
      image: `${panorama.title}.jpg`,
    };
  });

  writeFileSync(join(process.cwd(), 'projects', name, 'panoramas.json'), JSON.stringify(newPanoramas, null, 2));
  writeFileSync(join(process.cwd(), 'projects', name, 'import-panoramas.json'), JSON.stringify(panoramasImport, null, 2));

  // panorama to cube
  for (let i = 0; i < newPanoramas.length; i++) {
    console.log(`Converting panorama ${i + 1} of ${newPanoramas.length}`);

    const panorama = newPanoramas[i];

    const { image } = panorama;
    const filePath = join(process.cwd(), 'projects', name, 'panoramas', panorama.title, image);

    console.log('Converting panorama', filePath);

    const files = await convertImage(filePath, options);

    files.forEach((file: { buffer: Buffer; filename: string }) => {
      writeFileSync(join(process.cwd(), 'projects', name, 'panoramas', panorama.title, file.filename), file.buffer);
    });
  }

  return true;
};
