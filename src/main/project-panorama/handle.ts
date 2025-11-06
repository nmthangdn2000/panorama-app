import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { BrowserWindow, dialog } from 'electron';
import { copyFileSync, createWriteStream, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'fs';
import { join } from 'path';
import { RenderProject, FileType, NewProject, ProjectPanorama } from './type';
import { KEY_IPC } from '../../constants/common.constant';
import archiver from 'archiver';
import { platform } from 'os';
import { getSetting } from '../setting/handle';
import sharp from 'sharp';
import { is } from '@electron-toolkit/utils';
import { isBase64Image } from '../utils/util';
import { Worker } from 'worker_threads';
import { PanoramaLocationType, DataVirtualTourType } from '../../renderer/pages/project-panorama/detail/lib-panorama/panorama.type';

let CHILD: ChildProcessWithoutNullStreams | undefined;
const regexPath = /[\/\\]/;

export const checkPathProject = async () => {
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
      const metadata = await sharp(filePath).metadata();

      return {
        name: filePath.split(/[\\/]/).pop()!,
        path: filePath,
        metadata: {
          width: metadata.width!,
          height: metadata.height!,
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
    await sharp(buffer).resize(400, null).jpeg({ quality: 80 }).toFile(join(pathProject, 'avatar.jpg'));
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

  // Read locations.json (can be DataVirtualTourType or old structure PanoramaLocationType[])
  const locationsData = existsSync(join(pathProject, 'locations.json')) ? JSON.parse(readFileSync(join(pathProject, 'locations.json'), 'utf-8')) : null;

  // Handle both new structure (DataVirtualTourType) and old structure (PanoramaLocationType[])
  let locations: PanoramaLocationType[] | DataVirtualTourType | undefined;
  if (locationsData) {
    // Check if it's new structure (has panoramaLocations property) or old structure (array)
    if (Array.isArray(locationsData)) {
      // Old structure: array of PanoramaLocationType
      locations = locationsData as PanoramaLocationType[];
    } else if (locationsData.panoramaLocations) {
      // New structure: DataVirtualTourType
      locations = locationsData as DataVirtualTourType;
    } else {
      // Fallback: treat as old structure
      locations = [];
    }
  } else {
    locations = undefined;
  }

  const panoramas: any[] = []; // Empty for compatibility
  const panoramasImport: any[] = []; // Empty for compatibility

  const imagesQuality = existsSync(join(pathProject, 'panoramas')) ? readdirSync(join(pathProject, 'panoramas')) : [];
  const imagesLow = existsSync(join(pathProject, 'panoramas-low')) ? readdirSync(join(pathProject, 'panoramas-low')) : [];
  const listCube = existsSync(join(pathProject, 'cube')) ? readdirSync(join(pathProject, 'cube')) : [];
  const hasCube = listCube.length > 0 && listCube.length === imagesQuality.length && listCube.length === imagesLow.length;

  return {
    name,
    avatar,
    description,
    locations,
    panoramas,
    panoramasImport,
    imagesQuality,
    imagesLow,
    hasCube,
    pathFolder: `file://${pathProject}`,
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

export const renderProject = async (name: string, sizes: { pc: number; tablet: number; mobile: number }, renderData: RenderProject) => {
  try {
    cancelProgress();

    const { panoramas, locations } = renderData;
    // Prioritize panoramas with calculated metadata from renderer
    // Handle both PanoramaLocationType[] and DataVirtualTourType
    let panoramaLocations: any[] = [];
    if (locations) {
      if (Array.isArray(locations)) {
        panoramaLocations = locations;
      } else if ('panoramaLocations' in locations) {
        panoramaLocations = (locations as any).panoramaLocations || [];
      }
    }

    const allPanoramas =
      panoramas && panoramas.length > 0
        ? panoramas
        : panoramaLocations.length > 0
          ? panoramaLocations.flatMap((location: any) => location.options.map((option: any) => option.panorama))
          : [];
    const totalProcess = allPanoramas.length + 1;
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

    // Get metadata from locations to use faceSize for each device
    // If metadata exists in locations, use it; otherwise fallback to sizes parameter
    let deviceFaceSizes: { pc: number; tablet: number; mobile: number } = {
      pc: sizes.pc,
      tablet: sizes.tablet,
      mobile: sizes.mobile,
    };

    if (panoramaLocations && panoramaLocations.length > 0) {
      const firstLocation = panoramaLocations[0];
      if (firstLocation.metadata) {
        // Use faceSize from metadata if available, otherwise use sizes parameter
        deviceFaceSizes = {
          pc: firstLocation.metadata.pc?.faceSize || sizes.pc,
          tablet: firstLocation.metadata.tablet?.faceSize || sizes.tablet,
          mobile: firstLocation.metadata.mobile?.faceSize || sizes.mobile,
        };
      }
    }

    // Render cube map for all devices
    const devices: Array<{ name: 'pc' | 'tablet' | 'mobile'; size: number }> = [
      { name: 'pc', size: deviceFaceSizes.pc },
      { name: 'tablet', size: deviceFaceSizes.tablet },
      { name: 'mobile', size: deviceFaceSizes.mobile },
    ];

    for (const device of devices) {
      const inputQualityPath = join(path, name, device.name, 'panoramas');
      const inputLowPath = join(path, name, device.name, 'panoramas-low');
      const outputPath = join(path, name, device.name, 'cube');

      await new Promise((resolve, reject) => {
        const child = spawn(toolPath, ['--input-quality', inputQualityPath, '--input-low', inputLowPath, '--output', outputPath, '--size', `${device.size}`, '--quality', '80']);

        CHILD = child;

        child.stderr.on('data', (data) => {
          const regex = /✔ PROCESSED SUCCESSFULLY PANORAMA LOW TO CUBE MAP:\s*(.*?)\n/;

          const match = data.toString().match(regex);

          if (match) {
            if (match[1]) {
              pushTaskProgress(tasks, totalProcess);
            }
          }
        });

        child.on('error', (err) => {
          console.log(`error: ${err.message}`);
          CHILD = undefined;
          reject(err);
        });

        child.on('close', (code) => {
          console.log(`child process exited with code ${code} for device ${device.name}`);

          if (code === 0) {
            return resolve(true);
          }

          if (child.killed) {
            child.kill();
          }
        });
      });
    }

    if (tasks.length < totalProcess) {
      for (let i = tasks.length; i < totalProcess; i++) {
        pushTaskProgress(tasks, totalProcess);
      }
    }

    return true;
  } catch (error) {
    console.log('renderProject', error);
    return false;
  }
};

export const cancelProgress = () => {
  if (CHILD && !CHILD.killed) {
    CHILD.kill();
    CHILD = undefined;
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

  if (!isRender) {
    const workerSaveProject = new Worker(`${__dirname}/worker.js`, {});
    workerSaveProject.postMessage({ path, name, project });
    return;
  }

  const pathProject = join(path, name);

  // Create device folders structure: pc/, tablet/, mobile/
  const devices = ['pc', 'tablet', 'mobile'];

  devices.forEach((device) => {
    const devicePath = join(pathProject, device);
    if (!existsSync(devicePath)) {
      mkdirSync(devicePath, { recursive: true });
    }

    // Create subfolders for each device
    const subfolders = ['panoramas', 'panoramas-low', 'thumbnails', 'minimap', 'cube'];
    subfolders.forEach((subfolder) => {
      const subfolderPath = join(devicePath, subfolder);
      if (!existsSync(subfolderPath)) {
        mkdirSync(subfolderPath, { recursive: true });
      }
    });
  });

  // Keep old structure for backward compatibility (when not rendering)
  if (!isRender) {
    if (!existsSync(join(pathProject, 'panoramas'))) {
      mkdirSync(join(pathProject, 'panoramas'), { recursive: true });
    }
    if (!existsSync(join(pathProject, 'panoramas-low'))) {
      mkdirSync(join(pathProject, 'panoramas-low'), { recursive: true });
    }
    // Note: thumbnails are now saved to device folders (pc/thumbnails, tablet/thumbnails, mobile/thumbnails)
    // No need to create root thumbnails folder
    if (!existsSync(join(pathProject, 'minimap'))) {
      mkdirSync(join(pathProject, 'minimap'), { recursive: true });
    }
  }

  const listMinimap: {
    path: string;
    name: string;
  }[] = [];

  // Get panoramaLocations from DataVirtualTourType or use locations directly if it's an array (old structure)
  let panoramaLocations: PanoramaLocationType[] = [];
  let dataVirtualTour: DataVirtualTourType | null = null;

  if (project.locations) {
    if (Array.isArray(project.locations)) {
      // Old structure: array of PanoramaLocationType
      panoramaLocations = project.locations;
    } else if ('panoramaLocations' in project.locations) {
      // New structure: DataVirtualTourType
      dataVirtualTour = project.locations as DataVirtualTourType;
      panoramaLocations = dataVirtualTour.panoramaLocations;
    }
  }

  // Prioritize panoramas with calculated metadata from renderer
  const allPanoramas =
    project.panoramas && project.panoramas.length > 0
      ? project.panoramas
      : panoramaLocations && panoramaLocations.length > 0
        ? panoramaLocations.flatMap((location) => location.options.map((option) => option.panorama))
        : [];

  // Process minimaps from panoramaLocations
  if (panoramaLocations && panoramaLocations.length > 0) {
    panoramaLocations.forEach((location: PanoramaLocationType) => {
      if (location.minimap && location.minimap.src) {
        const isExist = listMinimap.find((m) => m.path === location.minimap?.src);
        if (!isExist && regexPath.test(location.minimap.src)) {
          const name = location.minimap.src.split(/[\\/]/).pop()!.split('.')[0];
          listMinimap.push({
            path: location.minimap.src,
            name: `${name}.jpg`,
          });
          location.minimap.src = `${name}.jpg`;
        }
      }
    });
  }

  // Process images for all panoramas
  await Promise.all(
    allPanoramas.map(async (panorama) => {
      // Always process image path to ensure only filename is saved
      console.log('Processing panorama:', panorama.name, 'image:', panorama.image);

      if (regexPath.test(panorama.image)) {
        console.log('Image has path, converting to filename');
        // If it's a file path, copy the file and use filename
        if (panorama.isNew) {
          console.log('Panorama is new, copying file');
          // When rendering, use device folder structure; otherwise use root panoramas folder
          const pathImage = isRender ? join(path, name, 'pc', 'panoramas', `${panorama.name}.jpg`) : join(pathProject, 'panoramas', `${panorama.name}.jpg`);
          // Ensure destination directory exists
          const destDir = isRender ? join(path, name, 'pc', 'panoramas') : join(pathProject, 'panoramas');
          if (!existsSync(destDir)) {
            mkdirSync(destDir, { recursive: true });
          }
          copyFileSync(panorama.image.substring(7), pathImage);

          if (isRender) {
            // Read original image
            const buffer = readFileSync(panorama.image.substring(7));
            const originalImage = sharp(buffer);
            const metadata = await originalImage.metadata();
            const originalWidth = metadata.width!;
            const originalHeight = metadata.height!;

            // Calculate sizes for different devices
            // Tablet: 4096x2048 (resize to target, maintain aspect ratio)
            const tabletTargetWidth = 4096;
            const tabletTargetHeight = 2048;
            // Calculate scale to fit target while maintaining aspect ratio
            const tabletScale = Math.max(tabletTargetWidth / originalWidth, tabletTargetHeight / originalHeight);
            const finalTabletWidth = Math.round(originalWidth * tabletScale);
            const finalTabletHeight = Math.round(originalHeight * tabletScale);

            // Mobile: 2048x1024 (resize to target, maintain aspect ratio)
            const mobileTargetWidth = 2048;
            const mobileTargetHeight = 1024;
            // Calculate scale to fit target while maintaining aspect ratio
            const mobileScale = Math.max(mobileTargetWidth / originalWidth, mobileTargetHeight / originalHeight);
            const finalMobileWidth = Math.round(originalWidth * mobileScale);
            const finalMobileHeight = Math.round(originalHeight * mobileScale);

            // PC: Original size (copy to pc folder)
            await originalImage.clone().toFile(join(path, name, 'pc', 'panoramas', `${panorama.name}.jpg`));
            await originalImage
              .clone()
              .resize(2000, null)
              .jpeg({ quality: 60 })
              .toFile(join(path, name, 'pc', 'panoramas-low', `${panorama.name}-low.jpg`));

            // Tablet: Resized version
            await originalImage
              .clone()
              .resize(finalTabletWidth, finalTabletHeight)
              .toFile(join(path, name, 'tablet', 'panoramas', `${panorama.name}.jpg`));
            await originalImage
              .clone()
              .resize(finalTabletWidth, finalTabletHeight)
              .resize(2000, null)
              .jpeg({ quality: 60 })
              .toFile(join(path, name, 'tablet', 'panoramas-low', `${panorama.name}-low.jpg`));

            // Mobile: Resized version
            await originalImage
              .clone()
              .resize(finalMobileWidth, finalMobileHeight)
              .toFile(join(path, name, 'mobile', 'panoramas', `${panorama.name}.jpg`));
            await originalImage
              .clone()
              .resize(finalMobileWidth, finalMobileHeight)
              .resize(2000, null)
              .jpeg({ quality: 60 })
              .toFile(join(path, name, 'mobile', 'panoramas-low', `${panorama.name}-low.jpg`));
          }
        }
        // Always use filename instead of full path
        panorama.image = `${panorama.name}.jpg`;
        console.log('Converted image to:', panorama.image);
      } else {
        console.log('Image already filename, keeping as is');

        // If rendering and image already exists, create versions for all devices
        if (isRender) {
          // Try to find existing image in old structure first, then in pc folder
          let existingImagePath = join(pathProject, 'panoramas', panorama.image);
          if (!existsSync(existingImagePath)) {
            existingImagePath = join(pathProject, 'pc', 'panoramas', panorama.image);
          }

          if (existsSync(existingImagePath)) {
            try {
              const buffer = readFileSync(existingImagePath);
              const originalImage = sharp(buffer);
              const metadata = await originalImage.metadata();
              const originalWidth = metadata.width!;
              const originalHeight = metadata.height!;

              // Calculate sizes for different devices
              // Tablet: ~1024px width (maintain aspect ratio)
              const tabletWidth = 1024;
              const tabletHeight = Math.round((tabletWidth / originalWidth) * originalHeight);

              // Mobile: ~768px width (maintain aspect ratio)
              const mobileWidth = 768;
              const mobileHeight = Math.round((mobileWidth / originalWidth) * originalHeight);

              // PC: Original size (copy to pc folder)
              await originalImage.clone().toFile(join(path, name, 'pc', 'panoramas', `${panorama.name}.jpg`));
              await originalImage
                .clone()
                .resize(2000, null)
                .jpeg({ quality: 60 })
                .toFile(join(path, name, 'pc', 'panoramas-low', `${panorama.name}-low.jpg`));

              // Tablet: Resized version
              await originalImage
                .clone()
                .resize(tabletWidth, tabletHeight)
                .toFile(join(path, name, 'tablet', 'panoramas', `${panorama.name}.jpg`));
              await originalImage
                .clone()
                .resize(tabletWidth, tabletHeight)
                .resize(2000, null)
                .jpeg({ quality: 60 })
                .toFile(join(path, name, 'tablet', 'panoramas-low', `${panorama.name}-low.jpg`));

              // Mobile: Resized version
              await originalImage
                .clone()
                .resize(mobileWidth, mobileHeight)
                .toFile(join(path, name, 'mobile', 'panoramas', `${panorama.name}.jpg`));
              await originalImage
                .clone()
                .resize(mobileWidth, mobileHeight)
                .resize(2000, null)
                .jpeg({ quality: 60 })
                .toFile(join(path, name, 'mobile', 'panoramas-low', `${panorama.name}-low.jpg`));
            } catch (error) {
              console.error(`Error processing existing image ${panorama.name}:`, error);
            }
          }
        }
      }

      // Note: minimap is now at location level, not panorama level
      // This check is for backward compatibility with old structure
      const panoramaAny = panorama as any;
      if (panoramaAny.minimap && panoramaAny.minimap.src) {
        const isExist = listMinimap.find((m) => m.path === panoramaAny.minimap?.src);
        if (!isExist && regexPath.test(panoramaAny.minimap.src)) {
          const name = panoramaAny.minimap.src.split(/[\\/]/).pop()!.split('.')[0];
          listMinimap.push({
            path: panoramaAny.minimap.src,
            name: `${name}.jpg`,
          });

          panoramaAny.minimap.src = `${name}.jpg`;
        }
      }

      if (isBase64Image(panorama.thumbnail)) {
        const base64Data = panorama.thumbnail.replace(/^data:image\/\w+;base64,/, '');
        const bufferThumbnail = Buffer.from(base64Data, 'base64');

        const thumbnailImage = sharp(bufferThumbnail);

        // Always save thumbnails to device folders (pc, tablet, mobile)
        await thumbnailImage
          .clone()
          .resize(300, null)
          .jpeg({ quality: 80 })
          .toFile(join(path, name, 'pc', 'thumbnails', `${panorama.name}.jpg`));

        await thumbnailImage
          .clone()
          .resize(300, null)
          .jpeg({ quality: 80 })
          .toFile(join(path, name, 'tablet', 'thumbnails', `${panorama.name}.jpg`));

        await thumbnailImage
          .clone()
          .resize(300, null)
          .jpeg({ quality: 80 })
          .toFile(join(path, name, 'mobile', 'thumbnails', `${panorama.name}.jpg`));

        panorama.thumbnail = `${panorama.name}.jpg`;
      }

      delete panorama.isNew;
    }),
  );

  await Promise.all(
    listMinimap.map(async (minimap) => {
      const bufferMiniMap = readFileSync(minimap.path.substring(7));
      const minimapImage = sharp(bufferMiniMap);

      if (isRender) {
        // Create minimaps for all devices
        await minimapImage
          .clone()
          .resize(400, null)
          .toFile(join(path, name, 'pc', 'minimap', minimap.name));

        await minimapImage
          .clone()
          .resize(400, null)
          .toFile(join(path, name, 'tablet', 'minimap', minimap.name));

        await minimapImage
          .clone()
          .resize(400, null)
          .toFile(join(path, name, 'mobile', 'minimap', minimap.name));
      } else {
        // Keep old structure for backward compatibility
        const pathMiniMap = join(pathProject, 'minimap', minimap.name);
        await minimapImage.resize(400, null).toFile(pathMiniMap);
      }
    }),
  );

  // Collect unique minimaps from locations for DataVirtualTourType
  const uniqueMinimaps = new Map<string, { id: string; src: string }>();
  if (panoramaLocations && panoramaLocations.length > 0) {
    panoramaLocations.forEach((location) => {
      if (location.minimap && location.minimap.src) {
        const minimapId = location.minimap.minimapId || location.minimap.src.split('.')[0];
        const minimapSrc = location.minimap.src;
        if (!uniqueMinimaps.has(minimapSrc)) {
          uniqueMinimaps.set(minimapSrc, { id: minimapId, src: minimapSrc });
        }
      }
    });
  }

  // Create or update DataVirtualTourType structure
  const dataVirtualTourToSave: DataVirtualTourType = dataVirtualTour
    ? {
        name: dataVirtualTour.name,
        miniMaps: Array.from(uniqueMinimaps.values()),
        panoramaLocations: panoramaLocations,
      }
    : {
        name: name, // Use project name if not provided
        miniMaps: Array.from(uniqueMinimaps.values()),
        panoramaLocations: panoramaLocations,
      };

  // Save locations as DataVirtualTourType (new structure)
  writeFileSync(join(pathProject, 'locations.json'), JSON.stringify(dataVirtualTourToSave, null, 2));

  // When rendering, remove old folder structure and keep only pc/, tablet/, mobile/
  if (isRender) {
    const oldFoldersToRemove = ['panoramas', 'panoramas-low', 'thumbnails', 'minimap', 'cube'];
    oldFoldersToRemove.forEach((folder) => {
      const folderPath = join(pathProject, folder);
      if (existsSync(folderPath)) {
        try {
          rmSync(folderPath, { recursive: true, force: true });
          console.log(`Removed old folder: ${folder}`);
        } catch (error) {
          console.error(`Error removing folder ${folder}:`, error);
        }
      }
    });

    // Also remove panoramas.json if exists (use locations.json instead)
    const panoramasJsonPath = join(pathProject, 'panoramas.json');
    if (existsSync(panoramasJsonPath)) {
      try {
        rmSync(panoramasJsonPath);
        console.log('Removed old panoramas.json');
      } catch (error) {
        console.error('Error removing panoramas.json:', error);
      }
    }

    return true;
  }

  // remove panorama (only when not rendering - for backward compatibility)
  const panoramasPath = join(path, name, 'panoramas');
  if (!existsSync(panoramasPath)) {
    return true;
  }
  const currentPanoramas = readdirSync(panoramasPath);
  console.log('currentPanoramas', currentPanoramas);

  currentPanoramas.forEach((cp) => {
    const fileNames = cp.split('.jpg')[0];
    const isExist = allPanoramas.find((p) => p.name === fileNames);

    if (!isExist) {
      rmSync(join(path, name, 'panoramas', cp));
      console.log('remove panorama', fileNames, isRender);

      if (existsSync(join(path, name, 'panoramas-low', `${fileNames}-low.jpg`))) {
        rmSync(join(path, name, 'panoramas-low', `${fileNames}-low.jpg`));
      }

      console.log('remove cube', fileNames, existsSync(join(path, name, 'cube', fileNames)));

      if (existsSync(join(path, name, 'cube', fileNames))) {
        rmSync(join(path, name, 'cube', fileNames), { recursive: true });
      }
    }
  });

  // Clean up thumbnails from device folders (pc, tablet, mobile)
  const deviceFolders = ['pc', 'tablet', 'mobile'];
  deviceFolders.forEach((device) => {
    const thumbnailsPath = join(path, name, device, 'thumbnails');
    if (existsSync(thumbnailsPath)) {
      const currentThumbnails = readdirSync(thumbnailsPath);
      currentThumbnails.forEach((ct) => {
        const isExist = allPanoramas.find((p) => p.thumbnail === ct);
        if (!isExist) {
          rmSync(join(thumbnailsPath, ct));
        }
      });
    }
  });

  // Check minimap directory - try root minimap first (old structure), then device folders (new structure)
  const minimapPath = join(path, name, 'minimap');
  if (existsSync(minimapPath)) {
    const currentMinimap = readdirSync(minimapPath);

    currentMinimap.forEach((cm) => {
      // Check minimap from panoramaLocations (new structure)
      let isExist = false;
      if (panoramaLocations && panoramaLocations.length > 0) {
        isExist = panoramaLocations.some((location: PanoramaLocationType) => {
          return location.minimap && location.minimap.src && location.minimap.src === cm;
        });
      }
      // Fallback: check from panoramas (old structure for backward compatibility)
      if (!isExist) {
        isExist = allPanoramas.some((p) => {
          const panoramaAny = p as any;
          return panoramaAny.minimap && panoramaAny.minimap.src && panoramaAny.minimap.src === cm;
        });
      }

      if (!isExist) {
        rmSync(join(minimapPath, cm));
      }
    });
  }

  return true;
};
