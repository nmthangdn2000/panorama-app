import { createCanvas, loadImage } from 'canvas';
import { renderFace } from './convert';
import { interpolations, InterpolationsType, mimeType, MimeTypesType, orientations, OrientationsType } from './utils';
import * as fs from 'fs';

const canvas = createCanvas(1, 1); // default size

const ctx = canvas.getContext('2d');

export type OptionsType = {
  rotation: number;
  outformat: MimeTypesType;
  outtype: string;
  width: number;
  data?: ImageData;
  face?: OrientationsType;
  interpolation: InterpolationsType;
  maxWidth?: number;
};

const getDataURL = (imgData: ImageData, extension: keyof typeof mimeType) => {
  canvas.width = imgData.width;
  canvas.height = imgData.height;
  ctx.putImageData(imgData, 0, 0);
  return new Promise((resolve) => resolve(canvas.toBuffer(mimeType[extension] as any, { quality: 0.92 })));
};

const convertImage = (src: string | Buffer, usrOptions: OptionsType): Promise<(string | { buffer: Buffer; filename: string })[]> => {
  const options = {
    rotation: 180,
    interpolation: 'lanczos',
    outformat: 'jpg',
    outtype: 'file',
    width: Infinity,
    ...usrOptions,
  };
  return new Promise((resolve) => {
    loadImage(src).then((img) => {
      const { width, height } = img;
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, width, height) as ImageData;
      processImage(data, options).then((x) => resolve(x));
    });
  });
};

const processFace = (data: ImageData, options: OptionsType, facename: OrientationsType): Promise<string | { buffer: Buffer; filename: string }> => {
  return new Promise((resolve) => {
    const optons = {
      data,
      face: facename,
      rotation: (Math.PI * options.rotation) / 180,
      interpolation: options.interpolation,
      maxWidth: options.width,
    };

    renderFace(optons).then((data: ImageData) => {
      getDataURL(data, options.outformat).then((file: Buffer) => {
        if (options.outtype === 'file') {
          fs.writeFile(`${facename}.${options.outformat}`, file, 'binary', (err) => {
            if (err) console.log(err);
            else {
              console.log('The file was saved!');
              resolve(`${facename}.${options.outformat} was saved`);
            }
          });
        } else {
          resolve({
            buffer: file,
            filename: `${facename}.${options.outformat}`,
          });
        }
      });
    });
  });
};

const processImage = (data: ImageData, options: OptionsType): Promise<(string | { buffer: Buffer; filename: string })[]> => {
  const faces = ['back', 'front', 'left', 'right', 'top', 'bottom'].map((face: OrientationsType) => processFace(data, options, face));

  return new Promise((resolve) => Promise.all(faces).then((x) => resolve(x)));
};

export { convertImage };
