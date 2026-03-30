import { useEffect, useRef } from 'react';

/**
 * Closes a dropdown/popover when clicking outside the referenced element.
 * Returns a ref to attach to the container element.
 */
export function useClickOutside<T extends HTMLElement>(
  isOpen: boolean,
  onClose: () => void,
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [isOpen, onClose]);

  return ref;
}
