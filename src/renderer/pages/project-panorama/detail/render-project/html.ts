export const generateTilesCheckbox = () => `
  <div class="col-span-2">
    <label class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors select-none">
      <input
        id="checkbox_generate_tiles"
        type="checkbox"
        class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 shrink-0"
      />
      <span>
        <span class="block text-sm font-semibold text-gray-900 dark:text-white">Generate tiles</span>
        <span class="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">Cắt panorama thành cubemap tiles (cần thêm thời gian)</span>
      </span>
    </label>
  </div>
`;

export const itemRadioTileSize = (size: number, index: number, device: 'pc' | 'tablet' | 'mobile', totalOptions: number) => {
  const defaultIndex = totalOptions > 2 ? 1 : 0;
  const isChecked = index === defaultIndex;

  return `
    <label class="tile-size-option flex items-center justify-center px-3 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-colors
      ${isChecked
        ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-400'
        : 'border-gray-200 bg-white text-gray-700 hover:border-blue-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-blue-500'}">
      <input
        ${isChecked ? 'checked' : ''}
        id="item_size_radio_${device}_${index + 1}"
        type="radio"
        value="${size}"
        name="item_size_radio_${device}"
        class="sr-only"
      />
      ${size}px
    </label>`;
};

export const deviceTileSizeSection = (device: 'pc' | 'tablet' | 'mobile', tileSizes: number[], width: number, height: number) => {
  const deviceName = device === 'pc' ? 'PC' : device === 'tablet' ? 'Tablet' : 'Mobile';
  const deviceIcon = device === 'pc'
    ? `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`
    : device === 'tablet'
    ? `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>`
    : `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>`;

  return `
    <div class="col-span-2" data-device="${device}">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-gray-600 dark:text-gray-400">${deviceIcon}</span>
        <span class="text-sm font-semibold text-gray-800 dark:text-white">${deviceName}</span>
        <span class="text-xs text-gray-400 dark:text-gray-500">${width}×${height}px</span>
      </div>
      <div class="flex flex-wrap gap-2">
        ${tileSizes
          .slice()
          .sort((a, b) => a - b)
          .map((size, index) => itemRadioTileSize(size, index, device, tileSizes.length))
          .join('')}
      </div>
    </div>
  `;
};
