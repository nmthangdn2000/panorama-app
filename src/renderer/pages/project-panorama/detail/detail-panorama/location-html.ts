import { PanoramaLocationType } from '../lib-panorama/panorama.type';

export const itemLocationPanorama = (location: PanoramaLocationType, borderColor: string) => {
  // Prefer second option if available, otherwise first option
  const defaultOption = location.options.find((opt) => opt.id === location.defaultOption) || 
    (location.options.length > 1 ? location.options[1] : location.options[0]);
  const defaultPanorama = defaultOption.panorama;

  const regex = /[\/\\]/;
  let src = defaultPanorama.image;
  if (!regex.test(src)) src = `${window.pathProject}/panoramas/${src}`;

  return `
    <div class="location_panorama bg-white border border-gray-200 rounded-lg shadow-md dark:border-gray-700 dark:bg-gray-800 mb-6" data-location-id="${location.id}">
      <!-- Location Header -->
      <div class="location-header bg-gray-50 dark:bg-gray-700 px-4 py-3 rounded-t-lg border-b border-gray-200 dark:border-gray-600">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <!-- Drag Handle -->
            <div class="drag-handle cursor-grab text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11 18C11 19.1 10.1 20 9 20C7.9 20 7 19.1 7 18C7 16.9 7.9 16 9 16C10.1 16 11 16.9 11 18ZM9 10C7.9 10 7 10.9 7 12C7 13.1 7.9 14 9 14C10.1 14 11 13.1 11 12C11 10.9 10.1 10 9 10ZM9 4C7.9 4 7 4.9 7 6C7 7.1 7.9 8 9 8C10.1 8 11 7.1 11 6C11 4.9 10.1 4 9 4ZM15 8C16.1 8 17 7.1 17 6C17 4.9 16.1 4 15 4C13.9 4 13 4.9 13 6C13 7.1 13.9 8 15 8ZM15 10C13.9 10 13 10.9 13 12C13 13.1 13.9 14 15 14C16.1 14 17 13.1 17 12C17 10.9 16.1 10 15 10ZM15 16C13.9 16 13 16.9 13 18C13 19.1 13.9 20 15 20C16.1 20 17 19.1 17 18C17 16.9 16.1 16 15 16Z"/>
              </svg>
            </div>
            <div class="w-3 h-3 rounded-full" style="background-color: ${borderColor}"></div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${location.name}</h3>
            <span class="text-sm text-gray-500 dark:text-gray-400">(${location.options.length} options)</span>
            ${location.markers && location.markers.length > 0 ? `<span class="text-sm text-blue-500 dark:text-blue-400 ml-2">${location.markers.length} markers</span>` : ''}
          </div>
          <div class="flex items-center gap-2">
            <button onclick="onEditLocationName('${location.id}')" title="Edit Location Name" type="button" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M13.9993 4.18177C14.7686 3.42506 15.8116 3 16.8991 3C17.9866 3 19.0296 3.42506 19.799 4.18177C20.5676 4.93912 21 5.96653 21 7.03713C21 8.10486 20.5705 9.12903 19.8057 9.8858L18.5002 11.2139L12.6998 5.50355L13.9872 4.1938L13.9993 4.18177ZM11.2826 6.94524L6.1861 12.1299L8.36073 14.2713L13.4239 9.05326L11.2826 6.94524ZM5.03244 13.8309L3.05229 19.6799C2.93029 20.0403 3.02557 20.4376 3.29843 20.7062C3.57129 20.9748 3.97488 21.0686 4.34097 20.9485L10.2823 18.9992L5.03244 13.8309ZM11.9866 17.8401L17.0831 12.6555L14.8651 10.472L9.80193 15.6901L11.9866 17.8401Z"/>
              </svg>
            </button>
            <button onclick="onRemoveLocation('${location.id}')" title="Remove Location" type="button" class="text-red-400 hover:text-red-600 dark:hover:text-red-300">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6H19C19.5523 6 20 6.44772 20 7C20 7.55228 19.5523 8 19 8V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V8C4.44772 8 4 7.55228 4 7C4 6.44772 4.44772 6 5 6H8V4C8 3.46957 8.21071 2.96086 8.58579 2.58579ZM10 6H14V4H10V6ZM11 10C11 9.44772 10.5523 9 10 9C9.44772 9 9 9.44772 9 10V18C9 18.5523 9.44772 19 10 19C10.5523 19 11 18.5523 11 18V10ZM15 10C15 9.44772 14.5523 9 14 9C13.4477 9 13 9.44772 13 10V18C13 18.5523 13.4477 19 14 19C14.5523 19 15 18.5523 15 18V10Z"/>
              </svg>
            </button>
          </div>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">${location.description}</p>
      </div>

      <!-- Options Container -->
      <div class="options-container p-4">
        <!-- Option Tabs -->
        <div class="option-tabs flex gap-2 mb-4 overflow-x-auto">
          ${location.options
            .map(
              (option) => `
            <div class="option-tab-container relative group">
              <button
                onclick="onSelectOption('${location.id}', '${option.id}')"
                class="option-tab px-3 py-2 pr-6 text-sm font-medium rounded-md transition-colors whitespace-nowrap
                  ${
                    option.id === location.defaultOption
                      ? 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700'
                      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-500'
                  }"
                data-option-id="${option.id}"
              >
                ${option.name}
              </button>
              <!-- Remove button - only show on hover and if there's more than 1 option -->
              ${
                location.options.length > 1
                  ? `
                <button
                  onclick="onRemoveOption('${location.id}', '${option.id}')"
                  class="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-xs hover:bg-red-600 z-10 transform translate-x-1/2 -translate-y-1/2"
                  title="Remove option"
                >
                  ×
                </button>
              `
                  : ''
              }
            </div>
          `,
            )
            .join('')}
          <!-- Add Option Button -->
          <button
            onclick="onAddOption('${location.id}')"
            class="px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap bg-green-100 text-green-700 border border-green-200 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-800"
            title="Add new option"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="inline mr-1">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
            </svg>
            Add Option
          </button>
        </div>

        <!-- Selected Option Content -->
        <div class="selected-option-content">
          ${itemOptionPanorama(location.id, defaultOption.id, defaultPanorama, borderColor, defaultOption.name)}
        </div>
      </div>
    </div>
  `;
};

export const itemOptionPanorama = (locationId: string, optionId: string, panorama: any, borderColor: string, optionName: string) => {
  const regex = /[\/\\]/;
  let src = panorama.image;
  if (!regex.test(src)) src = `${window.pathProject}/panoramas/${src}`;

  // Get metadata from location (now stored at location level)
  let metadata: any = null;
  if (window.locations && window.locations.length > 0) {
    const location = window.locations.find((loc) => loc.id === locationId);
    if (location) {
      metadata = location.metadata;
    }
  }

  return `
    <div class="option-panorama-content" data-location-id="${locationId}" data-option-id="${optionId}">
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Panorama Image -->
        <div class="flex-shrink-0">
          <img
            class="object-cover w-full md:w-48 h-48 md:h-32 rounded-lg border-2"
            style="border-color: ${borderColor}"
            src="${src}"
            alt="${optionName}"
          />
        </div>

        <!-- Panorama Details -->
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <h4 class="text-lg font-medium text-gray-900 dark:text-white">${optionName}</h4>
            <button onclick="onEditPanoramaTitle('${locationId}', '${optionId}')" title="Edit Title" type="button" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M13.9993 4.18177C14.7686 3.42506 15.8116 3 16.8991 3C17.9866 3 19.0296 3.42506 19.799 4.18177C20.5676 4.93912 21 5.96653 21 7.03713C21 8.10486 20.5705 9.12903 19.8057 9.8858L18.5002 11.2139L12.6998 5.50355L13.9872 4.1938L13.9993 4.18177ZM11.2826 6.94524L6.1861 12.1299L8.36073 14.2713L13.4239 9.05326L11.2826 6.94524ZM5.03244 13.8309L3.05229 19.6799C2.93029 20.0403 3.02557 20.4376 3.29843 20.7062C3.57129 20.9748 3.97488 21.0686 4.34097 20.9485L10.2823 18.9992L5.03244 13.8309ZM11.9866 17.8401L17.0831 12.6555L14.8651 10.472L9.80193 15.6901L11.9866 17.8401Z"/>
              </svg>
            </button>
          </div>

          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">${panorama.description}</p>

          <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>${metadata?.width || 0} x ${metadata?.height || 0} px</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col gap-2">
          <button onclick="onRemoveOption('${locationId}', '${optionId}')" type="button" class="text-red-700 border border-red-700 hover:bg-red-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-md text-sm px-3 py-2 text-center inline-flex items-center dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:focus:ring-red-800 dark:hover:bg-red-500">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6H19C19.5523 6 20 6.44772 20 7C20 7.55228 19.5523 8 19 8V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V8C4.44772 8 4 7.55228 4 7C4 6.44772 4.44772 6 5 6H8V4C8 3.46957 8.21071 2.96086 8.58579 2.58579ZM10 6H14V4H10V6ZM11 10C11 9.44772 10.5523 9 10 9C9.44772 9 9 9.44772 9 10V18C9 18.5523 9.44772 19 10 19C10.5523 19 11 18.5523 11 18V10ZM15 10C15 9.44772 14.5523 9 14 9C13.4477 9 13 9.44772 13 10V18C13 18.5523 13.4477 19 14 19C14.5523 19 15 18.5523 15 18V10Z"/>
            </svg>
            Remove
          </button>

          <button onclick="onSetDefaultOption('${locationId}', '${optionId}')" type="button" class="text-blue-700 border border-blue-700 hover:bg-blue-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-md text-sm px-3 py-2 text-center inline-flex items-center dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:focus:ring-blue-800 dark:hover:bg-blue-500">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
            </svg>
            Set Default
          </button>
        </div>
      </div>
    </div>
  `;
};
