import React, { useEffect, useState } from 'react';

export default function SpatialBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Subtle interactive parallax based on mouse
  useEffect(() => {
    let animationFrameId;
    const handleMouseMove = (e) => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 30;
        const y = (e.clientY / window.innerHeight - 0.5) * 30;
        setMousePos({ x, y });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      
      {/* 3D Perspective Holographic Cyber Grid */}
      <div 
        className="absolute inset-0 opacity-[0.12] transition-transform duration-700 ease-out"
        style={{
          transform: `perspective(800px) rotateX(45deg) translate3d(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px, 0)`,
          transformOrigin: '50% 100%',
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'linear-gradient(to bottom, transparent 10%, rgba(0,0,0,1) 60%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 10%, rgba(0,0,0,1) 60%, transparent 100%)'
        }}
      />

      {/* Floating Spatial Ambient Light Orbs */}
      {/* Orb 1 - Primary Theme Glow */}
      <div
        className="absolute top-[-10%] left-[15%] w-[580px] h-[580px] rounded-full blur-[130px] opacity-35 animate-float-slow transition-colors duration-700"
        style={{
          backgroundColor: 'var(--theme-primary)',
          transform: `translate3d(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px, 0)`
        }}
      />

      {/* Orb 2 - Secondary Ambient Glow */}
      <div
        className="absolute top-[35%] right-[-5%] w-[640px] h-[640px] rounded-full blur-[140px] opacity-25 animate-float-delayed transition-colors duration-700"
        style={{
          backgroundColor: 'var(--theme-secondary)',
          transform: `translate3d(${-mousePos.x * 0.6}px, ${-mousePos.y * 0.6}px, 0)`
        }}
      />

      {/* Orb 3 - Deep Mystery Core at Bottom */}
      <div
        className="absolute bottom-[-15%] left-[30%] w-[520px] h-[520px] rounded-full blur-[130px] opacity-20 animate-pulse-glow transition-colors duration-700"
        style={{
          backgroundColor: 'var(--theme-accent)',
          transform: `translate3d(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px, 0)`
        }}
      />

      {/* Subtle Noise / Grain Overlay for Cinematic Texture */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-screen bg-repeat bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

      {/* Vignette Edge */}
      <div className="absolute inset-0 bg-radial-vignette pointer-events-none" />
    </div>
  );
}

