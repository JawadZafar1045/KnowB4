import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

let activePortals = 0;
let originalBodyOverflow = '';

export default function ModalPortal({ children }) {
  useEffect(() => {
    if (activePortals === 0) {
      originalBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    activePortals += 1;

    return () => {
      activePortals -= 1;
      if (activePortals === 0) {
        document.body.style.overflow = originalBodyOverflow;
      }
    };
  }, []);

  return createPortal(children, document.body);
}
