export const itemImagePanorama = (id: string, src: string, name: string, metadata: any, borderColor: string) => {
  const regex = /[\/\\]/;
  if (!regex.test(src)) src = `${window.pathProject}/panoramas/${src}`;

  return ` <div
  draggable="false"
  data-id="${id}"
  style="border-color: ${borderColor}"
  class="item_panorama flex flex-col items-center justify-between bg-white border border-gray-200 rounded-md shadow md:flex-row  hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
>
  <div class="flex">
    <img
      class="object-cover w-full rounded-t-md h-96 md:h-auto md:w-48 md:rounded-none md:rounded-s-md"
      src="${src}"
      alt=""
    />
    <div class="flex flex-col justify-between p-4 leading-normal">
      <div class="flex gap-2 justify-center items-center ">
        <h5 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          ${name}
        </h5>
        <button onclick="onEditTitlePanorama(this, '${id}')" title="Edit" type="button" class="text-gray-400 hover:text-white border border-gray-400 hover:bg-gray-500 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-md text-sm px-1 py-1 text-center dark:border-gray-200 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-200 dark:focus:ring-gray-300">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M13.9993 4.18177C14.7686 3.42506 15.8116 3 16.8991 3C17.9866 3 19.0296 3.42506 19.799 4.18177C20.5676 4.93912 21 5.96653 21 7.03713C21 8.10486 20.5705 9.12903 19.8057 9.8858L18.5002 11.2139L12.6998 5.50355L13.9872 4.1938L13.9993 4.18177ZM11.2826 6.94524L6.1861 12.1299L8.36073 14.2713L13.4239 9.05326L11.2826 6.94524ZM5.03244 13.8309L3.05229 19.6799C2.93029 20.0403 3.02557 20.4376 3.29843 20.7062C3.57129 20.9748 3.97488 21.0686 4.34097 20.9485L10.2823 18.9992L5.03244 13.8309ZM11.9866 17.8401L17.0831 12.6555L14.8651 10.472L9.80193 15.6901L11.9866 17.8401Z" fill="currentColor"/>
          </svg>
        </button>
      </div>
      <div class="flex gap-2 justify-center items-center hidden">
        <input value="${name}" type="text" id="input_title_panorama_${id}" class="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full py-1.5 px-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="John" required />
        <button  onclick="onSaveTitlePanorama('${id}')" title="Save" type="button" class="text-gray-400 hover:text-white border border-gray-400 hover:bg-gray-500 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-md text-sm px-1 py-1 text-center dark:border-gray-200 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-200 dark:focus:ring-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" >
            <g clip-path="url(#clip0_17_17296)">
              <path d="M17.59 3.59C17.21 3.21 16.7 3 16.17 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V7.83C21 7.3 20.79 6.79 20.41 6.42L17.59 3.59ZM12 19C10.34 19 9 17.66 9 16C9 14.34 10.34 13 12 13C13.66 13 15 14.34 15 16C15 17.66 13.66 19 12 19ZM13 9H7C5.9 9 5 8.1 5 7C5 5.9 5.9 5 7 5H13C14.1 5 15 5.9 15 7C15 8.1 14.1 9 13 9Z" fill="currentColor"/>
            </g>
            <defs>
              <clipPath id="clip0_17_17296">
                <rect width="24" height="24" fill="white"/>
              </clipPath>
            </defs>
          </svg>
        </button>
      </div>
      <p class="font-normal text-gray-700 dark:text-gray-400">
        ${metadata.width} x ${metadata.height} px
      </p>
    </div>
  </div>
  <div class="flex p-4 items-center gap-4">
    <button onclick="onRemovePanorama('${id}')" type="button" class="text-red-700 border border-red-700 hover:bg-red-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-md text-sm p-2.5 text-center inline-flex items-center dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:focus:ring-red-800 dark:hover:bg-red-500">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6H19C19.5523 6 20 6.44772 20 7C20 7.55228 19.5523 8 19 8V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V8C4.44772 8 4 7.55228 4 7C4 6.44772 4.44772 6 5 6H8V4C8 3.46957 8.21071 2.96086 8.58579 2.58579ZM10 6H14V4H10V6ZM11 10C11 9.44772 10.5523 9 10 9C9.44772 9 9 9.44772 9 10V18C9 18.5523 9.44772 19 10 19C10.5523 19 11 18.5523 11 18V10ZM15 10C15 9.44772 14.5523 9 14 9C13.4477 9 13 9.44772 13 10V18C13 18.5523 13.4477 19 14 19C14.5523 19 15 18.5523 15 18V10Z" />
      </svg>
      <span class="sr-only">Icon description</span>
    </button>
    <div class="grab_item_image_panorama cursor-grab">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_11_1464)">
          <path d="M11 18C11 19.1 10.1 20 9 20C7.9 20 7 19.1 7 18C7 16.9 7.9 16 9 16C10.1 16 11 16.9 11 18ZM9 10C7.9 10 7 10.9 7 12C7 13.1 7.9 14 9 14C10.1 14 11 13.1 11 12C11 10.9 10.1 10 9 10ZM9 4C7.9 4 7 4.9 7 6C7 7.1 7.9 8 9 8C10.1 8 11 7.1 11 6C11 4.9 10.1 4 9 4ZM15 8C16.1 8 17 7.1 17 6C17 4.9 16.1 4 15 4C13.9 4 13 4.9 13 6C13 7.1 13.9 8 15 8ZM15 10C13.9 10 13 10.9 13 12C13 13.1 13.9 14 15 14C16.1 14 17 13.1 17 12C17 10.9 16.1 10 15 10ZM15 16C13.9 16 13 16.9 13 18C13 19.1 13.9 20 15 20C16.1 20 17 19.1 17 18C17 16.9 16.1 16 15 16Z" fill="#323232"/>
        </g>
        <defs>
        <clipPath id="clip0_11_1464">
          <rect width="24" height="24" fill="white"/>
        </clipPath>
        </defs>
      </svg>
    </div>
  </div>
</div>`;
};
