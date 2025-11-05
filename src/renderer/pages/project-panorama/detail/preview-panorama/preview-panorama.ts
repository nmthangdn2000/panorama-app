import { Modal } from 'flowbite';
import { Panorama } from '../lib-panorama';
import Swiper from 'swiper';
import { convertLocationsToPanoramas, convertPanoramasToLocations } from '../../../../common/panorama-utils';

import 'swiper/css';
import { EffectCards, Manipulation } from 'swiper/modules';

const viewerElement = document.getElementById('viewer')! as HTMLElement;
const modalViewer = new Modal(document.getElementById('modal_viewer')!, {
  backdrop: 'static',
  closable: false,
});

const onClickPreviewPanorama = () => {
  const btnPreviewPanorama = document.getElementById('btn_preview_panorama')! as HTMLButtonElement;

  btnPreviewPanorama.addEventListener('click', () => {
    modalViewer.show();
    previewPanorama();
  });
};

const previewPanorama = () => {
  // Use new structure (locations) with fallback to old structure (panoramas)
  let locations: any[] = [];
  let panoramas: any[] = [];

  if (window.locations && window.locations.length > 0) {
    locations = window.locations;
    panoramas = convertLocationsToPanoramas(window.locations);
  } else if (window.panoramas && window.panoramas.length > 0) {
    // Convert old structure to new structure for consistency
    locations = convertPanoramasToLocations(window.panoramas);
    panoramas = window.panoramas;
  }

  if (locations.length === 0) return;

  // Debug: Log data to check structure
  console.log('Locations for preview:', locations);
  console.log('Panoramas for viewer:', panoramas);

  if (window.viewerPanorama) {
    return;
  }

  window.viewerPanorama = new Panorama(
    viewerElement,
    panoramas,
    {
      debug: true,
    },
    locations,
  );

  // Set initial panorama (prefer second option if available, otherwise first option)
  const firstLocation = locations[0];
  const firstOption = firstLocation.options.length > 1 ? firstLocation.options[1] : firstLocation.options[0];
  window.viewerPanorama.setPanorama(firstOption.panorama.image);

  const swiper = new Swiper('.carousel_swiper', {
    modules: [Manipulation, EffectCards],
    breakpoints: {
      768: {
        slidesPerView: locations.length > 3 ? 3 : locations.length,
        spaceBetween: 10,
      },
      1024: {
        slidesPerView: locations.length > 5 ? 5 : locations.length,
        spaceBetween: 10,
      },
      1280: {
        slidesPerView: locations.length > 6 ? 6 : locations.length,
        spaceBetween: 10,
      },
      1536: {
        slidesPerView: locations.length > 7 ? 7 : locations.length,
        spaceBetween: 10,
      },
      1792: {
        slidesPerView: locations.length > 8 ? 8 : locations.length,
        spaceBetween: 10,
      },
      2048: {
        slidesPerView: locations.length > 9 ? 9 : locations.length,
        spaceBetween: 10,
      },
    },
  });

  // Create slides for each location
  locations.forEach((location) => {
    // Prefer second option if available, otherwise first option
    const defaultOption = location.options.find((opt) => opt.id === location.defaultOption) || 
      (location.options.length > 1 ? location.options[1] : location.options[0]);

    // Handle different image path formats
    let imageSrc = '';
    if (defaultOption.panorama.image.startsWith('file://')) {
      imageSrc = defaultOption.panorama.image;
    } else if (defaultOption.panorama.image.startsWith('http')) {
      imageSrc = defaultOption.panorama.image;
    } else {
      imageSrc = `${window.pathProject}/panoramas/${defaultOption.panorama.image}`;
    }

    swiper.appendSlide(
      `<div class="swiper-slide cursor-pointer p-[2px] border-2 border-transparent rounded [&.active]:border-red-500 transition-all relative" data-location-id="${location.id}">
        <img src="${imageSrc}" alt="${location.name}" class="rounded" />
        <div class="absolute top-2 left-2 right-2">
          <div class="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            ${location.name}
          </div>
        </div>
      </div>`,
    );
  });

  // Create option buttons container above swiper
  const optionButtonsContainer = document.createElement('div');
  optionButtonsContainer.id = 'option-buttons-container';
  optionButtonsContainer.className = 'mb-4 flex justify-center gap-2 flex-wrap';
  optionButtonsContainer.style.display = 'none'; // Hidden initially

  // Insert option buttons container before swiper
  const swiperContainer = document.querySelector('.carousel_swiper')?.parentElement;
  console.log('Swiper container found:', swiperContainer);
  if (swiperContainer) {
    swiperContainer.insertBefore(optionButtonsContainer, swiperContainer.firstChild);
    console.log('Option buttons container inserted');
  } else {
    console.error('Swiper container not found!');
  }

  // Function to update option buttons for a location
  const updateOptionButtons = (locationId: string, activeOptionId?: string) => {
    const location = locations.find((loc) => loc.id === locationId);
    if (!location) return;

    const optionButtonsContainer = document.getElementById('option-buttons-container');
    if (!optionButtonsContainer) return;

    // Clear existing buttons
    optionButtonsContainer.innerHTML = '';

    if (location.options.length > 1) {
      // Show container and create buttons
      optionButtonsContainer.style.display = 'flex';

      // Determine which option should be active
      const currentActiveOptionId = activeOptionId || location.defaultOption;

      location.options.forEach((option, optionIndex) => {
        const button = document.createElement('button');
        const isActive = option.id === currentActiveOptionId;
        button.className = `px-4 py-2 text-sm font-medium rounded-lg transition-all ${isActive ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`;
        button.textContent = option.name || `Option ${optionIndex + 1}`;
        button.setAttribute('data-location-id', locationId);
        button.setAttribute('data-option-id', option.id);

        optionButtonsContainer.appendChild(button);
      });
    } else {
      // Hide container if only one option
      optionButtonsContainer.style.display = 'none';
    }
  };

  // Show option buttons for first location
  updateOptionButtons(firstLocation.id);

  // Add click event listeners to swiper slides
  swiper.slides.forEach((slide, slideIndex) => {
    slide.addEventListener('click', () => {
      console.log('Swiper slide clicked!', slideIndex);
      const locationId = slide.getAttribute('data-location-id');
      console.log('Location ID:', locationId);

      if (locationId && window.viewerPanorama) {
        const location = locations.find((loc) => loc.id === locationId);
        console.log('Found location:', location);

        if (location) {
          // Prefer second option if available, otherwise first option
    const defaultOption = location.options.find((opt) => opt.id === location.defaultOption) || 
      (location.options.length > 1 ? location.options[1] : location.options[0]);
          console.log('Setting panorama to:', defaultOption.panorama.image);
          window.viewerPanorama.setPanorama(defaultOption.panorama.image);

          // Update option buttons for this location
          updateOptionButtons(locationId);
        }
      }
    });
  });

  console.log('Added click listeners to', swiper.slides.length, 'slides');

  // Add click event listeners to option buttons
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.hasAttribute('data-option-id')) {
      e.stopPropagation(); // Prevent slide click

      const locationId = target.getAttribute('data-location-id');
      const optionId = target.getAttribute('data-option-id');

      if (locationId && optionId && window.viewerPanorama) {
        const location = locations.find((loc) => loc.id === locationId);
        if (location) {
          const option = location.options.find((opt) => opt.id === optionId);
          if (option) {
            window.viewerPanorama.setPanorama(option.panorama.image);

            // Update option buttons with the clicked option as active
            updateOptionButtons(locationId, optionId);
          }
        }
      }
    }
  });

  window.viewerPanorama.viewer.container.addEventListener('panorama-changed', ({ detail }) => {
    const { panorama } = detail;

    // Find which location contains this panorama
    let targetLocationId = null;
    let targetOptionId = null;
    for (const location of locations) {
      const option = location.options.find((opt) => opt.panorama.image === panorama.image);
      if (option) {
        targetLocationId = location.id;
        targetOptionId = option.id;
        break;
      }
    }

    if (targetLocationId) {
      // Update active slide
      swiper.slides.forEach((slide) => {
        slide.classList.remove('active');
        if (slide.getAttribute('data-location-id') === targetLocationId) {
          slide.classList.add('active');
        }
      });

      // Find and update the slide
      const targetSlideIndex = locations.findIndex((loc) => loc.id === targetLocationId);
      if (targetSlideIndex !== -1) {
        swiper.slideTo(targetSlideIndex);
      }

      // Update option buttons for this location with the correct active option
      updateOptionButtons(targetLocationId, targetOptionId || undefined);
    }
  });
};

export const destroyViewerPanorama = () => {
  if (window.viewerPanorama) {
    const parent = window.viewerPanorama.viewer.container.parentElement!;
    window.viewerPanorama.viewer.destroy();
    parent.innerHTML = '';
    window.viewerPanorama = undefined;
  }
};

export default () => {
  onClickPreviewPanorama();
};
