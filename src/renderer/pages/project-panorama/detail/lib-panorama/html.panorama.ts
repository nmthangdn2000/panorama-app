export const closeToolbarDebugHTML = () => {
  return `<button id="btn_close_modal_preview" type="button" class="fixed top-2 right-2 bg-gray-200 hover:bg-gray-50 text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="modal_map_location">
  <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
  </svg>
  <span class="sr-only">Close Preview</span>
</button>`;
};
