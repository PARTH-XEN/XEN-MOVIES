import React from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Clock, Play, Trash2, Film, Tv } from 'lucide-react';

export default function HistoryTab() {
  const { history, openStream, reloadData, addToast } = useApp();

  const handleDeleteHistoryItem = async (id) => {
    try {
      await api.deleteHistory(id);
      addToast('History item removed', 'info');
      reloadData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <Clock className="w-7 h-7 text-cyan-400" />
            <span>Continue Watching</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pick up right where you left off • Stored locally in SQLite
          </p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="py-24 text-center glass-panel rounded-3xl border border-cyan-500/20 space-y-3">
          <Clock className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-semibold text-slate-300">No watch history yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Start streaming any movie or series and your progress will automatically sync here!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-[#0f1222] border border-slate-800 hover:border-cyan-500/40 overflow-hidden flex flex-col group transition-all"
            >
              
              {/* Thumbnail Container */}
              <div 
                className="relative aspect-video w-full bg-slate-900 cursor-pointer overflow-hidden"
                onClick={() => openStream({ id: item.media_id, name: item.title, type: item.type, poster: item.poster }, item.season || 1, item.episode || 1)}
              >
                <img
                  src={item.backdrop || item.poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80'}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80'; }}
                />

                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/90 group-hover:scale-110 flex items-center justify-center shadow-lg shadow-cyan-500/40 transition-transform">
                    <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                  </div>
                </div>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-black/70 text-cyan-300 border border-cyan-500/30">
                    {item.type === 'series' ? `S${item.season} : E${item.episode}` : 'Movie'}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteHistoryItem(item.id);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-red-600 text-slate-300 hover:text-white transition-colors"
                  title="Remove from History"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-400"
                    style={{ width: `${Math.max(item.progress_percent || 20, 15)}%` }}
                  />
                </div>
              </div>

              {/* Meta details */}
              <div className="p-3.5 flex items-center justify-between gap-3 bg-[#0a0c16]">
                <div className="min-w-0">
                  <h3 className="font-semibold text-xs sm:text-sm text-slate-200 truncate group-hover:text-cyan-300 transition-colors">
                    {item.title}
                  </h3>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Watched {new Date(item.updated_at).toLocaleDateString()}
                  </div>
                </div>

                <button
                  onClick={() => openStream({ id: item.media_id, name: item.title, type: item.type, poster: item.poster }, item.season || 1, item.episode || 1)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold whitespace-nowrap flex-shrink-0"
                >
                  Resume
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}

