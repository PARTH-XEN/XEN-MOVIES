import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Play, Download, Bookmark, Info, ChevronLeft, ChevronRight, Star } from 'lucide-react';

export default function HeroBanner({ items = [] }) {
  const { openStream, openDownload, openDetails, handleToggleWatchlist, isInWatchlist } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto rotate banner every 7 seconds
  useEffect(() => {
    if (!items || items.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [items]);

  if (!items || items.length === 0) return null;

  const current = items[currentIndex] || items[0];
  const inWatchlist = isInWatchlist(current.id);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  // Construct backdrop url
  const backdropUrl = current.background || current.poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1400&q=80';

  return (
    <div className="relative w-full h-[480px] sm:h-[540px] rounded-3xl overflow-hidden shadow-2xl border border-purple-500/20 group select-none">
      
      {/* Background Image with Vignette & Gradients */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105 group-hover:scale-100"
        style={{ backgroundImage: `url(${backdropUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080d] via-[#07080d]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07080d] via-[#07080d]/80 to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-10 max-w-3xl space-y-4">
        
        {/* Badges: Type, Rating, Year */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/30 text-purple-300 border border-purple-500/40">
            {current.type === 'series' ? 'TV Series' : 'Blockbuster Movie'}
          </span>
          {current.imdbRating && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{current.imdbRating}</span>
            </span>
          )}
          {current.year && (
            <span className="text-xs text-slate-300 font-medium px-2 py-0.5 rounded bg-slate-800/80">
              {current.year}
            </span>
          )}
          {current.genres && Array.isArray(current.genres) && (
            <div className="flex items-center gap-1.5 hidden sm:flex">
              {current.genres.slice(0, 3).map((g) => (
                <span key={g} className="text-xs text-slate-400 font-medium">
                  • {g}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
          {current.name}
        </h1>

        {/* Overview Synopsis */}
        <p className="text-sm sm:text-base text-slate-300 line-clamp-2 max-w-2xl leading-relaxed drop-shadow">
          {current.description || 'Watch and download in ultra-high definition 4K, 1080p, and 720p with multi-audio and high-speed cloud mirrors.'}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2 flex-wrap">
          <button
            onClick={() => openStream(current)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-105 transition-all duration-300"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Stream Now</span>
          </button>

          <button
            onClick={() => openDownload(current)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#131728]/90 hover:bg-[#1a2038] border border-cyan-500/40 text-cyan-300 hover:text-cyan-200 font-semibold text-sm hover:scale-105 transition-all duration-300 shadow-lg shadow-cyan-950/40"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Download (4K / 1080p)</span>
          </button>

          <button
            onClick={() => handleToggleWatchlist(current)}
            className={`p-3 rounded-2xl border transition-all ${
              inWatchlist
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'bg-[#131728]/80 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
          >
            <Bookmark className={`w-4 h-4 ${inWatchlist ? 'fill-white' : ''}`} />
          </button>

          <button
            onClick={() => openDetails(current)}
            className="p-3 rounded-2xl bg-[#131728]/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all"
            title="Overview & Episodes"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Carousel Navigation Arrows */}
      <div className="absolute right-6 bottom-8 z-20 flex items-center gap-2">
        <button
          onClick={prevSlide}
          className="p-2.5 rounded-full bg-slate-900/80 hover:bg-purple-600 text-white border border-slate-700 transition-colors backdrop-blur-md"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={nextSlide}
          className="p-2.5 rounded-full bg-slate-900/80 hover:bg-purple-600 text-white border border-slate-700 transition-colors backdrop-blur-md"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Carousel Dots */}
      <div className="absolute left-10 bottom-3 z-20 flex items-center gap-1.5">
        {items.map((_, idx) => (
          <div
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              idx === currentIndex ? 'w-6 bg-purple-500' : 'w-1.5 bg-slate-600 hover:bg-slate-400'
            }`}
          />
        ))}
      </div>

    </div>
  );
}

