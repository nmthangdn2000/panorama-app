import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { FileType } from './panorama.d';
import sharp from 'sharp';

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
