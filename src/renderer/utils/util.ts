/**
 * @description
 * This function is used to load the image background size and scale it to fit the screen size.
 * @param divImgElement - The div element that contains the image.
 * @returns A promise that resolves the scale of the image.
 * @example
 * loadImageBackground(divImgElement).then((scale) => {
 *  console.log(scale);
 * });
 * @example
 * const scale = await loadImageBackground(divImgElement);
 * console.log(scale);
 */
export const loadImageBackground = (divImgElement: HTMLElement, parentSize?: HTMLElement) => {
  return new Promise((resolve, reject) => {
    const img = divImgElement.querySelector('img') as HTMLImageElement;

    const handleLoadImage = () => {
      const imageSize = {
        width: img.naturalWidth,
        height: img.naturalHeight,
      };

      const screenSize = {
        width: parentSize ? parentSize.clientWidth : window.innerWidth,
        height: parentSize ? parentSize.clientHeight : window.innerHeight,
      };

      const roundedScaleWidth = screenSize.width / imageSize.width;
      const roundedScaleHeight = screenSize.height / imageSize.height;

      const scale = Math.min(roundedScaleWidth, roundedScaleHeight);

      img.style.width = `${imageSize.width * scale}px`;
      img.style.height = `${imageSize.height * scale}px`;

      divImgElement.style.width = img.style.width;
      divImgElement.style.height = img.style.height;

      resolve(screenSize.width / 1336 >= 1 ? 1 : screenSize.width / 1336 <= 0.6 ? 0.6 : screenSize.width / 1336);
    };

    if (img.complete) {
      return handleLoadImage();
    }

    img.onload = handleLoadImage;
    img.onerror = reject;
  });
};

/**
 * @description
 * This function is used to handle the movement of the background image.
 * @param element - The element that contains the background image.
 * @example
 * handleMoveBgMain(element);
 */
export const handleMoveBgMain = (element: HTMLElement) => {
  let _startX = 0;
  let _startY = 0;
  let _scrollTop = 0;
  let _scrollLeft = 0;

  element.onmousedown = OnMouseDown;
  element.onmouseup = OnMouseUp;
  element.onmouseout = OnMouseUp;

  element.ontouchend = OnTouchEnd;
  element.ontouchstart = OnTouchStart;

  function OnMouseDown(event: MouseEvent) {
    element.onmousemove = OnMouseMove;
    _startX = event.clientX;
    _startY = event.clientY;
    _scrollTop = element.scrollTop;
    _scrollLeft = element.scrollLeft;
  }

  function OnTouchStart(event: TouchEvent) {
    element.ontouchmove = OnTouchMove;
    _startX = event.touches[0].clientX;
    _startY = event.touches[0].clientY;
    _scrollTop = element.scrollTop;
    _scrollLeft = element.scrollLeft;
  }

  function OnMouseMove(event: MouseEvent) {
    element.scrollTo({
      left: _scrollLeft + (_startX - event.clientX),
      top: _scrollTop + (_startY - event.clientY),
    });
  }

  function OnTouchMove(event: TouchEvent) {
    element.scrollTo({
      left: _scrollLeft + (_startX - event.touches[0].clientX),
      top: _scrollTop + (_startY - event.touches[0].clientY),
    });
  }

  function OnMouseUp() {
    element.onmousemove = null;
  }

  function OnTouchEnd() {
    element.ontouchmove = null;
  }
};
