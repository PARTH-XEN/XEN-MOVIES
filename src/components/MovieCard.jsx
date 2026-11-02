import React from 'react';
import { useApp } from '../context/AppContext';
import { Play, Download, Bookmark, Star, Info } from 'lucide-react';

export default function MovieCard({ item }) {
  const { openStream, openDownload, openDetails, handleToggleWatchlist, isInWatchlist } = useApp();

  if (!item) return null;

  const inWatchlist = isInWatchlist(item.id);
  const posterUrl = item.poster || 'https://images.metahub.space/poster/small/default.jpg';

  return (
    <div className="group relative flex flex-col rounded-2xl overflow-hidden glass-card transition-all duration-300 hover:-translate-y-1.5 select-none cursor-pointer">
      
      {/* Poster Image Container */}
      <div 
        className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900"
        onClick={() => openDetails(item)}
      >
        <img
          src={posterUrl}
          alt={item.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80';
          }}
        />

        {/* Gradient Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080d] via-transparent to-black/40 opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-black/60 backdrop-blur-md text-cyan-300 border border-cyan-500/30">
            {item.type === 'series' ? 'TV' : '4K / HD'}
          </span>

          {item.imdbRating && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 backdrop-blur-md text-amber-300 border border-amber-500/30">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              <span>{item.imdbRating}</span>
            </span>
          )}
        </div>

        {/* Floating Quick Action Overlay (Appears on Hover) */}
        <div className="absolute inset-0 bg-[#07080d]/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2.5 p-4">
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              openStream(item);
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/40 hover:scale-105 transition-transform"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Stream</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              openDownload(item);
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[#141829] hover:bg-[#1f253f] border border-cyan-500/50 text-cyan-300 font-semibold text-xs hover:scale-105 transition-transform"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Links</span>
          </button>

          <div className="flex items-center gap-2 w-full pt-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleWatchlist(item);
              }}
              className={`flex-1 flex items-center justify-center py-1.5 rounded-lg border text-xs transition-colors ${
                inWatchlist
                  ? 'bg-purple-600/30 border-purple-500 text-purple-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title="Watchlist"
            >
              <Bookmark className={`w-3.5 h-3.5 ${inWatchlist ? 'fill-purple-300' : ''}`} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                openDetails(item);
              }}
              className="flex-1 flex items-center justify-center py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white text-xs transition-colors"
              title="Details"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* Meta Footer */}
      <div className="p-3 bg-[#0a0c16]/90 flex flex-col justify-between flex-1">
        <h3 className="font-semibold text-slate-200 text-xs sm:text-sm line-clamp-1 group-hover:text-purple-400 transition-colors">
          {item.name}
        </h3>
        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
          <span>{item.year || '2024'}</span>
          <span className="uppercase text-[9px] px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-400">
            {item.type || 'Movie'}
          </span>
        </div>
      </div>

    </div>
  );
}

