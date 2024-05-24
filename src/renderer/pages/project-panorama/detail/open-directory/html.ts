export const itemImagePanorama = (id: number, src: string, name: string, metadata: any) => {
  return ` <div
  class="flex flex-col items-center justify-between bg-white border border-gray-200 rounded-lg shadow md:flex-row  hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
>
  <div class="flex">
    <img
      class="object-cover w-full rounded-t-lg h-96 md:h-auto md:w-48 md:rounded-none md:rounded-s-lg"
      src="${src}"
      alt=""
    />
    <div class="flex flex-col justify-between p-4 leading-normal">
      <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        ${name}
      </h5>
      <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">
        ${metadata.width} x ${metadata.height} px
      </p>
    </div>
  </div>
  <div class="p-4">
    <button onclick="onRemovePanorama(${id})" type="button" class="text-red-700 border border-red-700 hover:bg-red-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:focus:ring-red-800 dark:hover:bg-red-500">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6H19C19.5523 6 20 6.44772 20 7C20 7.55228 19.5523 8 19 8V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V8C4.44772 8 4 7.55228 4 7C4 6.44772 4.44772 6 5 6H8V4C8 3.46957 8.21071 2.96086 8.58579 2.58579ZM10 6H14V4H10V6ZM11 10C11 9.44772 10.5523 9 10 9C9.44772 9 9 9.44772 9 10V18C9 18.5523 9.44772 19 10 19C10.5523 19 11 18.5523 11 18V10ZM15 10C15 9.44772 14.5523 9 14 9C13.4477 9 13 9.44772 13 10V18C13 18.5523 13.4477 19 14 19C14.5523 19 15 18.5523 15 18V10Z" />
      </svg>
      <span class="sr-only">Icon description</span>
    </button>
  </div>
</div>`;
};
