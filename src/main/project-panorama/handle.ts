import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'fs';
import { join } from 'path';
import { FileType, NewProject, ProjectPanorama } from './type';
import sharp from 'sharp';
import { dialog } from 'electron';

export const getFiles = async (dir: string): Promise<FileType[]> => {
  const readDir = readdirSync(dir);

  const files = readDir
    .filter((file) => {
      const stats = statSync(join(dir, file));

      return stats.isFile() && /\.(jpe?g|png|gif)$/i.test(file);
    })
    .sort((a, b) => {
      if (a.length === b.length) {
        return a.localeCompare(b);
      }
      return a.length - b.length;
    });

  return Promise.all(
    files.map(async (file) => {
      const metadata = await sharp(join(dir, file)).metadata();

      return {
        name: file,
        path: join(dir, file),
        base64: readFileSync(join(dir, file), 'base64'),
        metadata,
      };
    }),
  );
};

export const openDirectory = async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });

  if (canceled) return;

  const files = await getFiles(filePaths[0]);

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
