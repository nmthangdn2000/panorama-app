import { spawn } from 'child_process';
import { BrowserWindow, dialog } from 'electron';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';
import { ExportProject, FileType, NewProject, ProjectPanorama } from './type';
import { KEY_IPC } from '../../constants/common.constant';

let CHILD;

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

export const getProject = async (name: string): Promise<ProjectPanorama | null> => {
  const path = join(process.cwd(), 'projects', name);

  if (!existsSync(path)) {
    return null;
  }

  const avatar = `file://${path}/avatar.jpg`;
  const description = existsSync(join(path, 'description.txt')) ? readFileSync(join(path, 'description.txt'), 'utf-8') : '';

  const panoramas = existsSync(join(path, 'panoramas.json')) ? JSON.parse(readFileSync(join(path, 'panoramas.json'), 'utf-8')) : [];
  const panoramasImport = existsSync(join(path, 'import-panoramas.json')) ? JSON.parse(readFileSync(join(path, 'import-panoramas.json'), 'utf-8')) : [];

  const imagesQuality = existsSync(join(path, 'panoramas')) ? readdirSync(join(path, 'panoramas')) : [];
  const imagesLow = existsSync(join(path, 'panoramas-low')) ? readdirSync(join(path, 'panoramas-low')) : [];
  const listCube = existsSync(join(path, 'cube')) ? readdirSync(join(path, 'cube')) : [];
  const hasCube = listCube.length > 0 && listCube.length === imagesQuality.length && listCube.length === imagesLow.length;

  return {
    name,
    avatar,
    description,
    panoramas,
    panoramasImport,
    imagesQuality,
    imagesLow,
    hasCube,
  };
};

export const deleteProject = async (name: string) => {
  const path = join(process.cwd(), 'projects', name);

  if (!existsSync(path)) {
    return false;
  }

  rmSync(path, { recursive: true });

  return true;
};

const calculateProgress = (total: number, current: number) => {
  const progressPercentage = Math.floor((current / total) * 100);

  return BrowserWindow.getAllWindows()[0].webContents.send(KEY_IPC.PROCESSING_PROJECT, progressPercentage);
};

const pushTaskProgress = (tasks: string[], totalProcess: number) => {
  if (tasks.length === totalProcess) return;
  tasks.push('done');
  calculateProgress(totalProcess, tasks.length);
};

export const exportProject = async (name: string, exportData: ExportProject) => {
  const { panoramasImport, panoramas } = exportData;

  const totalProcess = panoramas.length * 3 + 2 + 1;
  const tasks: string[] = [];

  const newPanoramas = await Promise.all(
    panoramas.map(async (panorama) => {
      if (!existsSync(join(process.cwd(), 'projects', name, 'panoramas'))) {
        mkdirSync(join(process.cwd(), 'projects', name, 'panoramas'), { recursive: true });
      }

      if (!existsSync(join(process.cwd(), 'projects', name, 'panoramas-low'))) {
        mkdirSync(join(process.cwd(), 'projects', name, 'panoramas-low'), { recursive: true });
      }

      copyFileSync(panorama.image.substring(7), join(process.cwd(), 'projects', name, 'panoramas', `${panorama.title}.jpg`));

      // create file low quality
      const buffer = readFileSync(panorama.image.substring(7));

      await sharp(buffer)
        .resize(2000)
        .toFormat('jpeg', {
          quality: 40,
          progressive: true,
          force: true,
          trellisQuantisation: true,
          overshootDeringing: true,
          optimizeScans: true,
          optimizeCoding: true,
          quantisationTable: 2,
          chromaSubsampling: '4:4:4',
          quantizationTable: 2,
        })
        .toFile(join(process.cwd(), 'projects', name, 'panoramas-low', `${panorama.title}-low.jpg`));

      pushTaskProgress(tasks, totalProcess);

      return {
        ...panorama,
        image: `${panorama.title}.jpg`,
      };
    }),
  );

  writeFileSync(join(process.cwd(), 'projects', name, 'panoramas.json'), JSON.stringify(newPanoramas, null, 2));
  pushTaskProgress(tasks, totalProcess);

  writeFileSync(join(process.cwd(), 'projects', name, 'import-panoramas.json'), JSON.stringify(panoramasImport, null, 2));
  pushTaskProgress(tasks, totalProcess);

  // panorama to cube

  const toolPath = `${process.cwd()}/resources/cubemap-generator-macos`;
  const inputQualityPath = join(process.cwd(), 'projects', name, 'panoramas');
  const inputLowPath = join(process.cwd(), 'projects', name, 'panoramas-low');
  const outputPath = join(process.cwd(), 'projects', name, 'cube');

  await new Promise((resolve, reject) => {
    if (CHILD) {
      console.log('kill child process');

      CHILD.kill();
    }

    console.log('spawn child process');

    // `${toolPath}  --input-quality "${inputQualityPath}" --input-low "${inputLowPath}" --output "${outputPath}" --size 375 --quality 80`
    CHILD = spawn(toolPath, ['--input-quality', inputQualityPath, '--input-low', inputLowPath, '--output', outputPath, '--size', '375', '--quality', '80'], {
      shell: true,
    });

    CHILD.stderr.on('data', (data) => {
      const regex = /✔ PROCESSED SUCCESSFULLY PANORAMA LOW TO CUBE MAP:\s*(.*?)\n/;

      const match = data.toString().match(regex);

      if (match) {
        if (match[1]) {
          pushTaskProgress(tasks, totalProcess);
          pushTaskProgress(tasks, totalProcess);
        }
      }
    });

    CHILD.on('error', (err) => {
      console.log(`error: ${err.message}`);
      reject(err);
    });

    CHILD.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
      resolve(true);
    });
  });

  if (tasks.length < totalProcess) {
    for (let i = tasks.length; i < totalProcess; i++) {
      pushTaskProgress(tasks, totalProcess);
    }
  }

  return true;
};

export const cancelProgress = () => {
  if (CHILD) {
    console.log('kill child process');

    CHILD.kill();
  }

  return true;
};
