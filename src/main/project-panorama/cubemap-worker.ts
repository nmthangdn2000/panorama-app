import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { parentPort, workerData } from 'worker_threads';
import sharp from 'sharp';

type Face = 'back' | 'front' | 'left' | 'right' | 'top' | 'bottom';
const FACES: Face[] = ['back', 'front', 'left', 'right', 'top', 'bottom'];

const clamp = (x: number, min: number, max: number) => Math.min(max, Math.max(x, min));
const mod = (x: number, n: number) => ((x % n) + n) % n;

type Vec3 = { x: number; y: number; z: number };

// Same orientations as cubemap-generator/src/utils.ts
const orientations: Record<Face, (out: Vec3, x: number, y: number) => void> = {
  back:   (out, x, y) => { out.x = -1; out.y = -x; out.z = -y; },
  front:  (out, x, y) => { out.x =  1; out.y =  x; out.z = -y; },
  left:   (out, x, y) => { out.x =  x; out.y = -1; out.z = -y; },
  right:  (out, x, y) => { out.x = -x; out.y =  1; out.z = -y; },
  top:    (out, x, y) => { out.x = -y; out.y = -x; out.z =  1; },
  bottom: (out, x, y) => { out.x =  y; out.y = -x; out.z = -1; },
};

const sampleBilinear = (
  srcData: Buffer,
  srcWidth: number,
  srcHeight: number,
  xFrom: number,
  yFrom: number,
  dest: Buffer,
  to: number
) => {
  const xl = clamp(Math.floor(xFrom), 0, srcWidth - 1);
  const xr = clamp(Math.ceil(xFrom), 0, srcWidth - 1);
  const xf = xFrom - Math.floor(xFrom);
  const yl = clamp(Math.floor(yFrom), 0, srcHeight - 1);
  const yr = clamp(Math.ceil(yFrom), 0, srcHeight - 1);
  const yf = yFrom - Math.floor(yFrom);

  const p00 = 4 * (yl * srcWidth + xl);
  const p10 = 4 * (yl * srcWidth + xr);
  const p01 = 4 * (yr * srcWidth + xl);
  const p11 = 4 * (yr * srcWidth + xr);

  for (let c = 0; c < 3; c++) {
    dest[to + c] = Math.round(
      srcData[p00 + c] * (1 - xf) * (1 - yf) +
      srcData[p10 + c] * xf * (1 - yf) +
      srcData[p01 + c] * (1 - xf) * yf +
      srcData[p11 + c] * xf * yf
    );
  }
};

const renderFaceToBuffer = (srcData: Buffer, srcWidth: number, srcHeight: number, face: Face): Buffer => {
  const rotation = Math.PI; // 180 degrees, same default as cubemap-generator
  const faceSize = Math.floor(srcWidth / 4);
  const dest = Buffer.alloc(faceSize * faceSize * 4);
  const orientation = orientations[face];
  const cube: Vec3 = { x: 0, y: 0, z: 0 };

  for (let x = 0; x < faceSize; x++) {
    for (let y = 0; y < faceSize; y++) {
      const to = 4 * (y * faceSize + x);
      dest[to + 3] = 255;
      orientation(cube, (2 * (x + 0.5)) / faceSize - 1, (2 * (y + 0.5)) / faceSize - 1);
      const r = Math.sqrt(cube.x * cube.x + cube.y * cube.y + cube.z * cube.z);
      const lon = mod(Math.atan2(cube.y, cube.x) + rotation, 2 * Math.PI);
      const lat = Math.acos(cube.z / r);
      sampleBilinear(
        srcData, srcWidth, srcHeight,
        (srcWidth * lon) / Math.PI / 2 - 0.5,
        (srcHeight * lat) / Math.PI - 0.5,
        dest, to
      );
    }
  }
  return dest;
};

export type CubemapWorkerData = {
  qualityFile: string;
  lowFile: string;
  folderName: string;
  outputPath: string;
  tileSize: number;
  quality: number;
  generateTiles: boolean;
};

const processFile = async (data: CubemapWorkerData) => {
  const { qualityFile, lowFile, folderName, outputPath, tileSize, quality, generateTiles } = data;

  const cubeDir = join(outputPath, folderName, 'cube');
  const tileDir = join(outputPath, folderName, 'tile');
  const tileLowDir = join(outputPath, folderName, 'tile_low');

  if (!existsSync(cubeDir)) mkdirSync(cubeDir, { recursive: true });
  if (generateTiles && !existsSync(tileDir)) mkdirSync(tileDir, { recursive: true });
  if (!existsSync(tileLowDir)) mkdirSync(tileLowDir, { recursive: true });

  // Process high quality image → cube faces + tiles
  const { data: srcData, info } = await sharp(qualityFile).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  for (const face of FACES) {
    const faceSize = Math.floor(info.width / 4);
    const rawBuffer = renderFaceToBuffer(srcData, info.width, info.height, face);

    const faceJpeg = await sharp(rawBuffer, { raw: { width: faceSize, height: faceSize, channels: 4 } })
      .jpeg({ quality })
      .toBuffer();

    writeFileSync(join(cubeDir, `${face}.jpg`), faceJpeg);

    if (generateTiles) {
      const cols = Math.ceil(faceSize / tileSize);
      const rows = Math.ceil(faceSize / tileSize);
      for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
          const x = col * tileSize;
          const y = row * tileSize;
          const w = Math.min(tileSize, faceSize - x);
          const h = Math.min(tileSize, faceSize - y);
          await sharp(faceJpeg)
            .extract({ left: x, top: y, width: w, height: h })
            .jpeg({ quality })
            .toFile(join(tileDir, `${face}_${col}_${row}.jpg`));
        }
      }
    }
  }

  // Process low quality image → cube faces only (no tiling)
  const { data: lowData, info: lowInfo } = await sharp(lowFile).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  for (const face of FACES) {
    const faceSize = Math.floor(lowInfo.width / 4);
    const rawBuffer = renderFaceToBuffer(lowData, lowInfo.width, lowInfo.height, face);

    const faceJpeg = await sharp(rawBuffer, { raw: { width: faceSize, height: faceSize, channels: 4 } })
      .jpeg({ quality: 85 })
      .toBuffer();

    writeFileSync(join(tileLowDir, `${face}.jpg`), faceJpeg);
  }
};

const data = workerData as CubemapWorkerData;
processFile(data)
  .then(() => parentPort?.postMessage({ success: true }))
  .catch((err) => parentPort?.postMessage({ success: false, error: String(err) }));
