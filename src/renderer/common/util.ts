let timeoutId: ReturnType<typeof setTimeout> | undefined;

export const debounce = (func: () => void, delay: number) => {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  timeoutId = setTimeout(() => {
    func();
  }, delay);

  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
};
