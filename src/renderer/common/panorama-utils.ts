import { PanoramaDataType, PanoramaLocationType, PanoramaOptionType } from '../pages/project-panorama/detail/lib-panorama/panorama.type';

/**
 * Convert old panorama array structure to new location-based structure
 * @param panoramas - Array of panoramas in old format
 * @returns Array of locations with options
 */
export const convertPanoramasToLocations = (panoramas: PanoramaDataType[]): PanoramaLocationType[] => {
  // Group panoramas by their pointPosition to create locations
  const locationMap = new Map<string, PanoramaDataType[]>();

  panoramas.forEach((panorama) => {
    const positionKey = `${panorama.pointPosition.bottom}-${panorama.pointPosition.left}`;
    if (!locationMap.has(positionKey)) {
      locationMap.set(positionKey, []);
    }
    locationMap.get(positionKey)!.push(panorama);
  });

  // Convert to location structure
  return Array.from(locationMap.entries()).map(([, panoramaGroup], index) => {
    const firstPanorama = panoramaGroup[0];
    const locationId = `location-${index + 1}`;

    const options: PanoramaOptionType[] = panoramaGroup.map((panorama, optionIndex) => ({
      id: `${locationId}-op${optionIndex + 1}`,
      name: `Option ${optionIndex + 1}`,
      panorama: panorama,
    }));

    return {
      id: locationId,
      name: `Location ${index + 1}`,
      description: firstPanorama.description || `Location with ${panoramaGroup.length} options`,
      defaultOption: options[0].id,
      pointPosition: firstPanorama.pointPosition,
      options: options,
    };
  });
};

/**
 * Convert new location-based structure back to old panorama array
 * @param locations - Array of locations with options
 * @returns Array of panoramas in old format
 */
export const convertLocationsToPanoramas = (locations: PanoramaLocationType[]): PanoramaDataType[] => {
  const panoramas: PanoramaDataType[] = [];

  locations.forEach((location) => {
    location.options.forEach((option) => {
      // Ensure panorama has required fields with defaults
      const panorama = {
        ...option.panorama,
        cameraPosition: option.panorama.cameraPosition || {
          yaw: 0,
          pitch: 0,
          fov: 45,
        },
        pointPosition: option.panorama.pointPosition || {
          bottom: '50%',
          left: '50%',
        },
        markers: option.panorama.markers || [],
      };
      panoramas.push(panorama);
    });
  });

  return panoramas;
};

/**
 * Get all panoramas from locations (flattened)
 * @param locations - Array of locations with options
 * @returns Array of all panoramas
 */
export const getAllPanoramasFromLocations = (locations: PanoramaLocationType[]): PanoramaDataType[] => {
  return convertLocationsToPanoramas(locations);
};

/**
 * Get default panorama for a location
 * @param location - Location with options
 * @returns Default panorama or first panorama if default not found
 */
export const getDefaultPanoramaForLocation = (location: PanoramaLocationType): PanoramaDataType => {
  const defaultOption = location.options.find((option) => option.id === location.defaultOption);
  return defaultOption ? defaultOption.panorama : location.options[0].panorama;
};

/**
 * Get panorama by option ID from locations
 * @param locations - Array of locations with options
 * @param optionId - ID of the option to find
 * @returns Found panorama or undefined
 */
export const getPanoramaByOptionIdFromLocations = (locations: PanoramaLocationType[], optionId: string): PanoramaDataType | undefined => {
  for (const location of locations) {
    for (const option of location.options) {
      if (option.id === optionId) {
        return option.panorama;
      }
    }
  }
  return undefined;
};
