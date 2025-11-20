import { useState, useEffect } from 'react';

/**
 * Hook để debounce giá trị
 * @param {any} value - Giá trị cần debounce
 * @param {number} delay - Thời gian delay (ms), mặc định 300ms
 * @returns {any} - Giá trị đã được debounce
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

