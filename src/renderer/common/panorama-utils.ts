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
    // For backward compatibility: panoramas in old format may have pointPosition
    // If not, use default position
    const pointPosition = (panorama as any).pointPosition || { bottom: '50%', left: '50%' };
    const positionKey = `${pointPosition.bottom}-${pointPosition.left}`;
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
      name: panorama.name || `Option ${optionIndex + 1}`,
      panorama: panorama,
    }));

    // Get markers, cameraPosition, minimap, metadata from the first panorama
    // Note: For backward compatibility, old panoramas might have these fields
    const markers = (firstPanorama as any).markers || [];
    const cameraPosition = (firstPanorama as any).cameraPosition || {
      yaw: 0,
      pitch: 0,
      fov: 45,
    };
    // minimap might be undefined or MinimapType from old panorama structure
    const minimap = (firstPanorama as any).minimap;
    const metadata = (firstPanorama as any).metadata;
    const pointPosition = (firstPanorama as any).pointPosition || { bottom: '50%', left: '50%' };

    return {
      id: locationId,
      name: firstPanorama.name || `Location ${index + 1}`,
      description: firstPanorama.description || `Location with ${panoramaGroup.length} options`,
      defaultOption: options[0].id,
      pointPosition: pointPosition,
      cameraPosition: cameraPosition,
      minimap: minimap,
      metadata: metadata,
      options: options,
      markers: markers,
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
      // For backward compatibility, add location-level properties to panorama
      // Note: These properties are now stored at location level, not panorama level
      const panorama: any = {
        ...option.panorama,
        // Location-level properties are now on location, but we add them to panorama for backward compatibility
        pointPosition: location.pointPosition || { bottom: '50%', left: '50%' },
        cameraPosition: location.cameraPosition || {
          yaw: 0,
          pitch: 0,
          fov: 45,
        },
        minimap: location.minimap,
        metadata: location.metadata,
        // For backward compatibility, we include location markers on panorama
        // but they should not be used for new code
        markers: location.markers || [],
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
