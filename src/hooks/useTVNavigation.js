import { useEffect, useState } from 'react';
import { spatialAudio } from '../utils/spatialAudio';
import { triggerHaptic } from '../utils/haptics';

// Detect if running on an authentic Smart TV browser or living room console
export function isTVDevice() {
  if (typeof window === 'undefined') return false;
  // Mobile or tablet screens must NEVER be detected as Smart TV
  if (window.innerWidth < 1024) return false;
  if ('ontouchstart' in window && window.innerWidth < 1024) return false;

  const ua = navigator.userAgent || '';
  const tvRegex = /SmartTV|GoogleTV|AppleTV|HbbTV|NetCast|Tizen|WebOS|Android.*TV|BRAVIA|Roku|CrKey|Xbox|PlayStation/i;
  return tvRegex.test(ua);
}

/**
 * useTVNavigation - Spatial 2D Grid navigation for Smart TV Remotes (D-Pad)
 */
export function useTVNavigation() {
  const [isTV, setIsTV] = useState(false);
  const [tvModeActive, setTvModeActive] = useState(false);

  useEffect(() => {
    // If on a phone or small device, ensure tv-mode is completely disabled
    if (window.innerWidth < 1024) {
      document.documentElement.classList.remove('tv-mode');
      setTvModeActive(false);
      return;
    }

    const detected = isTVDevice();
    setIsTV(detected);
    const saved = localStorage.getItem('xen_tv_mode');
    if (saved !== null) {
      const active = saved === 'true';
      setTvModeActive(active);
      if (active) document.documentElement.classList.add('tv-mode');
    } else if (detected) {
      setTvModeActive(true);
      document.documentElement.classList.add('tv-mode');
    }
  }, []);

  const toggleTVMode = () => {
    const next = !tvModeActive;
    setTvModeActive(next);
    localStorage.setItem('xen_tv_mode', String(next));
    if (next) {
      document.documentElement.classList.add('tv-mode');
    } else {
      document.documentElement.classList.remove('tv-mode');
    }
    spatialAudio.playClick();
    triggerHaptic('medium');
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Smart TV Back keycodes: Samsung Tizen (10009), LG webOS (461), Escape (27)
      const isBackKey = 
        e.key === 'Escape' || 
        e.key === 'BrowserBack' || 
        e.key === 'GoBack' || 
        e.key === 'XF86Back' ||
        e.keyCode === 10009 ||
        e.keyCode === 461;

      if (isBackKey) {
        // If an active modal is open, let the modal close or dispatch custom event
        const closeBtn = document.querySelector('[data-modal-close="true"]');
        if (closeBtn) {
          e.preventDefault();
          closeBtn.click();
          spatialAudio.playClick();
          return;
        }
      }

      // Keys to intercept for D-Pad navigation
      const navKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      if (!navKeys.includes(e.key)) return;

      // Don't intercept if inside an input or textarea
      if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
        return;
      }

      // Collect all focusable elements marked for TV navigation
      const focusables = Array.from(document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex="0"], [data-tv-focus="true"]'
      )).filter(el => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          style.opacity !== '0' &&
          rect.width > 0 &&
          rect.height > 0 &&
          !el.hasAttribute('disabled')
        );
      });

      if (focusables.length === 0) return;

      const current = document.activeElement;
      let currentIndex = focusables.indexOf(current);

      if (currentIndex === -1) {
        // If nothing focused yet, focus the first visible card or button
        e.preventDefault();
        focusables[0].focus();
        spatialAudio.playHover(0);
        return;
      }

      const currentRect = current.getBoundingClientRect();
      const currentCenter = {
        x: currentRect.left + currentRect.width / 2,
        y: currentRect.top + currentRect.height / 2
      };

      let bestCandidate = null;
      let minDistance = Infinity;

      // 2D Spatial Distance Calculation in Direction of Arrow
      focusables.forEach((el, index) => {
        if (index === currentIndex) return;
        const rect = el.getBoundingClientRect();
        const center = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };

        const dx = center.x - currentCenter.x;
        const dy = center.y - currentCenter.y;

        let isValidDirection = false;
        let primaryDist = 0;
        let secondaryDist = 0;

        if (e.key === 'ArrowRight' && dx > 15) {
          isValidDirection = true;
          primaryDist = dx;
          secondaryDist = Math.abs(dy);
        } else if (e.key === 'ArrowLeft' && dx < -15) {
          isValidDirection = true;
          primaryDist = -dx;
          secondaryDist = Math.abs(dy);
        } else if (e.key === 'ArrowDown' && dy > 15) {
          isValidDirection = true;
          primaryDist = dy;
          secondaryDist = Math.abs(dx);
        } else if (e.key === 'ArrowUp' && dy < -15) {
          isValidDirection = true;
          primaryDist = -dy;
          secondaryDist = Math.abs(dx);
        }

        if (isValidDirection) {
          // Weighted score: favor elements straight ahead over perpendicular offset
          const score = primaryDist + secondaryDist * 2.2;
          if (score < minDistance) {
            minDistance = score;
            bestCandidate = el;
          }
        }
      });

      if (bestCandidate) {
        e.preventDefault();
        bestCandidate.focus();
        bestCandidate.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        spatialAudio.playHover(0);
        triggerHaptic('light');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { isTV, tvModeActive, toggleTVMode };
}

