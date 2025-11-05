import { PanoramaLocationType } from '../pages/project-panorama/detail/lib-panorama/panorama.type';

/**
 * Demo data showing the new location-based structure
 * This is an example of how the new structure should look
 */
export const demoLocationData: PanoramaLocationType[] = [
  {
    id: 'kitchen',
    name: 'Kitchen',
    description: 'Kitchen area with different design options',
    defaultOption: 'kitchen-op2',
    pointPosition: { bottom: '50%', left: '50%' },
    cameraPosition: {
      yaw: 4.720283855981834,
      pitch: -0.0004923518129509308,
      fov: 45,
    },
    metadata: {
      faceSize: 256,
      nbTiles: 8,
      pc: {
        width: 8192,
        height: 4096,
      },
    },
    markers: [
      {
        id: 'markercwi7hOwm9zXQTyLnXBN9i-1',
        zoomLvl: 90,
        position: { yaw: 4.684620848795218, pitch: 0.015407146394328386 },
        toPanorama: 'kitchen-op2',
        toPanoramaTitle: 'Option 2',
        style: { cursor: 'pointer', zIndex: '100' },
      },
      {
        id: 'markercwi7hOwm9zXQTyLnXBN9i-2',
        zoomLvl: 90,
        position: {
          yaw: 0.45713701705421056,
          pitch: -0.18900277607022975,
        },
        toPanorama: 'kitchen-op1',
        toPanoramaTitle: 'Option 1',
        style: { cursor: 'pointer', zIndex: '100' },
      },
    ],
    options: [
      {
        id: 'kitchen-op1',
        name: 'Option 1',
        panorama: {
          id: 'kitchen-op1-pano',
          name: 'Option 1',
          description: 'This is the 01-Kitchen-OP1.jpg panorama',
          image: '01-Kitchen-OP1.jpg',
          thumbnail: '1.png',
        },
      },
      {
        id: 'kitchen-op2',
        name: 'Option 2',
        panorama: {
          id: 'kitchen-op2-pano',
          name: 'Option 2',
          description: 'This is the 01-Kitchen-OP2.jpg panorama',
          image: '01-Kitchen-OP2.jpg',
          thumbnail: '1.png',
        },
      },
      {
        id: 'kitchen-op3',
        name: 'Option 3',
        panorama: {
          id: 'kitchen-op3-pano',
          name: 'Option 3',
          description: 'This is the 01-Kitchen-OP3.jpg panorama',
          image: '01-Kitchen-OP3.jpg',
          thumbnail: '1.png',
        },
      },
    ],
  },
  {
    id: 'living-room',
    name: 'Living Room',
    description: 'Living room with different furniture arrangements',
    defaultOption: 'living-room-op1',
    pointPosition: { bottom: '30%', left: '70%' },
    cameraPosition: {
      yaw: 3.14159,
      pitch: 0.1,
      fov: 45,
    },
    metadata: {
      faceSize: 256,
      nbTiles: 8,
      pc: {
        width: 8192,
        height: 4096,
      },
    },
    markers: [],
    options: [
      {
        id: 'living-room-op1',
        name: 'Modern Style',
        panorama: {
          id: 'living-room-op1-pano',
          name: 'Modern Style',
          description: 'Modern living room design',
          image: '02-Living-Room-Modern.jpg',
          thumbnail: '2.png',
        },
      },
      {
        id: 'living-room-op2',
        name: 'Classic Style',
        panorama: {
          id: 'living-room-op2-pano',
          name: 'Classic Style',
          description: 'Classic living room design',
          image: '02-Living-Room-Classic.jpg',
          thumbnail: '2.png',
        },
      },
    ],
  },
];

/**
 * Example of how to use the new structure
 */
export const exampleUsage = () => {
  // Get all panoramas from locations (for backward compatibility)
  const allPanoramas = demoLocationData.flatMap((location) => location.options.map((option) => option.panorama));

  // Get default panorama for a specific location
  const kitchenLocation = demoLocationData.find((loc) => loc.id === 'kitchen');
  if (kitchenLocation) {
    const defaultOption = kitchenLocation.options.find((opt) => opt.id === kitchenLocation.defaultOption);
    const defaultPanorama = defaultOption?.panorama;
    console.log('Default kitchen panorama:', defaultPanorama?.description);
  }

  // Get all options for a location
  const kitchenOptions = demoLocationData.find((loc) => loc.id === 'kitchen')?.options || [];
  console.log(
    'Kitchen options:',
    kitchenOptions.map((opt) => opt.name),
  );

  return {
    allPanoramas,
    kitchenOptions,
    totalLocations: demoLocationData.length,
    totalOptions: demoLocationData.reduce((sum, loc) => sum + loc.options.length, 0),
  };
};
