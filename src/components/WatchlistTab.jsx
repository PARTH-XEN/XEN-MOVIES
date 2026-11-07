import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bookmark, Play, Download, Trash2, Film, Star, User, Sparkles, LogIn, ShieldCheck } from 'lucide-react';
import { spatialAudio } from '../utils/spatialAudio';

export default function WatchlistTab() {
  const { watchlist, handleToggleWatchlist, openStream, openDownload, openDetails, user, openAuthModal } = useApp();
  const [filter, setFilter] = useState('all');

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6 text-center select-none animate-in fade-in duration-300">
        <div className="p-8 sm:p-10 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-5">
          <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700 mx-auto flex items-center justify-center text-[var(--color-accent)]">
            <Bookmark className="w-6 h-6" />
          </div>

          <div className="space-y-1.5 max-w-sm mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Sign In to View Watchlist
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Saving movies and TV series requires an account so your personal library stays private and syncs across your devices.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
            <button
              onClick={() => {
                spatialAudio.playOpen();
                openAuthModal('signup');
              }}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 font-semibold text-xs transition-colors cursor-pointer"
            >
              Create Free Account
            </button>

            <button
              onClick={() => {
                spatialAudio.playClick();
                openAuthModal('login');
              }}
              className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-neutral-200 font-medium text-xs transition-colors cursor-pointer"
            >
              Sign In with Email
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Bookmark className="w-6 h-6 text-[var(--color-accent)]" />
            <span>{(user?.name || user?.email || 'User').split(' ')[0]}'s Watchlist</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Connected to {user?.email || 'account'} • {watchlist?.length || 0} titles saved in private library
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
          {['all', 'movie', 'series'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase transition-colors cursor-pointer ${
                filter === type ? 'bg-neutral-100 text-neutral-950 font-semibold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {type === 'all' ? 'All' : type === 'movie' ? 'Movies' : 'TV Shows'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid or Empty State */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
          <Bookmark className="w-10 h-10 text-neutral-600 mx-auto" />
          <h3 className="text-sm font-semibold text-neutral-300">Your Watchlist is empty</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Browse movies or TV series and click the bookmark icon to save them to your library.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {filtered.map((item) => (
            <div
              key={item.media_id || item.id}
              className="group relative rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all"
            >
              {/* Poster */}
              <div 
                className="aspect-[2/3] w-full overflow-hidden bg-neutral-950 cursor-pointer relative"
                onClick={() => openDetails({ id: item.media_id, name: item.title, type: item.type, poster: item.poster })}
              >
                <img
                  src={item.poster || 'https://images.metahub.space/poster/small/default.jpg'}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80'; }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-80" />

                <div className="absolute top-2 right-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleWatchlist({ id: item.media_id, title: item.title });
                    }}
                    className="p-1.5 rounded-lg bg-neutral-950/80 hover:bg-rose-600 text-neutral-300 hover:text-white backdrop-blur-md transition-colors cursor-pointer"
                    title="Remove from Watchlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {item.imdb_rating && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-black/70 text-amber-300 border border-amber-500/30">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    <span>{item.imdb_rating}</span>
                  </div>
                )}
              </div>

              {/* Bottom Meta & Actions */}
              <div className="p-2.5 bg-neutral-900 space-y-2">
                <div className="font-medium text-xs sm:text-sm text-neutral-200 truncate">
                  {item.title}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openStream({ id: item.media_id, name: item.title, type: item.type, poster: item.poster })}
                    className="flex-1 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Stream</span>
                  </button>
                  <button
                    onClick={() => openDownload({ id: item.media_id, name: item.title, type: item.type, poster: item.poster })}
                    className="flex-1 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-xs font-medium border border-neutral-700 flex items-center justify-center gap-1 cursor-pointer transition-colors"
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
