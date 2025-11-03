import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { parentPort } from 'worker_threads';
import { RenderProject } from './type';
import Jimp from 'jimp';
import { PanoramaLocationType, DataVirtualTourType } from '../../renderer/pages/project-panorama/detail/lib-panorama/panorama.type';

parentPort!.on('message', ({ path, name, project }: { path: string; name: string; project: RenderProject }) => {
  return saveProject(path, name, project);
});

const regexPath = /[\/\\]/;

const saveProject = async (path: string, name: string, project: RenderProject, isRender?: boolean) => {
  const pathProject = join(path, name);

  if (!existsSync(join(pathProject, 'panoramas'))) {
    mkdirSync(join(pathProject, 'panoramas'), { recursive: true });
  }

  if (!existsSync(join(pathProject, 'panoramas-low'))) {
    mkdirSync(join(pathProject, 'panoramas-low'), { recursive: true });
  }

  if (!existsSync(join(pathProject, 'thumbnails'))) {
    mkdirSync(join(pathProject, 'thumbnails'), { recursive: true });
  }

  if (!existsSync(join(pathProject, 'minimap'))) {
    mkdirSync(join(pathProject, 'minimap'), { recursive: true });
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

  // Get all panoramas from panoramaLocations if available, otherwise use panoramas
  const allPanoramas =
    panoramaLocations && panoramaLocations.length > 0
      ? panoramaLocations.flatMap((location) => location.options.map((option) => option.panorama))
      : project.panoramas || [];

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
          const pathImage = join(pathProject, 'panoramas', `${panorama.name}.jpg`);

          copyFileSync(panorama.image.substring(7), pathImage);

          if (isRender) {
            // create file low quality
            const buffer = readFileSync(panorama.image.substring(7));

            await (
              await Jimp.read(buffer)
            )
              .resize(2000, Jimp.AUTO)
              .quality(60)
              .writeAsync(join(path, name, 'panoramas-low', `${panorama.name}-low.jpg`));
          }
        }
        // Always use filename instead of full path
        image = `${panorama.name}.jpg`;
        console.log('Converted image to:', image);
      } else {
        console.log('Image already filename, keeping as is');
      }

      // Note: minimap is now at location level, not panorama level
      // This check is for backward compatibility with old structure
      if (panorama.minimap && (panorama.minimap as any).src) {
        const isExist = listMinimap.find((m) => m.path === (panorama.minimap as any)?.src);
        if (!isExist && regexPath.test((panorama.minimap as any).src)) {
          const name = (panorama.minimap as any).src.split(/[\\/]/).pop()!.split('.')[0];
          listMinimap.push({
            path: (panorama.minimap as any).src,
            name: `${name}.jpg`,
          });

          (panorama.minimap as any).src = `${name}.jpg`;
        }
      }

      if (isBase64Image(panorama.thumbnail)) {
        const base64Data = panorama.thumbnail.replace(/^data:image\/\w+;base64,/, '');
        const bufferThumbnail = Buffer.from(base64Data, 'base64');

        await (
          await Jimp.read(bufferThumbnail)
        )
          .resize(300, Jimp.AUTO)
          .quality(80)
          .writeAsync(join(pathProject, 'thumbnails', `${panorama.name}.jpg`));

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
      const pathMiniMap = join(pathProject, 'minimap', minimap.name);
      const bufferMiniMap = readFileSync(minimap.path.substring(7));

      await (await Jimp.read(bufferMiniMap)).resize(400, Jimp.AUTO).writeAsync(pathMiniMap);
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

  // remove panorama
  const currentPanoramas = readdirSync(join(path, name, 'panoramas'));

  currentPanoramas.forEach((cp) => {
    const fileNames = cp.split('.jpg')[0];
    const isExist = allPanoramas.find((p) => p.name === fileNames);

    if (!isExist) {
      rmSync(join(path, name, 'panoramas', cp));
      if (existsSync(join(path, name, 'panoramas-low', `${fileNames}-low.jpg`))) {
        rmSync(join(path, name, 'panoramas-low', `${fileNames}-low.jpg`));
      }

      if (existsSync(join(path, name, 'cube', fileNames))) {
        rmSync(join(path, name, 'cube', fileNames), { recursive: true });
      }
    }
  });

  const currentThumbnails = readdirSync(join(path, name, 'thumbnails'));

  currentThumbnails.forEach((ct) => {
    const isExist = allPanoramas.find((p) => p.thumbnail === ct);

    if (!isExist) {
      rmSync(join(path, name, 'thumbnails', ct));
    }
  });

  const currentMinimap = readdirSync(join(path, name, 'minimap'));

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
        return p.minimap && (p.minimap as any).src && (p.minimap as any).src === cm;
      });
    }

    if (!isExist) {
      rmSync(join(path, name, 'minimap', cm));
    }
  });

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
