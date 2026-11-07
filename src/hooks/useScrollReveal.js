import { useEffect, useRef, useState } from 'react';

/**
 * useScrollReveal - Detects when an element scrolls into viewport to trigger 3D spatial entry
 * @param {Object} options
 * @param {number} options.threshold - Viewport intersection threshold (default 0.12)
 * @param {string} options.rootMargin - Margin around the root (default '0px 0px -50px 0px')
 * @param {boolean} options.once - Trigger only once (default true)
 */
export function useScrollReveal(options = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -40px 0px',
    once = true
  } = options;

  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        if (once) {
          observer.unobserve(el);
        }
      } else if (!once) {
        setIsVisible(false);
      }
    }, {
      threshold,
      rootMargin
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return [ref, isVisible];
}

