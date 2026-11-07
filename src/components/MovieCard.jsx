import React from 'react';
import { useApp } from '../context/AppContext';
import { useSpatialTilt } from '../hooks/useSpatialTilt';
import { spatialAudio } from '../utils/spatialAudio';
import { triggerHaptic } from '../utils/haptics';
import { Play, Download, Bookmark, Star, Info } from 'lucide-react';

export default function MovieCard({ item, index = 0 }) {
  const { openStream, openDownload, openDetails, handleToggleWatchlist, isInWatchlist } = useApp();

  // 3D Spatial Tilt & Specular Glare Hook
  const { ref, style, glareStyle, isHovered, bind } = useSpatialTilt({
    maxTilt: 11,
    perspective: 1100,
    scale: 1.05,
    glare: true
  });

  if (!item) return null;

  const inWatchlist = isInWatchlist(item.id);
  const posterUrl = item.poster || 'https://images.metahub.space/poster/small/default.jpg';

  const handleMouseEnter = (e) => {
    bind.onMouseEnter(e);
    if (typeof window !== 'undefined') {
      const pan = (e.clientX / window.innerWidth) * 2 - 1;
      spatialAudio.playHover(pan);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      spatialAudio.playClick();
      triggerHaptic('medium');
      openDetails(item);
    }
  };

  return (
    <div
      ref={ref}
      tabIndex={0}
      data-tv-focus="true"
      style={style}
      {...bind}
      onMouseEnter={handleMouseEnter}
      onKeyDown={handleKeyDown}
      onClick={() => {
        spatialAudio.playClick();
        triggerHaptic('light');
        openDetails(item);
      }}
      className="group relative flex flex-col rounded-2xl overflow-hidden spatial-preserve-3d spatial-panel select-none cursor-pointer transition-all duration-300 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07080d] focus-visible:scale-105 sm:focus-visible:scale-108 focus-visible:z-30 focus-visible:shadow-2xl focus-visible:shadow-purple-500/50"
    >
      {/* Specular Glare Refraction Layer */}
      <div
        className="spatial-glare"
        style={glareStyle}
      />

      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950 spatial-preserve-3d">
        <img
          src={posterUrl}
          alt={item.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 sm:group-hover:scale-108 transition-transform duration-700 ease-out"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80';
          }}
        />

        {/* Ambient Vignette & Gradient Depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080d] via-transparent to-black/40 opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Floating Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-black/80 backdrop-blur-md text-neutral-300 border border-neutral-800">
            {item.type === 'series' ? 'TV' : '4K'}
          </span>

          {item.imdbRating && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-black/80 backdrop-blur-md text-amber-400 border border-neutral-800">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              <span>{item.imdbRating}</span>
            </span>
          )}
        </div>

        {/* Desktop Quick Action Overlay */}
        <div className="hidden sm:flex absolute inset-0 bg-neutral-950/85 backdrop-blur-sm opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-200 flex-col items-center justify-center gap-2 p-3.5">
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              spatialAudio.playOpen();
              triggerHaptic('medium');
              openStream(item);
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white text-neutral-950 hover:bg-neutral-200 font-semibold text-xs shadow-md cursor-pointer transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-neutral-950" />
            <span>Stream</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              spatialAudio.playOpen();
              triggerHaptic('light');
              openDownload(item);
            }}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 font-medium text-xs cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Downloads</span>
          </button>

          <div className="flex items-center gap-1.5 w-full pt-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                spatialAudio.playClick();
                triggerHaptic('light');
                handleToggleWatchlist(item);
              }}
              className={`flex-1 flex items-center justify-center py-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                inWatchlist
                  ? 'bg-neutral-800 border-neutral-600 text-amber-400'
                  : 'bg-neutral-800/80 border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-700'
              }`}
              title="Watchlist"
            >
              <Bookmark className={`w-3.5 h-3.5 ${inWatchlist ? 'fill-amber-400' : ''}`} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                spatialAudio.playClick();
                triggerHaptic('light');
                openDetails(item);
              }}
              className="flex-1 flex items-center justify-center py-1.5 rounded-lg bg-neutral-800/80 border border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-700 text-xs transition-colors cursor-pointer"
              title="Details & Cast"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Info Card Footer */}
      <div className="p-2.5 bg-[#10121a] border-t border-neutral-800/80">
        <h3 className="text-xs sm:text-sm font-semibold text-neutral-100 group-hover:text-[var(--color-accent)] transition-colors line-clamp-1">
          {item.name}
        </h3>
        <div className="flex items-center justify-between mt-1 text-[11px] text-neutral-400">
          <span>{item.year || item.releaseInfo || 'Latest'}</span>
          <span className="text-[10px] uppercase font-medium tracking-wider text-neutral-400">
            {item.type || 'Movie'}
          </span>
        </div>
      </div>
    </div>
  );
}
