import { PanoramaDataType } from './panorama.type';

export const toolbarDebugHTML = () => {
  return `
  <div>
    <div id="btn_add_hotspot" class="btn_option_toolbar">
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
    </div>
    <div id="btn_original_perspective" class="btn_option_toolbar">
    <svg
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            width="20"
            height="20"
            x="0"
            y="0"
            viewBox="0 0 512.005 512.005"
            style="enable-background: new 0 0 512 512"
            xml:space="preserve"
            class=""
          >
            <g>
              <path
                d="M256.003 213.339c-23.531 0-42.667 19.136-42.667 42.667s19.136 42.667 42.667 42.667 42.667-19.136 42.667-42.667-19.137-42.667-42.667-42.667z"
                fill="#323232"
                opacity="1"
                data-original="#323232"
                class=""
              ></path>
              <path
                d="m504.173 239.493-95.445-78.08c-88.469-72.405-216.981-72.427-305.451 0l-95.445 78.08a21.35 21.35 0 0 0-7.829 16.512c0 6.4 2.88 12.459 7.829 16.512l96.491 78.955c43.925 35.947 97.813 53.909 151.68 53.909s107.755-17.963 151.68-53.909l96.491-78.955a21.35 21.35 0 0 0 7.829-16.512c0-6.4-2.88-12.458-7.83-16.512zm-248.17 101.846c-47.061 0-85.333-38.272-85.333-85.333s38.272-85.333 85.333-85.333 85.333 38.272 85.333 85.333-38.272 85.333-85.333 85.333zM213.336 85.339a21.277 21.277 0 0 0 15.083-6.251l27.584-27.584 27.584 27.584a21.275 21.275 0 0 0 15.083 6.251 21.277 21.277 0 0 0 15.083-6.251c8.341-8.341 8.341-21.824 0-30.165L271.085 6.256c-8.341-8.341-21.824-8.341-30.165 0l-42.667 42.667c-8.341 8.341-8.341 21.824 0 30.165a21.277 21.277 0 0 0 15.083 6.251zM283.587 432.923l-27.584 27.584-27.584-27.584c-8.341-8.341-21.824-8.341-30.165 0s-8.341 21.824 0 30.165l42.667 42.667a21.275 21.275 0 0 0 15.083 6.251 21.277 21.277 0 0 0 15.083-6.251l42.667-42.667c8.341-8.341 8.341-21.824 0-30.165s-21.826-8.342-30.167 0z"
                fill="#323232"
                opacity="1"
                data-original="#323232"
                class=""
              ></path>
            </g>
          </svg>
  </div>
  </div>
  <div id="debug_info_option">Debug mode reserved for development teams</div>
  <div>
    <div id="btn_export_data_panorama" class="btn_option_toolbar">Export Data</div>
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

export const formAddHotSpot = (panoramas: PanoramaDataType[]) => {
  return `
  <div class="form">
    <div>
      <label for="title">To panorama: </label>
      <select name="select-panorama" id="select-panorama">
        ${panoramas.map((panorama) => {
          return `<option value="${panorama.id}">${panorama.title}</option>`;
        })}
      </select>
    </div>


    <div>
      <button type="button" id="submit-new-hotspot">Add</button>
      <button type="button" id="cancel-new-hotspot">Cancel</button>
    </div>
  </div>
`;
};
