import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { parentPort } from 'worker_threads';
import { RenderProject } from './type';
import Jimp from 'jimp';

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

  const newPanoramas = await Promise.all(
    project.panoramas.map(async (panorama) => {
      let image = panorama.image;

      if (panorama.isNew) {
        const pathImage = join(pathProject, 'panoramas', `${panorama.title}.jpg`);

        let imagePanorama = panorama.image;

        if (regexPath.test(imagePanorama)) {
          copyFileSync(panorama.image.substring(7), pathImage);

          if (isRender) {
            // create file low quality
            const buffer = readFileSync(panorama.image.substring(7));

            await (
              await Jimp.read(buffer)
            )
              .resize(2000, Jimp.AUTO)
              .quality(60)
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

      if (panorama.minimap && panorama.minimap.src) {
        const isExist = listMinimap.find((m) => m.path === panorama.minimap?.src);
        if (!isExist && regexPath.test(panorama.minimap.src)) {
          const name = panorama.minimap.src.split(/[\\/]/).pop()!.split('.')[0];
          listMinimap.push({
            path: panorama.minimap.src,
            name: `${name}.jpg`,
          });

          panorama.minimap.src = `${name}.jpg`;
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
          .writeAsync(join(pathProject, 'thumbnails', `${panorama.title}.jpg`));
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

  writeFileSync(join(pathProject, 'panoramas.json'), JSON.stringify(newPanoramas, null, 2));

  // remove panorama
  const currentPanoramas = readdirSync(join(path, name, 'panoramas'));

  currentPanoramas.forEach((cp) => {
    const fileNames = cp.split('.jpg')[0];
    const isExist = project.panoramas.find((p) => p.title === fileNames);

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
    const isExist = project.panoramas.find((p) => p.thumbnail === ct);

    if (!isExist) {
      rmSync(join(path, name, 'thumbnails', ct));
    }
  });

  const currentMinimap = readdirSync(join(path, name, 'minimap'));

  currentMinimap.forEach((cm) => {
    const isExist = project.panoramas.find((p) => {
      return p.minimap && p.minimap.src && p.minimap.src === cm;
    });

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
