import { useEffect } from 'react';

export const useEventListener = (
  eventName: string, 
  handler: (e: Event) => void, 
  element: any
) => {
  useEffect(() => {
    const isSupported = element && element.addEventListener;
    if (!isSupported) return;

    element.addEventListener(eventName, handler);

    return () => {
      element.removeEventListener(eventName, handler);
    };
  }, [eventName, handler, element]);
}