import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bookmark, Play, Download, Trash2, Film, Star } from 'lucide-react';

export default function WatchlistTab() {
  const { watchlist, handleToggleWatchlist, openStream, openDownload, openDetails } = useApp();
  const [filter, setFilter] = useState('all');

  const filtered = watchlist.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'movie') return item.type === 'movie';
    if (filter === 'series') return item.type === 'series';
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <Bookmark className="w-7 h-7 text-purple-400" />
            <span>My Local Watchlist</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Persisted offline in SQLite database • {watchlist.length} titles saved
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#121626] p-1 rounded-xl border border-slate-800">
          {['all', 'movie', 'series'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-colors ${
                filter === type ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {type === 'all' ? 'All' : type === 'movie' ? 'Movies' : 'TV Shows'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid or Empty State */}
      {filtered.length === 0 ? (
        <div className="py-24 text-center glass-panel rounded-3xl border border-purple-500/20 space-y-3">
          <Bookmark className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-semibold text-slate-300">Your Watchlist is empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse trending movies or TV series and click the bookmark icon to save them locally.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map((item) => (
            <div
              key={item.media_id || item.id}
              className="group relative rounded-2xl overflow-hidden glass-card transition-all duration-300 hover:-translate-y-1"
            >
              {/* Poster */}
              <div 
                className="aspect-[2/3] w-full overflow-hidden bg-slate-900 cursor-pointer relative"
                onClick={() => openDetails({ id: item.media_id, name: item.title, type: item.type, poster: item.poster })}
              >
                <img
                  src={item.poster || 'https://images.metahub.space/poster/small/default.jpg'}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80'; }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-80" />

                <div className="absolute top-2 right-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleWatchlist({ id: item.media_id, title: item.title });
                    }}
                    className="p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white backdrop-blur-md transition-colors"
                    title="Remove from Watchlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {item.imdb_rating && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/70 text-amber-300 border border-amber-500/30">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    <span>{item.imdb_rating}</span>
                  </div>
                )}
              </div>

              {/* Bottom Meta & Actions */}
              <div className="p-3 bg-[#0a0c16] space-y-2">
                <div className="font-semibold text-xs sm:text-sm text-slate-200 truncate">
                  {item.title}
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    onClick={() => openStream({ id: item.media_id, name: item.title, type: item.type, poster: item.poster })}
                    className="flex-1 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold flex items-center justify-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Stream</span>
                  </button>
                  <button
                    onClick={() => openDownload({ id: item.media_id, name: item.title, type: item.type, poster: item.poster })}
                    className="flex-1 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold flex items-center justify-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Links</span>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}

