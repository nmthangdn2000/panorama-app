import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { parentPort } from 'worker_threads';
import { RenderProject } from './type';
import sharp from 'sharp';
import { PanoramaLocationType, DataVirtualTourType } from '../../renderer/pages/project-panorama/detail/lib-panorama/panorama.type';

parentPort!.on('message', ({ path, name, project }: { path: string; name: string; project: RenderProject }) => {
  return saveProject(path, name, project);
});

const regexPath = /[\/\\]/;

const saveProject = async (path: string, name: string, project: RenderProject, isRender?: boolean) => {
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

  // Note: We now use device folders (pc/, tablet/, mobile/) instead of root folders
  // Old structure folders are no longer created

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

  // Get all panoramas from panoramaLocations if available, otherwise use panoramas
  const allPanoramas =
    panoramaLocations && panoramaLocations.length > 0 ? panoramaLocations.flatMap((location) => location.options.map((option) => option.panorama)) : project.panoramas || [];

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

  const newPanoramas = await Promise.all(
    allPanoramas.map(async (panorama) => {
      // Always process image path to ensure only filename is saved
      console.log('Processing panorama:', panorama.name, 'image:', panorama.image);
      let image = panorama.image;

      if (regexPath.test(panorama.image)) {
        console.log('Image has path, converting to filename');
        // If it's a file path, copy the file and use filename
        if (panorama.isNew) {
          console.log('Panorama is new, copying file');
          // Copy to pc/panoramas instead of root panoramas
          const pathImage = join(path, name, 'pc', 'panoramas', `${panorama.name}.jpg`);

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
        image = `${panorama.name}.jpg`;
        console.log('Converted image to:', image);
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

      return {
        ...panorama,
        image,
      };
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

  // Save locations as DataVirtualTourType (new structure)
  if (panoramaLocations && panoramaLocations.length > 0) {
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
    writeFileSync(join(pathProject, 'locations.json'), JSON.stringify(dataVirtualTourToSave, null, 2));
  } else {
    // Fallback: save panoramas.json for backward compatibility
    writeFileSync(join(pathProject, 'panoramas.json'), JSON.stringify(newPanoramas, null, 2));
  }

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
  // Check from pc/panoramas instead of root panoramas
  const panoramasPath = join(path, name, 'pc', 'panoramas');
  if (!existsSync(panoramasPath)) {
    return true;
  }
  const currentPanoramas = readdirSync(panoramasPath);

  currentPanoramas.forEach((cp) => {
    const fileNames = cp.split('.jpg')[0];
    const isExist = allPanoramas.find((p) => p.name === fileNames);

    if (!isExist) {
      // Remove from all device folders
      const devices = ['pc', 'tablet', 'mobile'];
      devices.forEach((device) => {
        const devicePanoramasPath = join(path, name, device, 'panoramas', cp);
        if (existsSync(devicePanoramasPath)) {
          rmSync(devicePanoramasPath);
        }
        const devicePanoramasLowPath = join(path, name, device, 'panoramas-low', `${fileNames}-low.jpg`);
        if (existsSync(devicePanoramasLowPath)) {
          rmSync(devicePanoramasLowPath);
        }
      });

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

const isBase64Image = (str: string) => {
  if (typeof str !== 'string') {
    return false;
  }
  // Base64 image regular expression
  const base64ImagePattern = /^data:image\/(png|jpeg|jpg|gif);base64,[A-Za-z0-9+/]+={0,2}$/;
  return base64ImagePattern.test(str);
};
