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
      name: firstPanorama.title || `Location ${index + 1}`,
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
      panoramas.push(option.panorama);
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
 * Get panorama by ID from locations
 * @param locations - Array of locations with options
 * @param panoramaId - ID of the panorama to find
 * @returns Found panorama or undefined
 */
export const getPanoramaByIdFromLocations = (locations: PanoramaLocationType[], panoramaId: string): PanoramaDataType | undefined => {
  for (const location of locations) {
    for (const option of location.options) {
      if (option.panorama.id === panoramaId) {
        return option.panorama;
      }
    }
  }
  return undefined;
};
