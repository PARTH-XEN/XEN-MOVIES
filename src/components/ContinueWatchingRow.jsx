import React from 'react';
import { useApp } from '../context/AppContext';
import { spatialAudio } from '../utils/spatialAudio';
import { triggerHaptic } from '../utils/haptics';
import { Play, Clock, X, ChevronRight } from 'lucide-react';

export default function ContinueWatchingRow() {
  const { history, openStream, removeHistoryItem, setActiveTab } = useApp();

  if (!history || history.length === 0) return null;

  return (
    <section className="space-y-3 sm:space-y-4 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700/80">
            <Clock className="w-4 h-4 text-neutral-300" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-neutral-100 tracking-tight flex items-center gap-2">
              <span>Continue Watching</span>
              <span className="text-xs font-medium px-2 py-0.2 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700/80">
                {history.length}
              </span>
            </h2>
          </div>
        </div>

        <button
          onClick={() => {
            spatialAudio.playClick();
            setActiveTab('history');
          }}
          className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white font-medium transition-colors cursor-pointer"
        >
          <span>All History</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Horizontal Carousel */}
      <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto py-1 scrollbar-none snap-x">
        {history.slice(0, 10).map((item) => {
          const percent = Math.min(Math.max(item.progress_percent || 25, 5), 100);
          const isSeries = item.type === 'series';
          const backdrop = item.backdrop || item.poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80';

          return (
            <div
              key={item.id || item.media_id}
              className="group relative flex-shrink-0 w-44 sm:w-60 rounded-2xl overflow-hidden spatial-panel border border-white/10 hover:border-purple-500/50 transition-all duration-300 snap-start cursor-pointer select-none active:scale-95"
              onClick={() => {
                spatialAudio.playOpen();
                triggerHaptic('medium');
                openStream(
                  { id: item.media_id, name: item.title, type: item.type, poster: item.poster, background: item.backdrop },
                  item.season || 1,
                  item.episode || 1
                );
              }}
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                <img
                  src={backdrop}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80';
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d18] via-transparent to-black/30" />

                {/* Floating Play Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-xl shadow-purple-950/80 group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  </div>
                </div>

                {/* Badge S:E */}
                {isSeries && item.season && item.episode && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-black/80 backdrop-blur-md text-cyan-300 border border-cyan-500/40">
                    S{item.season} : E{item.episode}
                  </span>
                )}

                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    spatialAudio.playClick();
                    triggerHaptic('light');
                    removeHistoryItem(item.id);
                  }}
                  className="absolute top-2 right-2 p-1 rounded-lg bg-black/70 hover:bg-red-500/80 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Remove from Continue Watching"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/60">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 shadow-sm shadow-purple-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              {/* Title & Progress info */}
              <div className="p-2.5 sm:p-3 bg-[#0d1020]/95">
                <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h4>
                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                  <span>{percent}% completed</span>
                  <span className="text-purple-400 font-semibold group-hover:underline">Resume</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

