# Panorama Structure Update

## Overview

The panorama data structure has been updated to support multiple options per location, allowing for more flexible and organized panorama management.

## New Structure

### Before (Old Structure)

```typescript
// Simple array of panoramas
panoramas: PanoramaDataType[]
```

### After (New Structure)

```typescript
// Locations with multiple options
locations: PanoramaLocationType[]
```

## Data Structure

### PanoramaLocationType

```typescript
{
  id: string;                    // Unique location identifier
  name: string;                  // Display name for the location
  description: string;           // Description of the location
  defaultOption: string;         // ID of the default option
  pointPosition: {               // Position on the map
    bottom: string;
    left: string;
  };
  options: PanoramaOptionType[]; // Array of options for this location
}
```

### PanoramaOptionType

```typescript
{
  id: string; // Unique option identifier
  name: string; // Display name for the option
  panorama: PanoramaDataType; // The actual panorama data
}
```

## Example Usage

### Creating a Location with Multiple Options

```typescript
const kitchenLocation: PanoramaLocationType = {
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
        id: 'yKAnGHvbQLJ7Oj1-Geqh-',
        title: '01-Kitchen-OP1',
        // ... panorama data
      },
    },
    {
      id: 'kitchen-op2',
      name: 'Option 2',
      panorama: {
        id: 'cwi7hOwm9zXQTyLnXBN9i',
        title: '01-Kitchen-OP2',
        // ... panorama data
      },
    },
  ],
};
```

## Utility Functions

The following utility functions are available in `src/renderer/common/panorama-utils.ts`:

### convertPanoramasToLocations(panoramas: PanoramaDataType[])

Converts old panorama array structure to new location-based structure.

### convertLocationsToPanoramas(locations: PanoramaLocationType[])

Converts new location-based structure back to old panorama array for backward compatibility.

### getAllPanoramasFromLocations(locations: PanoramaLocationType[])

Gets all panoramas from locations (flattened array).

### getDefaultPanoramaForLocation(location: PanoramaLocationType)

Gets the default panorama for a specific location.

### getPanoramaByIdFromLocations(locations: PanoramaLocationType[], panoramaId: string)

Finds a panorama by ID from the locations structure.

## Backward Compatibility

The system maintains full backward compatibility:

1. **Old projects** with `panoramas` array will continue to work
2. **New projects** can use the `locations` structure
3. **Automatic conversion** happens when loading projects:
   - If only `panoramas` exist, they are converted to `locations`
   - If only `locations` exist, they are converted to `panoramas` for compatibility
   - Both structures can coexist

## Migration Guide

### For Existing Projects

No action required. Existing projects will automatically work with the new structure.

### For New Projects

Use the new `locations` structure for better organization:

```typescript
// Instead of this:
const project = {
  panoramas: [panorama1, panorama2, panorama3],
};

// Use this:
const project = {
  locations: [
    {
      id: 'location1',
      name: 'Location 1',
      defaultOption: 'option1',
      options: [
        { id: 'option1', name: 'Option 1', panorama: panorama1 },
        { id: 'option2', name: 'Option 2', panorama: panorama2 },
      ],
    },
  ],
};
```

## File Storage

- **Old structure**: Stored in `panoramas.json`
- **New structure**: Stored in `locations.json`
- **Both files** can exist simultaneously for maximum compatibility

## Benefits

1. **Better Organization**: Group related panoramas by location
2. **Multiple Options**: Support multiple design options per location
3. **Default Selection**: Specify which option is shown by default
4. **Backward Compatibility**: Existing projects continue to work
5. **Flexible Navigation**: Easy switching between options at the same location

## Demo Data

See `src/renderer/common/panorama-demo.ts` for complete examples of the new structure.
