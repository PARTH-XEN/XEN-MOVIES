import React, { useState, useEffect } from 'react';

export default function ScrollProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll <= 0) {
        setScrollProgress(0);
        return;
      }
      const currentScroll = window.scrollY || document.documentElement.scrollTop;
      const progress = Math.min(100, Math.max(0, (currentScroll / totalScroll) * 100));
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] z-50 pointer-events-none overflow-visible">
      {/* Background Track */}
      <div className="w-full h-full bg-white/[0.04]" />

      {/* Laser Gradient Fill */}
      <div
        className="h-full relative transition-all duration-75 ease-out"
        style={{
          width: `${scrollProgress}%`,
          background: 'linear-gradient(90deg, transparent 0%, var(--theme-secondary) 50%, var(--theme-primary) 100%)',
          boxShadow: '0 0 12px var(--theme-primary), 0 0 24px rgba(var(--theme-primary-rgb), 0.6)'
        }}
      >
        {/* Glowing Head Particle */}
        {scrollProgress > 1 && (
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full animate-ping opacity-75"
            style={{
              backgroundColor: 'var(--theme-primary)',
              boxShadow: '0 0 10px white, 0 0 20px var(--theme-primary)'
            }}
          />
        )}
      </div>
    </div>
  );
}

