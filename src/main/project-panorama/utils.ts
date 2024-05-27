const clamp = (x: number, min: number, max: number) => Math.min(max, Math.max(x, min));

const mod = (x: number, n: number) => ((x % n) + n) % n;

export type OrientationsType = 'back' | 'front' | 'left' | 'right' | 'top' | 'bottom';
export type InterpolationsType = 'linear' | 'cubic' | 'lanczos' | 'nearest';

export type OutOrientationsType = {
  x?: number;
  y?: number;
  z?: number;
};

export type MimeTypesType = 'jpg' | 'png';

const mimeType = {
  jpg: 'image/jpeg',
  png: 'image/png',
};

const copyPixelNearest = (read: ImageData, write: ImageData) => {
  const { width, height, data } = read;
  const readIndex = (x: number, y: number) => 4 * (y * width + x);

  return (xFrom: number, yFrom: number, to: number) => {
    const nearest = readIndex(clamp(Math.round(xFrom), 0, width - 1), clamp(Math.round(yFrom), 0, height - 1));

    for (let channel = 0; channel < 3; channel++) {
      write.data[to + channel] = data[nearest + channel];
    }
  };
};

const copyPixelBilinear = (read: ImageData, write: ImageData) => {
  const { width, height, data } = read;
  const readIndex = (x: number, y: number) => 4 * (y * width + x);

  return (xFrom: number, yFrom: number, to: number) => {
    const xl = clamp(Math.floor(xFrom), 0, width - 1);
    const xr = clamp(Math.ceil(xFrom), 0, width - 1);
    const xf = xFrom - xl;

    const yl = clamp(Math.floor(yFrom), 0, height - 1);
    const yr = clamp(Math.ceil(yFrom), 0, height - 1);
    const yf = yFrom - yl;

    const p00 = readIndex(xl, yl);
    const p10 = readIndex(xr, yl);
    const p01 = readIndex(xl, yr);
    const p11 = readIndex(xr, yr);

    for (let channel = 0; channel < 3; channel++) {
      const p0 = data[p00 + channel] * (1 - xf) + data[p10 + channel] * xf;
      const p1 = data[p01 + channel] * (1 - xf) + data[p11 + channel] * xf;
      write.data[to + channel] = Math.ceil(p0 * (1 - yf) + p1 * yf);
    }
  };
};

// performs a discrete convolution with a provided kernel
const kernelResample = (read: ImageData, write: ImageData, filterSize: number, kernel: (x: number) => number) => {
  const { width, height, data } = read;
  const readIndex = (x: number, y: number) => 4 * (y * width + x);

  const twoFilterSize = 2 * filterSize;
  const xMax = width - 1;
  const yMax = height - 1;
  const xKernel = new Array(4);
  const yKernel = new Array(4);

  return (xFrom: number, yFrom: number, to: number) => {
    const xl = Math.floor(xFrom);
    const yl = Math.floor(yFrom);
    const xStart = xl - filterSize + 1;
    const yStart = yl - filterSize + 1;

    for (let i = 0; i < twoFilterSize; i++) {
      xKernel[i] = kernel(xFrom - (xStart + i));
      yKernel[i] = kernel(yFrom - (yStart + i));
    }

    for (let channel = 0; channel < 3; channel++) {
      let q = 0;

      for (let i = 0; i < twoFilterSize; i++) {
        const y = yStart + i;
        const yClamped = clamp(y, 0, yMax);
        let p = 0;
        for (let j = 0; j < twoFilterSize; j++) {
          const x = xStart + j;
          const index = readIndex(clamp(x, 0, xMax), yClamped);
          p += data[index + channel] * xKernel[j];
        }
        q += p * yKernel[i];
      }

      write.data[to + channel] = Math.round(q);
    }
  };
};

const copyPixelBicubic = (read: ImageData, write: ImageData) => {
  const b = -0.5;
  const kernel = (x: number) => {
    x = Math.abs(x);
    const x2 = x * x;
    const x3 = x * x * x;
    return x <= 1 ? (b + 2) * x3 - (b + 3) * x2 + 1 : b * x3 - 5 * b * x2 + 8 * b * x - 4 * b;
  };

  return kernelResample(read, write, 2, kernel);
};

const copyPixelLanczos = (read: ImageData, write: ImageData) => {
  const filterSize = 5;
  const kernel = (x: number) => {
    if (x === 0) {
      return 1;
    } else {
      const xp = Math.PI * x;
      return (filterSize * Math.sin(xp) * Math.sin(xp / filterSize)) / (xp * xp);
    }
  };

  return kernelResample(read, write, filterSize, kernel);
};

const orientations = {
  // pz
  back: (out: OutOrientationsType, x: number, y: number) => {
    out.x = -1;
    out.y = -x;
    out.z = -y;
  },
  // nz
  front: (out: OutOrientationsType, x: number, y: number) => {
    out.x = 1;
    out.y = x;
    out.z = -y;
  },
  // px
  left: (out: OutOrientationsType, x: number, y: number) => {
    out.x = x;
    out.y = -1;
    out.z = -y;
  },
  // nx
  right: (out: OutOrientationsType, x: number, y: number) => {
    out.x = -x;
    out.y = 1;
    out.z = -y;
  },
  // py
  top: (out: OutOrientationsType, x: number, y: number) => {
    out.x = -y;
    out.y = -x;
    out.z = 1;
  },
  // ny
  bottom: (out: OutOrientationsType, x: number, y: number) => {
    out.x = y;
    out.y = -x;
    out.z = -1;
  },
};

const interpolations = {
  linear: copyPixelBilinear,
  cubic: copyPixelBicubic,
  lanczos: copyPixelLanczos,
  nearest: copyPixelNearest,
};

export { mod, interpolations, orientations, mimeType };
