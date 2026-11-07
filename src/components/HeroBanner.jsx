import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { spatialAudio } from '../utils/spatialAudio';
import { triggerHaptic } from '../utils/haptics';
import { Play, Download, Bookmark, Info, ChevronLeft, ChevronRight, Star, Sparkles } from 'lucide-react';

export default function HeroBanner({ items = [] }) {
  const { openStream, openDownload, openDetails, handleToggleWatchlist, isInWatchlist, theme } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto rotate banner every 7.5 seconds
  useEffect(() => {
    if (!items || items.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 7500);
    return () => clearInterval(interval);
  }, [items]);

  if (!items || items.length === 0) return null;

  const current = items[currentIndex] || items[0];
  const inWatchlist = isInWatchlist(current.id);

  const prevSlide = () => {
    spatialAudio.playSlide();
    triggerHaptic('light');
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const nextSlide = () => {
    spatialAudio.playSlide();
    triggerHaptic('light');
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const backdropUrl = current.background || current.poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1400&q=80';

  return (
    <div className="relative w-full min-h-[350px] sm:min-h-[460px] lg:h-[520px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-neutral-950 border border-neutral-800/80 group select-none transition-all duration-500">
      
      {/* Background Image with Cinematic Depth & Vignette */}
      <div 
        key={current.id}
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105 group-hover:scale-100 animate-in fade-in zoom-in-95"
        style={{ backgroundImage: `url(${backdropUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080d] via-[#07080d]/75 to-transparent sm:via-[#07080d]/65" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07080d] via-[#07080d]/85 to-transparent hidden sm:block" />
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/20 via-transparent to-cyan-900/20 mix-blend-color-dodge pointer-events-none" />
      </div>

      {/* Floating Spatial Navigation Arrows (Desktop & TV) */}
      <div className="absolute top-3 sm:top-5 right-3 sm:right-6 z-20 flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={prevSlide}
          data-tv-focus="true"
          tabIndex={0}
          onMouseEnter={() => spatialAudio.playHover(-0.5)}
          className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-black/50 hover:bg-purple-600/30 backdrop-blur-xl border border-white/10 hover:border-purple-500/50 flex items-center justify-center text-white/80 hover:text-white transition-all duration-300 shadow-lg cursor-pointer hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          title="Previous Title"
        >
          <ChevronLeft className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
        </button>
        <button
          onClick={nextSlide}
          data-tv-focus="true"
          tabIndex={0}
          onMouseEnter={() => spatialAudio.playHover(0.5)}
          className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-black/50 hover:bg-purple-600/30 backdrop-blur-xl border border-white/10 hover:border-purple-500/50 flex items-center justify-center text-white/80 hover:text-white transition-all duration-300 shadow-lg cursor-pointer hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          title="Next Title"
        >
          <ChevronRight className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Content Container with Spatial Layering */}
      <div className="relative z-10 h-full flex flex-col justify-end p-4 sm:p-8 lg:p-12 max-w-3xl space-y-2.5 sm:space-y-4">
        
        {/* Badges: Type, Rating, Year, 4K UHD */}
        <div className="flex items-center gap-2 flex-wrap">
          {theme === 'netflix' ? (
            <span className="px-3 py-1 rounded text-xs font-black bg-red-600 text-white tracking-widest uppercase">
              NETFLIX ORIGINAL
            </span>
          ) : theme === 'cyberpunk' ? (
            <span className="px-3 py-1 text-xs font-bold hud-badge font-mono tracking-widest uppercase">
              SYS_OVERRIDE // 4K
            </span>
          ) : theme === 'nordic' ? (
            <span className="px-3 py-1 rounded-md text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700">
              CINEMATIC ZEN
            </span>
          ) : theme === 'synthwave' ? (
            <span className="px-3 py-1 rounded-full text-[10px] arcade-font bg-pink-500/20 text-pink-300 border border-pink-400/50">
              STAGE 1 • 4K
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 glass-pill">
              FEATURED BLOCKBUSTER
            </span>
          )}

          {current.imdbRating && (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-neutral-900/90 text-amber-400 border border-neutral-700/80">
              <span>★</span>
              <span>{current.imdbRating}</span>
            </span>
          )}

          {current.year && (
            <span className="text-xs text-neutral-300 font-medium px-2 py-0.5 rounded-md bg-neutral-900/90 border border-neutral-700/80 font-mono">
              {current.year}
            </span>
          )}

          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wider uppercase bg-neutral-900/90 text-neutral-300 border border-neutral-700/80 font-mono">
            4K UHD
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-lg line-clamp-2 uppercase">
          {current.name}
        </h1>

        {/* Overview Synopsis */}
        <p className="text-xs sm:text-sm text-neutral-300 line-clamp-2 max-w-xl leading-relaxed">
          {current.description || 'Watch and download in ultra-high definition 4K, 1080p, and 720p with multi-audio, Cloudstream mirrors, and high-speed direct downloads.'}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 pt-1 flex-wrap">
          <button
            onClick={() => {
              spatialAudio.playOpen();
              triggerHaptic('medium');
              openStream(current);
            }}
            data-tv-focus="true"
            tabIndex={0}
            onMouseEnter={() => spatialAudio.playHover(0)}
            className={`btn-primary flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold shadow-xl transition-all cursor-pointer hover:scale-105 active:scale-95 ${
              theme === 'cyberpunk'
                ? 'cyber-btn'
                : theme === 'synthwave'
                ? 'synth-btn'
                : theme === 'netflix'
                ? 'bg-red-600 hover:bg-red-700 text-white rounded'
                : theme === 'nordic'
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-indigo-500/30'
            }`}
          >
            <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
            <span className="uppercase tracking-wider">{theme === 'cyberpunk' ? 'SYS_PLAY' : 'STREAM NOW'}</span>
          </button>

          <button
            onClick={() => {
              spatialAudio.playOpen();
              triggerHaptic('light');
              openDownload(current);
            }}
            data-tv-focus="true"
            tabIndex={0}
            onMouseEnter={() => spatialAudio.playHover(0)}
            className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 hover:text-white font-medium text-xs sm:text-sm transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Downloads</span>
          </button>

          <button
            onClick={() => {
              spatialAudio.playClick();
              triggerHaptic('light');
              handleToggleWatchlist(current);
            }}
            data-tv-focus="true"
            tabIndex={0}
            onMouseEnter={() => spatialAudio.playHover(0)}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
              inWatchlist
                ? 'bg-neutral-800 border-neutral-600 text-amber-400'
                : 'bg-neutral-900/90 border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800'
            }`}
            title="Add to Watchlist"
          >
            <Bookmark className={`w-4 h-4 ${inWatchlist ? 'fill-amber-400' : ''}`} />
          </button>

          <button
            onClick={() => {
              spatialAudio.playClick();
              triggerHaptic('light');
              openDetails(current);
            }}
            data-tv-focus="true"
            tabIndex={0}
            onMouseEnter={() => spatialAudio.playHover(0)}
            className="p-2.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Details & Cast"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

        {/* Carousel Slide Indicators */}
        <div className="flex items-center gap-1.5 pt-1">
          {items.slice(0, 8).map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                spatialAudio.playSlide();
                triggerHaptic('light');
                setCurrentIndex(idx);
              }}
              className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === idx
                  ? 'w-5 sm:w-8 bg-[var(--color-accent)] shadow-md shadow-[var(--theme-shadow)]'
                  : 'w-1.5 sm:w-2 bg-white/20 hover:bg-white/40'
              }`}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
