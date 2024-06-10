export const debounce = (func: () => void, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  timeoutId = setTimeout(() => {
    func();
  }, delay);
};
