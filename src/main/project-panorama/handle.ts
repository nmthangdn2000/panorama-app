import { spawn } from 'child_process';
import { BrowserWindow, dialog } from 'electron';
import { copyFileSync, createWriteStream, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';
import { RenderProject, FileType, NewProject, ProjectPanorama } from './type';
import { KEY_IPC } from '../../constants/common.constant';
import archiver from 'archiver';

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
    properties: ['openDirectory', 'createDirectory'],
  });

  if (canceled) return;

  return filePaths ? filePaths[0] : undefined;
};

export const openDialogSelectImages = async () => {
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

export const renderProject = async (name: string, renderData: RenderProject) => {
  const { panoramasImport, panoramas } = renderData;

  const totalProcess = panoramas.length * 3 + 2 + 1;
  const tasks: string[] = [];

  if (!existsSync(join(process.cwd(), 'projects', name, 'panoramas'))) {
    mkdirSync(join(process.cwd(), 'projects', name, 'panoramas'), { recursive: true });
  }

  if (!existsSync(join(process.cwd(), 'projects', name, 'panoramas-low'))) {
    mkdirSync(join(process.cwd(), 'projects', name, 'panoramas-low'), { recursive: true });
  }

  const newPanoramas = await Promise.all(
    panoramas.map(async (panorama) => {
      let image = panorama.image;

      if (panorama.isNew) {
        const path = join(process.cwd(), 'projects', name, 'panoramas', `${panorama.title}.jpg`);

        copyFileSync(panorama.image.substring(7), path);

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

        image = `file://${path}`;
      }

      pushTaskProgress(tasks, totalProcess);

      return {
        ...panorama,
        image,
      };
    }),
  );

  writeFileSync(join(process.cwd(), 'projects', name, 'panoramas.json'), JSON.stringify(newPanoramas, null, 2));
  pushTaskProgress(tasks, totalProcess);

  writeFileSync(join(process.cwd(), 'projects', name, 'import-panoramas.json'), JSON.stringify(panoramasImport, null, 2));
  pushTaskProgress(tasks, totalProcess);

  // remove panorama
  const currentPanoramas = readdirSync(join(process.cwd(), 'projects', name, 'panoramas'));

  currentPanoramas.forEach((cp) => {
    const fileNames = cp.split('.jpg')[0];
    const isExist = panoramas.find((p) => p.title === fileNames);

    if (!isExist) {
      rmSync(join(process.cwd(), 'projects', name, 'panoramas', cp));
      rmSync(join(process.cwd(), 'projects', name, 'panoramas-low', `${fileNames}-low.jpg`));
      rmSync(join(process.cwd(), 'projects', name, 'cube', fileNames), { recursive: true });
    }
  });

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
    CHILD = spawn(toolPath, ['--input-quality', inputQualityPath, '--input-low', inputLowPath, '--output', outputPath, '--size', '375', '--quality', '80']);

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

export const exportProject = async (name: string, pathFolder: string) => {
  const path = join(process.cwd(), 'projects', name);

  //  project to zip
  const zipPath = join(pathFolder, `${name}.zip`);

  await zipDirectory(path, zipPath);

  return true;
};

const zipDirectory = (sourceDir: string, outPath: string) => {
  const archive = archiver('zip', { zlib: { level: 9 } });
  const stream = createWriteStream(outPath);

  return new Promise((resolve, reject) => {
    archive
      .directory(sourceDir, false)
      .on('error', (err) => reject(err))
      .pipe(stream);

    stream.on('close', () => resolve(true));
    archive.finalize();
  });
};
