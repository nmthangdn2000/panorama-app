import { PanoramaDataType } from '../src/panorama/panorama.type';

type WindowType = {
  onMarkerClick: (id: number, markerId: string) => void;
  panoramas: PanoramaDataType[];
} & typeof window;

export const WINDOW: WindowType = window as WindowType;

export const panoramaDefaultOptions: PanoramaDataType = {
  id: 1,
  title: 'CAM 1',
  pointPosition: { bottom: '50%', left: '50%' },
  cameraPosition: { yaw: 4.720283855981834, pitch: -0.0004923518129509308 },
  subtitle: 'C1',
  description: 'This is the C1 panorama',
  image: 'C1.jpg',
  thumbnail: '1.png',
  markers: [],
};
