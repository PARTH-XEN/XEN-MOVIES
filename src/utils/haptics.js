// Mobile Haptics & Vibration Utility for Android & iOS PWA
export function triggerHaptic(type = 'light') {
  if (typeof window === 'undefined' || !navigator.vibrate) return;

  try {
    switch (type) {
      case 'selection':
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(22);
        break;
      case 'heavy':
        navigator.vibrate(40);
        break;
      case 'success':
        navigator.vibrate([15, 60, 25]);
        break;
      case 'error':
        navigator.vibrate([30, 40, 30, 40, 30]);
        break;
      default:
        navigator.vibrate(15);
    }
  } catch {
    // Vibration ignored if blocked by user gestures
  }
}

