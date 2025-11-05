import { PanoramaLocationType } from '../../panorama.type';

export const btnAddHotSpotHtml = () => {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <g clip-path="url(#clip0_17_18035)">
      <path
        d="M19 1C19.55 1 20 1.45 20 2V4H22C22.55 4 23 4.45 23 5C23 5.55 22.55 6 22 6H20V8C20 8.55 19.55 9 19 9C18.45 9 18 8.55 18 8V6H16C15.45 6 15 5.55 15 5C15 4.45 15.45 4 16 4H18V2C18 1.45 18.45 1 19 1ZM12 13C13.1 13 14 12.1 14 11C14 9.9 13.1 9 12 9C10.9 9 10 9.9 10 11C10 12.1 10.9 13 12 13ZM14.72 3.47C14.28 3.83 14 4.38 14 5C14 6.1 14.9 7 16 7H17V8C17 9.1 17.9 10 19 10C19.32 10 19.62 9.92 19.89 9.79C19.96 10.24 20 10.71 20 11.2C20 14.38 17.55 18.12 12.66 22.43C12.28 22.76 11.71 22.76 11.33 22.43C6.45 18.12 4 14.38 4 11.2C4 6.22 7.8 3 12 3C12.94 3 13.86 3.16 14.72 3.47Z"
        fill="#323232"
      />
    </g>
    <defs>
      <clipPath id="clip0_17_18035">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
`;
};

export const formAddHotSpot = (locations: PanoramaLocationType[]) => {
  return `
  <div class="form">
    <div class="flex gap-2 items-center">
      <label for="title">To location: </label>
      <select name="select-panorama" id="select-panorama" id="countries" class="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
        ${locations.map((location) => {
          return `<option value="${location.id}">${location.name}</option>`;
        })}
      </select>
    </div>
    <div>
      <button id="submit-new-hotspot" type="button" class="w-[80px] flex justify-center items-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
        Add
      </button>
      <button id="cancel-new-hotspot" type="button" class="w-[80px] flex justify-center items-center text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">
        Cancel
      </button>
    </div>
  </div>
`;
};

export const btnHotSpot = (onClick: string, label?: string, _style?: any) => {
  return `<div class="hotspot arrow"  onclick="${onClick}">
  <div class="hotspot-arrow" data-animation-path="animation/" data-anim-loop="true" ></div>
  <div class="title-marker">
    <div class="hotspot-label">
      <div>
        <c-t16>${label}</c-t16>
      </div>
    </div>
  </div>
</div>`;
};
