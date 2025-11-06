import { nanoid } from 'nanoid';
import { PanoramaDataType, PanoramaOptionType, PanoramaLocationType } from '../lib-panorama/panorama.type';
import { destroyViewerPanorama } from '../preview-panorama/preview-panorama';
// import { itemImagePanorama } from './html'; // Not used anymore
import { itemLocationPanorama, itemOptionPanorama } from './location-html';
import { debounce } from '../lib-panorama/util';

const btnRemoveAllPanorama = document.getElementById('btn_remove_all_panorama')! as HTMLButtonElement;
const imagePanoramaContainer = document.getElementById('image_panorama_container')! as HTMLDivElement;

const openDialogSelectImages = () => {
  document.getElementById('btn-open-dialog')!.addEventListener('click', async () => {
    const folderPath = await window.api.projectPanorama.selectImages();

    if (!folderPath) return;

    // Create separate location for each image
    console.log('Adding images:', folderPath.length, 'images');

    if (!window.locations) window.locations = [];

    folderPath.forEach((path) => {
      const lastDotIndex = path.name.lastIndexOf('.');

      const newPanorama: PanoramaDataType = {
        id: nanoid(),
        name: path.name.substring(0, lastDotIndex),
        description: `This is the ${path.name} panorama`,
        image: `file://${path.path}`,
        thumbnail: '1.png',
        isNew: true,
      };

      const newOption: PanoramaOptionType = {
        id: nanoid(),
        name: `Option 1`,
        panorama: newPanorama,
      };

      // Create separate location for each image
      // pointPosition, cameraPosition, minimap, metadata are now at location level
      const pcWidth = path.metadata.width;
      const pcHeight = path.metadata.height;

      // Calculate sizes for different devices
      // Tablet: 4096x2048 (or scale down by 2x from PC)
      const tabletWidth = Math.min(4096, Math.round(pcWidth / 2));
      const tabletHeight = Math.min(2048, Math.round(pcHeight / 2));

      // Mobile: 2048x1024 (or scale down by 4x from PC)
      const mobileWidth = Math.min(2048, Math.round(pcWidth / 4));
      const mobileHeight = Math.min(1024, Math.round(pcHeight / 4));

      const newLocation: PanoramaLocationType = {
        id: nanoid(),
        name: `Location ${window.locations.length + 1}`,
        description: `Location with ${path.name}`,
        defaultOption: newOption.id,
        pointPosition: { bottom: '50%', left: '50%' },
        cameraPosition: { yaw: 4.720283855981834, pitch: -0.0004923518129509308 },
        metadata: {
          pc: {
            width: pcWidth,
            height: pcHeight,
          },
          tablet: {
            width: tabletWidth,
            height: tabletHeight,
          },
          mobile: {
            width: mobileWidth,
            height: mobileHeight,
          },
        },
        options: [newOption],
        markers: [],
      };

      window.locations.push(newLocation);
      console.log(`Added location:`, newLocation.name, 'with 1 option. Total locations:', window.locations.length);
    });

    renderListImage();
  });
};

export const renderListImage = () => {
  // Use only new structure (locations)
  const hasLocations = window.locations && window.locations.length > 0;

  if (hasLocations) {
    renderLocationsView();
  } else {
    renderEmptyView();
  }
};

const renderLocationsView = () => {
  console.log('Rendering locations view. Total locations:', window.locations?.length || 0);

  const sizePanoramas: {
    size: string;
    color: string;
  }[] = [];

  // Generate colors for different sizes
  const generateColor = (size: string) => {
    const isExist = sizePanoramas.findIndex((sizePanorama) => sizePanorama.size === size);
    if (isExist < 0) {
      const color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      sizePanoramas.push({ size, color });
      return color;
    }
    return sizePanoramas[isExist].color;
  };

  const html = window.locations!.map((location, index) => {
    console.log(`Rendering location ${index + 1}:`, location.name);
    // Get sizes from location metadata (now stored at location level)
    const width = location.metadata?.pc?.width || location.metadata?.tablet?.width || location.metadata?.mobile?.width;
    const height = location.metadata?.pc?.height || location.metadata?.tablet?.height || location.metadata?.mobile?.height;
    const size = width && height ? `${width}x${height}` : 'unknown';
    const sizes = [size];
    const uniqueSizes = [...new Set(sizes)];

    // Use the first size for color (or generate if mixed sizes)
    const color = uniqueSizes.length === 1 ? generateColor(uniqueSizes[0]) : '#ff6b6b';

    return itemLocationPanorama(location, color);
  });

  imagePanoramaContainer.innerHTML = html.join('');
  setupLocationEventHandlers();
};

const renderEmptyView = () => {
  imagePanoramaContainer.innerHTML = '';
};

// Setup event handlers for locations
const setupLocationEventHandlers = () => {
  // Update button states
  updateButtonStates();

  // Setup drag and drop for locations
  handleDragAndDropItem();

  destroyViewerPanorama();
  saveProjectPanorama();
};

// Setup event handlers for panoramas (removed - using locations only)

// Update button states based on data availability
const updateButtonStates = () => {
  const btnPreviewPanorama = document.getElementById('btn_preview_panorama')! as HTMLButtonElement;
  const btnRenderPanorama = document.getElementById('btn_render_panorama')! as HTMLButtonElement;
  const btnExportPanorama = document.getElementById('btn_export_panorama')! as HTMLButtonElement;
  const txtNoPanorama = imagePanoramaContainer.parentElement!.querySelector('p')! as HTMLParagraphElement;

  const hasData = window.locations && window.locations.length > 0;

  if (hasData) {
    btnRemoveAllPanorama.classList.remove('hidden');
    txtNoPanorama.classList.add('hidden');
    btnPreviewPanorama.classList.remove('hidden');
    btnRenderPanorama.classList.remove('hidden');
    btnExportPanorama.classList.remove('hidden');
  } else {
    btnRemoveAllPanorama.classList.add('hidden');
    txtNoPanorama.classList.remove('hidden');
    txtNoPanorama.textContent = 'No images have been added yet.';
  }
};

// Event handlers for locations (new structure)
window.onSelectOption = (locationId: string, optionId: string) => {
  if (!window.locations) return;

  const location = window.locations.find((loc) => loc.id === locationId);
  if (!location) return;

  const option = location.options.find((opt) => opt.id === optionId);
  if (!option) return;

  // Update the selected option content
  const selectedOptionContent = document.querySelector(`[data-location-id="${locationId}"] .selected-option-content`);
  if (selectedOptionContent) {
    const color = '#ff6b6b'; // You might want to calculate this based on the location
    selectedOptionContent.innerHTML = itemOptionPanorama(locationId, optionId, option.panorama, color, option.name);
  }

  // Update button states
  const optionTabs = document.querySelectorAll(`[data-location-id="${locationId}"] .option-tab`);
  optionTabs.forEach((tab) => {
    if (tab.getAttribute('data-option-id') === optionId) {
      tab.classList.add('bg-blue-100', 'text-blue-700', 'border-blue-200', 'dark:bg-blue-900', 'dark:text-blue-300', 'dark:border-blue-700');
      tab.classList.remove(
        'bg-gray-100',
        'text-gray-700',
        'border-gray-200',
        'hover:bg-gray-200',
        'dark:bg-gray-600',
        'dark:text-gray-300',
        'dark:border-gray-500',
        'dark:hover:bg-gray-500',
      );
    } else {
      tab.classList.remove('bg-blue-100', 'text-blue-700', 'border-blue-200', 'dark:bg-blue-900', 'dark:text-blue-300', 'dark:border-blue-700');
      tab.classList.add(
        'bg-gray-100',
        'text-gray-700',
        'border-gray-200',
        'hover:bg-gray-200',
        'dark:bg-gray-600',
        'dark:text-gray-300',
        'dark:border-gray-500',
        'dark:hover:bg-gray-500',
      );
    }
  });
};

window.onRemoveLocation = (locationId: string) => {
  if (!window.locations) return;

  const index = window.locations.findIndex((location) => location.id === locationId);
  if (index < 0) return;

  window.locations.splice(index, 1);
  renderListImage();
};

window.onRemoveOption = (locationId: string, optionId: string) => {
  if (!window.locations) return;

  const location = window.locations.find((loc) => loc.id === locationId);
  if (!location || location.options.length <= 1) return; // Don't remove if only one option

  const optionIndex = location.options.findIndex((opt) => opt.id === optionId);
  if (optionIndex < 0) return;

  location.options.splice(optionIndex, 1);

  // If we removed the default option, set the first remaining option as default
  if (location.defaultOption === optionId) {
    location.defaultOption = location.options[0].id;
  }

  // Rename and reorder options in ascending order
  location.options.forEach((option, index) => {
    option.name = `Option ${index + 1}`;
  });

  renderListImage();
};

window.onAddOption = async (locationId: string) => {
  if (!window.locations) return;

  const location = window.locations.find((loc) => loc.id === locationId);
  if (!location) return;

  // Open file dialog to select image
  const folderPath = await window.api.projectPanorama.selectImages();

  if (!folderPath || folderPath.length === 0) return;

  // Use the first selected image
  const path = folderPath[0];
  const lastDotIndex = path.name.lastIndexOf('.');

  const newPanorama: PanoramaDataType = {
    id: nanoid(),
    name: path.name.substring(0, lastDotIndex),
    description: `This is the ${path.name} panorama`,
    image: `file://${path.path}`,
    thumbnail: '1.png',
    isNew: true,
  };

  const newOption: PanoramaOptionType = {
    id: nanoid(),
    name: `Option ${location.options.length + 1}`,
    panorama: newPanorama,
  };

  // Update location metadata if needed (keep existing cameraPosition, pointPosition, minimap)
  if (path.metadata && !location.metadata) {
    location.metadata = {
      pc: {
        width: path.metadata.width,
        height: path.metadata.height,
      },
    };
  }

  location.options.push(newOption);
  renderListImage();
};

window.onSetDefaultOption = (locationId: string, optionId: string) => {
  if (!window.locations) return;

  const location = window.locations.find((loc) => loc.id === locationId);
  if (!location) return;

  location.defaultOption = optionId;
  renderListImage();
};

window.onEditLocationName = (locationId: string) => {
  if (!window.locations) return;

  const location = window.locations.find((loc) => loc.id === locationId);
  if (!location) return;

  const newName = prompt('Enter new location name:', location.name);
  if (newName && newName.trim()) {
    location.name = newName.trim();
    renderListImage();
  }
};

window.onEditPanoramaTitle = (locationId: string, optionId: string) => {
  if (!window.locations) return;

  const location = window.locations.find((loc) => loc.id === locationId);
  if (!location) return;

  const option = location.options.find((opt) => opt.id === optionId);
  if (!option) return;

  const newTitle = prompt('Enter new option name:', option.name);
  if (newTitle && newTitle.trim()) {
    option.name = newTitle.trim();
    renderListImage();
  }
};

btnRemoveAllPanorama.addEventListener('click', () => {
  window.locations = [];

  renderListImage();
});

const handleDragAndDropItem = () => {
  const items = document.querySelectorAll('.location_panorama') as NodeListOf<HTMLElement>;

  items.forEach((item) => {
    // Make the entire card not draggable by default
    item.draggable = false;
    item.style.cursor = 'default';

    // Find the drag handle within this item
    const dragHandle = item.querySelector('.drag-handle') as HTMLElement;
    if (dragHandle) {
      // Make only the drag handle draggable
      dragHandle.draggable = true;
      dragHandle.style.cursor = 'grab';

      dragHandle.addEventListener('dragstart', (e) => {
        // Set the entire card as the dragged element
        item.draggable = true;
        item.classList.add('dragging');
        item.style.cursor = 'grabbing';
        item.style.opacity = '0.5';

        // Set the drag data to the card
        e.dataTransfer?.setData('text/plain', item.getAttribute('data-location-id') || '');
      });

      dragHandle.addEventListener('dragend', () => {
        item.draggable = false;
        item.classList.remove('dragging');
        item.style.cursor = 'default';
        item.style.opacity = '1';

        // update locations order
        const items = document.querySelectorAll('.location_panorama');

        const newLocations: PanoramaLocationType[] = [];
        items.forEach((item) => {
          const id = item.getAttribute('data-location-id')!;
          const location = window.locations?.find((location) => location.id === id);
          if (location) {
            newLocations.push(location);
          }
        });

        if (!window.locations) window.locations = [];
        window.locations = newLocations;

        destroyViewerPanorama();
        saveProjectPanorama();
      });
    }
  });

  imagePanoramaContainer.addEventListener('dragover', initSortableList);
  imagePanoramaContainer.addEventListener('dragenter', (e) => e.preventDefault());
};

const initSortableList = (e: DragEvent) => {
  e.preventDefault();
  const draggingItem = document.querySelector('.dragging') as HTMLElement;
  const siblings = [...imagePanoramaContainer.querySelectorAll('.location_panorama:not(.dragging)')];

  let nextSibling = siblings.find((sibling) => {
    return e.clientY <= (sibling as HTMLElement).offsetTop + (sibling as HTMLElement).offsetHeight / 2;
  });

  // Inserting the dragging item before the found sibling
  imagePanoramaContainer.insertBefore(draggingItem, nextSibling!);
};

/**
 * Save project panorama
 */
export const saveProjectPanorama = () =>
  debounce(() => {
    const url = new URL(window.location.href);
    const name = url.searchParams.get('name');

    if (!name) {
      console.log('No project name found, cannot save');
      return;
    }

    // Save only locations (new structure)
    window.api.projectPanorama.saveProject(name, {
      locations: window.locations,
    });
  }, 100); // Reduced delay from 1000ms to 100ms

export default () => {
  openDialogSelectImages();
  handleDragAndDropItem();
};
