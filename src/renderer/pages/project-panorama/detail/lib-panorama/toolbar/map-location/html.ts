export const btnMapHTML = () => {
  return `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="20" height="20" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M256 0C166.035 0 91 72.47 91 165c0 35.202 10.578 66.592 30.879 96.006l121.494 189.58c5.894 9.216 19.372 9.198 25.254 0l122.021-190.225C410.512 232.28 421 199.307 421 165 421 74.019 346.981 0 256 0zm0 240c-41.353 0-75-33.647-75-75s33.647-75 75-75 75 33.647 75 75-33.647 75-75 75z" fill="#323232" opacity="1" data-original="#323232" class=""></path><path d="m373.264 344.695-75.531 118.087c-19.551 30.482-64.024 30.382-83.481.029l-75.654-118.085C72.034 360.116 31 388.309 31 422c0 58.462 115.928 90 225 90s225-31.538 225-90c0-33.715-41.091-61.923-107.736-77.305z" fill="#323232" opacity="1" data-original="#323232" class=""></path></g></svg>`;
};

export const modalMapLocationHTML = () => {
  return `<div id="modal_map_location" data-modal-backdrop="static" tabindex="-1" class="hidden overflow-hidden fixed top-0 right-0 left-0 bottom-0 z-50 justify-center items-center w-full md:inset-0 h-full">
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
          <div class="p-4 md:p-5 space-y-4 flex-1 overflow-auto" id="modal_body_map_location">

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
<div class="flex flex-col h-full w-full items-center">
   <div class="flex gap-4 w-full">
      <div class="swiper map_swiper w-full max-h-[232px] flex-1 p-4">
        <div class="swiper-wrapper">
        </div>
      </div>
      <div>
        <div class="flex items-center justify-center w-full">
            <label for="input_mini_map" class="flex flex-col items-center justify-center w-[200px] h-[200px] border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload</span> </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">PNG, JPG </p>
                </div>
                <input id="input_mini_map" type="file" class="hidden" multiple/>
            </label>
        </div>
      </div>
   </div>
  <div class="mt-4 max-w-[80%] w-full flex-1 flex justify-center items-center rounded-lgw-full" id="image_map_location_container">
      <div class="relative">
        <img class="h-auto max-w-full rounded-lg" src="" alt=""  draggable="false">
      </div>
    </div>
</div>
  `;
};

export const bodyMapMainHTML = () => {
  return `
   <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                  2313 123 123 123 123213ion enacts new consumer privacy laws for its citizens, companies around the world are updating their terms of service agreements to comply.
              </p>
              <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                  The European Union’s General Data Protection Regulation (G.D.P.R.) goes into effect on May 25 and is meant to ensure a common set of data rights in the European Union. It requires organizations to notify users as soon as possible of high-risk data breaches that could personally affect them.
              </p>
`;
};

export const itemMapMiniHTML = (src: string) => {
  return `
<div class="swiper-slide cursor-pointer flex justify-center items-center">
  <div class="relative">
    <img class="w-auto max-h-[200px] rounded-lg" src="${src}" alt="" draggable="false"  onclick="onClickItemMapMini('${src}')" >
    <button onclick="removeItemMiniMap(this, '${src}')" type="button" class="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm p-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6H19C19.5523 6 20 6.44772 20 7C20 7.55228 19.5523 8 19 8V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V8C4.44772 8 4 7.55228 4 7C4 6.44772 4.44772 6 5 6H8V4C8 3.46957 8.21071 2.96086 8.58579 2.58579ZM10 6H14V4H10V6ZM11 10C11 9.44772 10.5523 9 10 9C9.44772 9 9 9.44772 9 10V18C9 18.5523 9.44772 19 10 19C10.5523 19 11 18.5523 11 18V10ZM15 10C15 9.44772 14.5523 9 14 9C13.4477 9 13 9.44772 13 10V18C13 18.5523 13.4477 19 14 19C14.5523 19 15 18.5523 15 18V10Z" />
      </svg>
    </button>
  </div>
</div>`;
};

export const markerLocationHTML = (isActive: boolean = true) => {
  return `
        <div class="marker_location_map ${isActive ? 'isActive' : ''} group relative border-2 border-transparent [&.isActive]:border-red-100 border-dashed  pointer-events-none [&.isActive]:pointer-events-auto">
          <svg width="80" height="80" style="left: -1px; top: -1px;" class="opacity-0 pointer-events-none group-[&.isActive]:opacity-100 group-[&.isActive]:pointer-events-auto group-[&.isActive]:cursor-grab">
            <path data-previous-radian="0" stroke="rgb(252,89,56)" stroke-width="2" stroke-opacity="1" d="M 39.7725,39.7725 L 60.28417779204103,6.943418249282229 A 38.55,38.55 0 0 1 60.28417779204103,71.60158175071777 Z" style="pointer-events: none; cursor: pointer; transform: scale(1, 1);"></path>
          </svg>
          <div onclick="clickMarkerLocation(this)" class="absolute cursor-pointer group-[&.isActive]:cursor-grab bg-red-500 w-4 h-4 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-auto group-[&.isActive]:hover:bg-green-500"></div>
          <div class="absolute bg-white w-2 h-2 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"></div>
          <div onclick="removeMarkerLocationHTML(this)" class="absolute bg-white text-red-500 cursor-pointer w-4 h-4 top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full hover:bg-red-500 hover:text-white flex justify-center items-center opacity-0 pointer-events-none group-[&.isActive]:opacity-100 group-[&.isActive]:pointer-events-auto">x</div>
        </div>
     `;
};

export const modalSelectPanoramaWithMapHTML = () => {
  const panoramas = window.panoramas;
  return `<div id="modal_select_panorama_with_map" tabindex="-1" class="hidden overflow-hidden fixed top-0 right-0 left-0 z-[51] justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
    <div class="relative p-4 w-full max-w-md max-h-full">
        <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <button type="button" class="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="modal_select_panorama_with_map">
                <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                </svg>
                <span class="sr-only">Close modal</span>
            </button>
            <div class="p-4 md:p-5 text-center ">
               <form class="flex flex-col gap-4" id="form_select_panorama_with_map">
                 <div class="flex flex-col justify-center items-center">
                      <label for="title">To panorama: </label>
                      <select name="select_panorama_with_map" id="countries" class="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                        ${panoramas.map((panorama) => {
                          return `<option value="${panorama.id}"> ${panorama.title}</option>`;
                        })}
                      </select>
                  </div>
                <div class="flex gap-4 justify-center items-center">
                        <button data-modal-hide="modal_select_panorama_with_map" type="submit" class="w-20 text-white bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center">
                      Add
                  </button>
                  <button data-modal-hide="modal_select_panorama_with_map" type="button" id="cancel_select_panorama_with_map" class="w-20 py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Cancel</button>
                </div>
               </form>
            </div>
        </div>
    </div>
</div>
`;
};
