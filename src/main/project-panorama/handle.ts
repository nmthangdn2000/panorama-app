import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'fs';
import { join } from 'path';
import { FileType, NewProject, ProjectPanorama } from './type';
import sharp from 'sharp';
import { dialog } from 'electron';

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
