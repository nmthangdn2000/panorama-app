/**
 * Check if the given string is a base64 image.
 * @param str - The string to check.
 * @returns True if the string is a base64 image, false otherwise.
 * @example
 * isBase64Image('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAABpElEQVRIie2Vv0oDQRSG)
 * //=> true
 */
export const isBase64Image = (str: string) => {
  if (typeof str !== 'string') {
    return false;
  }
  // Base64 image regular expression
  const base64ImagePattern = /^data:image\/(png|jpeg|jpg|gif);base64,[A-Za-z0-9+/]+={0,2}$/;
  return base64ImagePattern.test(str);
};
