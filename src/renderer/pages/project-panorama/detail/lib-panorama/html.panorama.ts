export const closeToolbarDebugHTML = () => {
  return `<button id="btn_close_modal_preview" type="button" class="fixed top-2 right-2 bg-gray-200 hover:bg-gray-50 text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="modal_map_location">
  <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
  </svg>
  <span class="sr-only">Close Preview</span>
</button>`;
};

export const miniMapHTML = (src: string) => {
  return `
  <div class="relative">
    <img src="${src}" alt="Mini Map" class="w-full h-auto" />
  </div>
`;
};

export const markerMiniMapLocationHTML = (isActive: boolean = true) => {
  return `
        <div class="${isActive ? 'isActive' : ''} group relative ">
          <svg width="80" height="80" style="left: -1px; top: -1px;" class="opacity-0 pointer-events-none group-[&.isActive]:opacity-100 group-[&.isActive]:pointer-events-auto group-[&.isActive]:cursor-grab">
            <path data-previous-radian="0" stroke="rgb(252,89,56)" stroke-width="0" stroke-opacity="0.3" fill="rgb(252,89,56)" fill-opacity="0.5" d="M 39.7725,39.7725 L 60.28417779204103,6.943418249282229 A 38.55,38.55 0 0 1 60.28417779204103,71.60158175071777 Z" style="pointer-events: none; cursor: pointer; transform: scale(1, 1);"></path>
          </svg>
          <div id="point_marker_location_mini_map" class="absolute cursor-pointer bg-red-500 w-4 h-4 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-auto group-[&.isActive]:hover:bg-green-500"></div>
          <div class="absolute bg-white w-2 h-2 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"></div>
        </div>
     `;
};
