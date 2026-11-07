import { useRef, useState, useCallback, useEffect } from 'react';

/**
 * useSpatialTilt - 60fps hardware-accelerated 3D tilt with specular reflection
 * @param {Object} options
 * @param {number} options.maxTilt - Maximum tilt angle in degrees (default 10)
 * @param {number} options.perspective - 3D perspective distance in px (default 1000)
 * @param {number} options.scale - Scale on hover (default 1.04)
 * @param {boolean} options.glare - Enable specular sheen overlay (default true)
 */
export function useSpatialTilt(options = {}) {
  const {
    maxTilt = 10,
    perspective = 1000,
    scale = 1.04,
    glare = true
  } = options;

  const cardRef = useRef(null);
  const [style, setStyle] = useState({
    transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
    transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
  });
  const [glareStyle, setGlareStyle] = useState({
    opacity: 0,
    transform: 'translate(-50%, -50%)',
    left: '50%',
    top: '50%'
  });
  const [isHovered, setIsHovered] = useState(false);

  // Check if spatial tilt is globally enabled in localStorage
  const isEnabled = () => {
    if (typeof window === 'undefined') return true;
    // On touch mobile devices, disable 3D mouse tilt to keep 120Hz smooth scrolling & crisp text
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) return false;
    const setting = localStorage.getItem('xen_spatial_tilt');
    return setting === null ? true : setting === 'true';
  };

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current || !isEnabled()) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = rect.width;
    const height = rect.height;

    const xPercent = (x / width) * 2 - 1; // -1 to 1
    const yPercent = (y / height) * 2 - 1; // -1 to 1

    const rotX = -yPercent * maxTilt;
    const rotY = xPercent * maxTilt;

    setStyle({
      transform: `perspective(${perspective}px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`,
      transition: 'transform 0.08s ease-out'
    });

    if (glare) {
      setGlareStyle({
        opacity: 0.35,
        left: `${(x / width) * 100}%`,
        top: `${(y / height) * 100}%`,
        transform: 'translate(-50%, -50%)',
        transition: 'opacity 0.2s ease-out'
      });
    }
  }, [maxTilt, perspective, scale, glare]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setStyle({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
    });
    if (glare) {
      setGlareStyle(prev => ({
        ...prev,
        opacity: 0,
        transition: 'opacity 0.4s ease-out'
      }));
    }
  }, [perspective, glare]);

  return {
    ref: cardRef,
    style,
    glareStyle,
    isHovered,
    bind: {
      onMouseMove: handleMouseMove,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave
    }
  };
}

