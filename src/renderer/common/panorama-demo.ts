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
    defaultOption: 'kitchen-op1',
    pointPosition: { bottom: '50%', left: '50%' },
    options: [
      {
        id: 'kitchen-op1',
        name: 'Option 1',
        panorama: {
          pointPosition: { bottom: '50%', left: '50%' },
          cameraPosition: {
            yaw: 4.720283855981834,
            pitch: -0.0004923518129509308,
          },
          description: 'This is the 01-Kitchen-OP1.jpg panorama',
          image: '01-Kitchen-OP1.jpg',
          thumbnail: '1.png',
          markers: [],
          metadata: { width: 8192, height: 4096, faceSize: 256, nbTiles: 8 },
        },
      },
      {
        id: 'kitchen-op2',
        name: 'Option 2',
        panorama: {
          pointPosition: { bottom: '50%', left: '50%' },
          cameraPosition: {
            yaw: 2.5644056031325437,
            pitch: -0.18120413994219753,
            fov: 45,
          },
          description: 'This is the 01-Kitchen-OP2.jpg panorama',
          image: '01-Kitchen-OP2.jpg',
          thumbnail: '1.png',
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
          metadata: { width: 8192, height: 4096, faceSize: 256, nbTiles: 8 },
        },
      },
      {
        id: 'kitchen-op3',
        name: 'Option 3',
        panorama: {
          pointPosition: { bottom: '50%', left: '50%' },
          cameraPosition: {
            yaw: 4.720283855981834,
            pitch: -0.0004923518129509308,
          },
          description: 'This is the 01-Kitchen-OP3.jpg panorama',
          image: '01-Kitchen-OP3.jpg',
          thumbnail: '1.png',
          markers: [],
          metadata: { width: 8192, height: 4096, faceSize: 256, nbTiles: 8 },
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
    options: [
      {
        id: 'living-room-op1',
        name: 'Modern Style',
        panorama: {
          pointPosition: { bottom: '30%', left: '70%' },
          cameraPosition: {
            yaw: 3.14159,
            pitch: 0.1,
          },
          description: 'Modern living room design',
          image: '02-Living-Room-Modern.jpg',
          thumbnail: '2.png',
          markers: [],
          metadata: { width: 8192, height: 4096, faceSize: 256, nbTiles: 8 },
        },
      },
      {
        id: 'living-room-op2',
        name: 'Classic Style',
        panorama: {
          pointPosition: { bottom: '30%', left: '70%' },
          cameraPosition: {
            yaw: 3.14159,
            pitch: 0.1,
          },
          description: 'Classic living room design',
          image: '02-Living-Room-Classic.jpg',
          thumbnail: '2.png',
          markers: [],
          metadata: { width: 8192, height: 4096, faceSize: 256, nbTiles: 8 },
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
