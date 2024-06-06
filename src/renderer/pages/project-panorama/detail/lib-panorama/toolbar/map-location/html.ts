export const btnMapHTML = () => {
  return `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="20" height="20" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M256 0C166.035 0 91 72.47 91 165c0 35.202 10.578 66.592 30.879 96.006l121.494 189.58c5.894 9.216 19.372 9.198 25.254 0l122.021-190.225C410.512 232.28 421 199.307 421 165 421 74.019 346.981 0 256 0zm0 240c-41.353 0-75-33.647-75-75s33.647-75 75-75 75 33.647 75 75-33.647 75-75 75z" fill="#323232" opacity="1" data-original="#323232" class=""></path><path d="m373.264 344.695-75.531 118.087c-19.551 30.482-64.024 30.382-83.481.029l-75.654-118.085C72.034 360.116 31 388.309 31 422c0 58.462 115.928 90 225 90s225-31.538 225-90c0-33.715-41.091-61.923-107.736-77.305z" fill="#323232" opacity="1" data-original="#323232" class=""></path></g></svg>`;
};

export const modalMapLocationHTML = () => {
  return `<div id="modal_map_location" data-modal-backdrop="static" tabindex="-1" class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 bottom-0 z-50 justify-center items-center w-full md:inset-0 h-full">
  <div class="relative p-4 w-full h-full">
      <!-- Modal content -->
      <div class="relative bg-white rounded-lg shadow dark:bg-gray-700 h-full flex flex-col">
          <!-- Modal header -->
          <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
              <div id="btn_group_map_location" class="inline-flex rounded-md shadow-sm" role="group">
                <button data-type="mini-map" type="button" class="isActive px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-100 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white [&.isActive]:bg-blue-100 ">
                  Mini Map
                </button>
                <button data-type="main-map" type="button" class="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-100 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white [&.isActive]:bg-blue-100">
                  Main Map
                </button>
              </div>
              <button type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="modal_map_location">
                  <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                  </svg>
                  <span class="sr-only">Close modal</span>
              </button>
          </div>
          <!-- Modal body -->
          <div class="p-4 md:p-5 space-y-4 flex-1" id="modal_body_map_location">

          </div>
          <!-- Modal footer -->
          <div class="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
              <button data-modal-hide="modal_map_location" type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">I accept</button>
              <button data-modal-hide="modal_map_location" type="button" class="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Decline</button>
          </div>
      </div>
  </div>
</div>`;
};

export const bodyMapMiniHTML = () => {
  return `
<div class="flex flex-col h-full w-full">
   <div class="swiper w-full max-h-[200px]">
      <div class="swiper-wrapper">
      </div>
  </div>
  <div class="mt-4 flex-1 flex justify-center items-center rounded-lgw-full" id="image_map_location_container">
      <div class="relative">
        <img class="h-auto max-w-full rounded-lg" src="https://flowbite.s3.amazonaws.com/docs/gallery/featured/image.jpg" alt=""  draggable="false">
      </div>
    </div>
</div>
  `;
};

export const bodyMapMainHTML = () => {
  return ` <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                  2313 123 123 123 123213ion enacts new consumer privacy laws for its citizens, companies around the world are updating their terms of service agreements to comply.
              </p>
              <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                  The European Union’s General Data Protection Regulation (G.D.P.R.) goes into effect on May 25 and is meant to ensure a common set of data rights in the European Union. It requires organizations to notify users as soon as possible of high-risk data breaches that could personally affect them.
              </p>`;
};

export const itemMapMiniHTML = () => {
  return `
<div class="swiper-slide cursor-pointer">
  <div>
    <img class="h-auto max-w-[200px] rounded-lg" src="https://flowbite.s3.amazonaws.com/docs/gallery/square/image.jpg" alt="" draggable="false">
  </div>
</div>`;
};

export const markerLocationHTML = (x: number, y: number) => {
  return `
        <div class="marker_location_map isActive group relative border-2 border-transparent [&.isActive]:border-red-100 border-dashed  pointer-events-none [&.isActive]:pointer-events-auto">
          <svg width="80" height="80" style="left: -1px; top: -1px;" class="opacity-0 pointer-events-none group-[&.isActive]:opacity-100 group-[&.isActive]:pointer-events-auto group-[&.isActive]:cursor-grab">
            <path data-previous-radian="0" stroke="rgb(252,89,56)" stroke-width="2" stroke-opacity="1" d="M 39.7725,39.7725 L 60.28417779204103,6.943418249282229 A 38.55,38.55 0 0 1 60.28417779204103,71.60158175071777 Z" style="pointer-events: none; cursor: pointer; transform: scale(1, 1);"></path>
          </svg>
          <div onclick="clickMarkerLocation(this)" class="absolute cursor-pointer bg-red-500 w-4 h-4 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-auto"></div>
          <div class="absolute bg-white w-2 h-2 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"></div>
          <div onclick="removeMarkerLocationHTML(this)" class="absolute bg-white text-red-500 cursor-pointer w-4 h-4 top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full hover:bg-red-500 hover:text-white flex justify-center items-center opacity-0 pointer-events-none group-[&.isActive]:opacity-100 group-[&.isActive]:pointer-events-auto">x</div>
        </div>
     `;
};
