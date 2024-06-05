import { spawn } from 'child_process';
import { BrowserWindow, dialog } from 'electron';
import { copyFileSync, createWriteStream, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'fs';
import { join } from 'path';
import { RenderProject, FileType, NewProject, ProjectPanorama } from './type';
import { KEY_IPC } from '../../constants/common.constant';
import archiver from 'archiver';
import { platform } from 'os';
import { getSetting } from '../setting/handle';
import Jimp from 'jimp';
import { is } from '@electron-toolkit/utils';

let CHILD;

const checkPathProject = async () => {
  const setting = await getSetting();

  if (!setting || !setting.projectFolderPath) {
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      await BrowserWindow.getAllWindows()[0].loadURL(`${process.env['ELECTRON_RENDERER_URL']}/pages/settings/index.html`);
    } else {
      await BrowserWindow.getAllWindows()[0].loadFile(join(__dirname, '../renderer/src/renderer/pages/settings/index.html'));
    }

    throw new Error('Project folder path is not set');
  }

  return setting.projectFolderPath;
};

export const getFiles = async (filePaths: string[]): Promise<FileType[]> => {
  return Promise.all(
    filePaths.map(async (filePath) => {
      const metadata = await Jimp.read(filePath);

      return {
        name: filePath.split(/[\\/]/).pop()!,
        path: filePath,
        metadata: {
          width: metadata.getWidth(),
          height: metadata.getHeight(),
        },
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
  const path = await checkPathProject();
  const pathProject = join(path, name);

  if (!existsSync(pathProject)) {
    mkdirSync(pathProject, { recursive: true });
  }

  if (avatar && avatar.path) {
    const buffer = readFileSync(avatar.path);
    // convert to jpeg
    await (await Jimp.read(buffer)).resize(400, Jimp.AUTO).quality(80).writeAsync(join(pathProject, 'avatar.jpg'));
  }

  if (description) {
    const descriptionPath = join(pathProject, 'description.txt');
    writeFileSync(descriptionPath, description);
  }

  return pathProject;
};

export const getProjects = async () => {
  const path = await checkPathProject();

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
      pathFolder: join(path, dir),
    });
  });

  return projects;
};

export const getProject = async (name: string): Promise<ProjectPanorama | null> => {
  const path = await checkPathProject();
  const pathProject = join(path, name);

  if (!existsSync(pathProject)) {
    return null;
  }

  const avatar = `file://${pathProject}/avatar.jpg`;
  const description = existsSync(join(pathProject, 'description.txt')) ? readFileSync(join(pathProject, 'description.txt'), 'utf-8') : '';

  const panoramas = existsSync(join(pathProject, 'panoramas.json')) ? JSON.parse(readFileSync(join(pathProject, 'panoramas.json'), 'utf-8')) : [];
  const panoramasImport = existsSync(join(pathProject, 'import-panoramas.json')) ? JSON.parse(readFileSync(join(pathProject, 'import-panoramas.json'), 'utf-8')) : [];

  const imagesQuality = existsSync(join(pathProject, 'panoramas')) ? readdirSync(join(pathProject, 'panoramas')) : [];
  const imagesLow = existsSync(join(pathProject, 'panoramas-low')) ? readdirSync(join(pathProject, 'panoramas-low')) : [];
  const listCube = existsSync(join(pathProject, 'cube')) ? readdirSync(join(pathProject, 'cube')) : [];
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
    pathFolder: pathProject,
  };
};

export const deleteProject = async (name: string) => {
  const path = await checkPathProject();
  const pathProject = join(path, name);

  if (!existsSync(pathProject)) {
    return false;
  }

  rmSync(pathProject, { recursive: true });

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
  try {
    cancelProgress();

    const { panoramas } = renderData;

    const totalProcess = panoramas.length + 1;
    const tasks: string[] = [];

    const path = await checkPathProject();

    await saveProject(name, renderData, true);
    pushTaskProgress(tasks, totalProcess);

    // panorama to cube

    // check platform
    const plf = platform();

    const toolName = plf === 'darwin' ? 'cubemap-generator-macos' : 'cubemap-generator-win.exe';

    // check is exist tool
    const toolPath1 = join(process.cwd(), 'resources', toolName);
    const toolPath2 = join(process.cwd(), 'resources', 'app.asar.unpacked', 'resources', toolName);
    const isExistTool = existsSync(toolPath1);

    const toolPath = isExistTool ? toolPath1 : toolPath2;
    const inputQualityPath = join(path, name, 'panoramas');
    const inputLowPath = join(path, name, 'panoramas-low');
    const outputPath = join(path, name, 'cube');

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

    return `${toolPath}  --input-quality "${inputQualityPath}" --input-low "${inputLowPath}" --output "${outputPath}" --size 375 --quality 80`;
  } catch (error) {
    console.log('renderProject', error);
    return false;
  }
};

export const cancelProgress = () => {
  if (CHILD) {
    console.log('kill child process');

    CHILD.kill();
  }

  return true;
};

export const exportProject = async (name: string, pathFolder: string) => {
  const path = await checkPathProject();
  const pathProject = join(path, name);

  //  project to zip
  const zipPath = join(pathFolder, `${name}.zip`);

  await zipDirectory(pathProject, zipPath);

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

export const saveProject = async (name: string, project: RenderProject, isRender?: boolean) => {
  const path = await checkPathProject();
  const pathProject = join(path, name);

  if (!existsSync(join(path, name, 'panoramas'))) {
    mkdirSync(join(path, name, 'panoramas'), { recursive: true });
  }

  if (!existsSync(join(path, name, 'panoramas-low'))) {
    mkdirSync(join(path, name, 'panoramas-low'), { recursive: true });
  }

  const newPanoramas = await Promise.all(
    project.panoramas.map(async (panorama) => {
      let image = panorama.image;

      if (panorama.isNew) {
        const pathImage = join(pathProject, 'panoramas', `${panorama.title}.jpg`);

        let imagePanoram = panorama.image;

        const regex = /[\/\\]/;
        if (regex.test(imagePanoram)) {
          copyFileSync(panorama.image.substring(7), pathImage);

          if (isRender) {
            // create file low quality
            const buffer = readFileSync(panorama.image.substring(7));

            await (
              await Jimp.read(buffer)
            )
              .resize(2000, Jimp.AUTO)
              .quality(40)
              .writeAsync(join(path, name, 'panoramas-low', `${panorama.title}-low.jpg`));
            // .toFormat('jpeg', {
            //   quality: 40,
            //   progressive: true,
            //   force: true,
            //   trellisQuantisation: true,
            //   overshootDeringing: true,
            //   optimizeScans: true,
            //   optimizeCoding: true,
            //   quantisationTable: 2,
            //   chromaSubsampling: '4:4:4',
            //   quantizationTable: 2,
            // })
            // .toFile(join(path, name, 'panoramas-low', `${panorama.title}-low.jpg`));
          }

          image = `${panorama.title}.jpg`;
        }
      }

      return {
        ...panorama,
        image,
      };
    }),
  );

  writeFileSync(join(pathProject, 'panoramas.json'), JSON.stringify(newPanoramas, null, 2));

  // remove panorama
  const currentPanoramas = readdirSync(join(path, name, 'panoramas'));

  currentPanoramas.forEach((cp) => {
    const fileNames = cp.split('.jpg')[0];
    const isExist = project.panoramas.find((p) => p.title === fileNames);

    if (!isExist) {
      rmSync(join(path, name, 'panoramas', cp));
      if (isRender) {
        if (existsSync(join(path, name, 'panoramas-low', `${fileNames}-low.jpg`))) {
          rmSync(join(path, name, 'panoramas-low', `${fileNames}-low.jpg`));
        }

        if (existsSync(join(path, name, 'cube', fileNames))) {
          rmSync(join(path, name, 'cube', fileNames), { recursive: true });
        }
      }
    }
  });

  return true;
};
