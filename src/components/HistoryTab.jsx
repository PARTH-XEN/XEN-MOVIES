import React from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Clock, Play, Trash2 } from 'lucide-react';

export default function HistoryTab() {
  const { history, openStream, reloadData, addToast, user } = useApp();

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
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-[var(--color-accent)]" />
            <span>Continue Watching</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            {user 
              ? `Connected to ${user.name} (${user.email}) • Private watch history`
              : 'Pick up right where you left off'}
          </p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
          <Clock className="w-10 h-10 text-neutral-600 mx-auto" />
          <h3 className="text-sm font-semibold text-neutral-300">No watch history yet</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Start streaming any movie or series and your progress will automatically appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 overflow-hidden flex flex-col group transition-colors"
            >
              {/* Thumbnail Container */}
              <div 
                className="relative aspect-video w-full bg-neutral-950 cursor-pointer overflow-hidden"
                onClick={() => openStream({ id: item.media_id, name: item.title, type: item.type, poster: item.poster }, item.season || 1, item.episode || 1)}
              >
                <img
                  src={item.backdrop || item.poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80'}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80'; }}
                />

                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/90 group-hover:scale-110 flex items-center justify-center shadow-lg transition-transform text-neutral-950">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-neutral-950/80 text-neutral-200 border border-neutral-700">
                    {item.type === 'series' ? `S${item.season} : E${item.episode}` : 'Movie'}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteHistoryItem(item.id);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-neutral-950/80 hover:bg-rose-600 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  title="Remove from History"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-800">
                  <div 
                    className="h-full bg-[var(--color-accent)]"
                    style={{ width: `${Math.max(item.progress_percent || 20, 15)}%` }}
                  />
                </div>
              </div>

              {/* Meta details */}
              <div className="p-3 flex items-center justify-between gap-3 bg-neutral-900">
                <div className="min-w-0">
                  <h3 className="font-medium text-xs sm:text-sm text-neutral-200 truncate">
                    {item.title}
                  </h3>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    Watched {new Date(item.updated_at).toLocaleDateString()}
                  </div>
                </div>

                <button
                  onClick={() => openStream({ id: item.media_id, name: item.title, type: item.type, poster: item.poster }, item.season || 1, item.episode || 1)}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-semibold whitespace-nowrap flex-shrink-0 cursor-pointer transition-colors"
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
