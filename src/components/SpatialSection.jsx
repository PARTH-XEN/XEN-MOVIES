import React from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function SpatialSection({ children, className = '', delay = 0 }) {
  const [ref, isVisible] = useScrollReveal({
    threshold: 0.08,
    rootMargin: '0px 0px -50px 0px',
    once: true
  });

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${delay}ms`
      }}
      className={`scroll-reveal ${isVisible ? 'in-view' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

