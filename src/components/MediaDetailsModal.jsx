import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { 
  X, 
  Play, 
  Download, 
  Bookmark, 
  Star, 
  Clock, 
  Calendar, 
  Film, 
  Users, 
  Video,
  ChevronRight,
  Smartphone,
  ArrowLeft
} from 'lucide-react';

export default function MediaDetailsModal() {
  const { detailsModal, closeDetails, openStream, openDownload, handleToggleWatchlist, isInWatchlist } = useApp();
  const { isOpen, media } = detailsModal;

  const [metaDetails, setMetaDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'episodes' | 'trailer'
  const [selectedSeason, setSelectedSeason] = useState(1);

  useEffect(() => {
    if (!isOpen || !media) return;

    setLoading(true);
    api.getMeta(media.type || 'movie', media.id)
      .then(data => {
        setMetaDetails(data || media);
      })
      .catch(err => {
        console.error(err);
        setMetaDetails(media);
      })
      .finally(() => setLoading(false));

    // Close on Escape key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeDetails();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, media]);

  if (!isOpen || !media) return null;

  const current = metaDetails || media;
  const inWatchlist = isInWatchlist(media.id);
  const backdropUrl = current.background || current.poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&q=80';
  const trailerId = current.trailerYtId || (current.trailers && current.trailers[0]?.source);

  const seasonsMap = current.seasonsData || {};
  const seasonsList = current.seasonsList || [1];
  const episodes = seasonsMap[selectedSeason] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-3 sm:p-6 overflow-y-auto">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-[#0a0d18] border border-purple-500/25 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Backdrop Banner Header */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden flex-shrink-0">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backdropUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d18] via-[#0a0d18]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0d18] via-transparent to-transparent" />
          </div>

          <button
            onClick={closeDetails}
            className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/60 hover:bg-purple-600 text-white backdrop-blur-md transition-colors text-xs font-bold cursor-pointer"
            title="Back to Browse"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            onClick={closeDetails}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-red-600 text-white backdrop-blur-md transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Quick Badges & Title in Banner */}
          <div className="absolute bottom-6 left-6 right-6 z-10 flex items-end gap-6">
            <img
              src={current.poster || 'https://images.metahub.space/poster/small/default.jpg'}
              alt={current.name}
              className="w-24 sm:w-32 aspect-[2/3] object-cover rounded-2xl border-2 border-purple-500/40 shadow-2xl hidden sm:block flex-shrink-0"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&q=80'; }}
            />

            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-500/30 text-purple-300 border border-purple-500/40">
                  {current.type === 'series' ? 'TV Series' : 'Feature Film'}
                </span>
                {current.imdbRating && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{current.imdbRating}</span>
                  </span>
                )}
                {current.year && (
                  <span className="text-xs text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded">
                    {current.year}
                  </span>
                )}
                {current.runtime && (
                  <span className="text-xs text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{current.runtime}</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-lg">
                {current.name}
              </h1>
            </div>
          </div>
        </div>

        {/* Action Controls & Navigation Tabs */}
        <div className="px-6 py-3 bg-[#0d1020] border-b border-slate-800 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                closeDetails();
                openStream(media);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 hover:scale-105 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Stream Now</span>
            </button>

            <button
              onClick={() => {
                const deepLink = `cloudstream://watch?id=${encodeURIComponent(media.id)}&type=${media.type || 'movie'}&title=${encodeURIComponent(media.name)}`;
                window.location.href = deepLink;
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 font-semibold text-xs hover:scale-105 transition-all"
              title="Open directly in Cloudstream 3 App"
            >
              <Smartphone className="w-3.5 h-3.5 text-purple-400" />
              <span>Cloudstream</span>
            </button>

            <button
              onClick={() => {
                closeDetails();
                openDownload(media);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#141829] hover:bg-[#1f253f] border border-cyan-500/40 text-cyan-300 font-semibold text-xs hover:scale-105 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Hub</span>
            </button>

            <button
              onClick={() => handleToggleWatchlist(media)}
              className={`p-2.5 rounded-xl border transition-colors ${
                inWatchlist
                  ? 'bg-purple-600 border-purple-500 text-white'
                  : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
              title="Watchlist"
            >
              <Bookmark className={`w-4 h-4 ${inWatchlist ? 'fill-white' : ''}`} />
            </button>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-1 bg-[#131728] p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'overview' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Overview
            </button>

            {current.type === 'series' && (
              <button
                onClick={() => setActiveTab('episodes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'episodes' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Episodes
              </button>
            )}

            {trailerId && (
              <button
                onClick={() => setActiveTab('trailer')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'trailer' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Trailer
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Synopsis */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Storyline
                </h3>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  {current.description || 'No description available for this title.'}
                </p>
              </div>

              {/* Genres */}
              {current.genres && Array.isArray(current.genres) && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Genres
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    {current.genres.map((g) => (
                      <span key={g} className="px-3 py-1 rounded-lg text-xs bg-[#141829] border border-slate-800 text-purple-300 font-medium">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Cast & Directors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {current.director && (
                  <div className="p-3.5 rounded-xl bg-[#0f1220] border border-slate-800/80">
                    <div className="text-xs text-slate-400 font-medium mb-1">Director</div>
                    <div className="text-sm font-semibold text-slate-200">
                      {Array.isArray(current.director) ? current.director.join(', ') : current.director}
                    </div>
                  </div>
                )}

                {current.cast && (
                  <div className="p-3.5 rounded-xl bg-[#0f1220] border border-slate-800/80">
                    <div className="text-xs text-slate-400 font-medium mb-1">Starring Cast</div>
                    <div className="text-sm font-semibold text-slate-200">
                      {Array.isArray(current.cast) ? current.cast.slice(0, 5).join(', ') : current.cast}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Episodes Tab for TV Series */}
          {activeTab === 'episodes' && current.type === 'series' && (
            <div className="space-y-4">
              
              {/* Season tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {seasonsList.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSeason(s)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedSeason === s ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Season {s}
                  </button>
                ))}
              </div>

              {/* Episodes List */}
              <div className="space-y-2.5">
                {episodes.map((ep) => (
                  <div
                    key={ep.id || ep.episode}
                    className="p-3.5 rounded-2xl bg-[#0f1220] border border-slate-800 flex items-center justify-between gap-4 hover:border-purple-500/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-300 font-bold flex items-center justify-center flex-shrink-0 text-xs border border-purple-500/30">
                        E{ep.episode}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-200 truncate">
                          {ep.name || `Episode ${ep.episode}`}
                        </div>
                        {ep.overview && (
                          <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                            {ep.overview}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => {
                          closeDetails();
                          openStream(media, selectedSeason, ep.episode);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
                      >
                        Stream
                      </button>
                      <button
                        onClick={() => {
                          closeDetails();
                          openDownload(media, selectedSeason, ep.episode);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 text-xs font-semibold border border-cyan-500/30"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* Official YouTube Trailer Tab */}
          {activeTab === 'trailer' && trailerId && (
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${trailerId}?autoplay=1`}
                title={`${current.name} Official Trailer`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

