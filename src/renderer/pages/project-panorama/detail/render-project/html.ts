export const itemRadioTileSize = (size: number, index: number, device: 'pc' | 'tablet' | 'mobile', totalOptions: number) => {
  // If more than 2 options, prefer second option (index 1), otherwise first option (index 0)
  const defaultIndex = totalOptions > 2 ? 1 : 0;
  const isChecked = index === defaultIndex;
  
  return ` <div class="col-span-2 flex items-center">
                <input
                 ${isChecked ? 'checked' : ''}
                  id="item_size_radio_${device}_${index + 1}"
                  type="radio"
                  value="${size}"
                  name="item_size_radio_${device}"
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label for="item_size_radio_${device}_${index + 1}" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">${size}px</label>
              </div>`;
};

export const deviceTileSizeSection = (device: 'pc' | 'tablet' | 'mobile', tileSizes: number[], width: number, height: number) => {
  const deviceName = device === 'pc' ? 'PC' : device === 'tablet' ? 'Tablet' : 'Mobile';
  const deviceIcon = device === 'pc' ? '💻' : device === 'tablet' ? '📱' : '📱';
  
  return `
    <div class="device-tile-section mb-6" data-device="${device}">
      <div class="flex items-center gap-2 mb-3">
        <span class="text-2xl">${deviceIcon}</span>
        <h4 class="text-lg font-semibold text-gray-900 dark:text-white">${deviceName}</h4>
        <span class="text-sm text-gray-500 dark:text-gray-400">(${width}x${height}px)</span>
      </div>
      <div class="grid gap-4 grid-cols-2">
        ${tileSizes
          .sort((a, b) => a - b)
          .map((size, index) => itemRadioTileSize(size, index, device, tileSizes.length))
          .join('')}
      </div>
    </div>
  `;
};
