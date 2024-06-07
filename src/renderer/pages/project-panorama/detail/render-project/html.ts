export const itemRadioTileSize = (size: number, index: number) => {
  return ` <div class="col-span-2 flex items-center">
                <input
                 ${index === 0 ? 'checked' : ''}
                  id="item_size_radio_${index + 1}"
                  type="radio"
                  value="${size}"
                  name="item_size_radio"
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label for="item_size_radio_${index + 1}" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">${size}</label>
              </div>`;
};
