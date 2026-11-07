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
  ArrowLeft,
  Sparkles,
  Lock
} from 'lucide-react';

export default function MediaDetailsModal() {
  const { 
    detailsModal, 
    closeDetails, 
    openStream, 
    openDownload, 
    handleToggleWatchlist, 
    isInWatchlist, 
    setSearchQuery,
    user,
    openAuthModal,
    addToast
  } = useApp();
  const { isOpen, media } = detailsModal;

  const [metaDetails, setMetaDetails] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'episodes' | 'trailer'
  const [selectedSeason, setSelectedSeason] = useState(1);

  useEffect(() => {
    if (!isOpen || !media) return;

    setLoading(true);
    setRecommendations([]);
    api.getMeta(media.type || 'movie', media.id)
      .then(data => {
        setMetaDetails(data || media);
      })
      .catch(err => {
        console.error(err);
        setMetaDetails(media);
      })
      .finally(() => setLoading(false));

    // Fetch similar recommendations
    api.getRecommendations(media.type || 'movie', media.id)
      .then(res => {
        if (res?.items) setRecommendations(res.items);
      })
      .catch(console.error);

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-2xl p-0 sm:p-6 overflow-y-auto">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-[#0d0f17] border-t sm:border border-neutral-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh]">
        
        {/* Backdrop Banner Header */}
        <div className="relative h-44 sm:h-72 w-full overflow-hidden flex-shrink-0">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backdropUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f17] via-[#0d0f17]/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d0f17] via-transparent to-transparent" />
          </div>

          <button
            onClick={closeDetails}
            data-modal-close="true"
            data-tv-focus="true"
            tabIndex={0}
            className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-neutral-950/70 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 backdrop-blur-md transition-colors text-xs font-semibold cursor-pointer"
            title="Back to Browse"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            onClick={closeDetails}
            data-modal-close="true"
            data-tv-focus="true"
            tabIndex={0}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 sm:p-2.5 rounded-full bg-neutral-950/70 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 backdrop-blur-md transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Quick Badges & Title in Banner */}
          <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 z-10 flex items-end gap-3 sm:gap-6">
            <img
              src={current.poster || 'https://images.metahub.space/poster/small/default.jpg'}
              alt={current.name}
              className="w-16 sm:w-32 aspect-[2/3] object-cover rounded-xl border border-neutral-800 shadow-2xl flex-shrink-0"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&q=80'; }}
            />

            <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="px-2 sm:px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase bg-neutral-800/90 text-neutral-300 border border-neutral-700">
                  {current.type === 'series' ? 'TV Series' : 'Feature Film'}
                </span>
                {current.imdbRating && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-400" />
                    <span>{current.imdbRating}</span>
                  </span>
                )}
                {current.year && (
                  <span className="text-[10px] sm:text-xs text-neutral-300 bg-neutral-800/80 px-2 py-0.5 rounded-md border border-neutral-700/60">
                    {current.year}
                  </span>
                )}
                {current.runtime && (
                  <span className="text-[10px] sm:text-xs text-neutral-300 bg-neutral-800/80 px-2 py-0.5 rounded-md border border-neutral-700/60 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-neutral-400" />
                    <span>{current.runtime}</span>
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-3xl font-bold text-white tracking-tight truncate">
                {current.name}
              </h1>
            </div>
          </div>
        </div>

        {/* Action Controls & Navigation Tabs */}
        <div className="px-3 sm:px-6 py-2.5 sm:py-3 bg-[#11131c] border-b border-neutral-800 flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap flex-1">
            <button
              onClick={() => {
                if (!user) {
                  openAuthModal('login');
                  addToast('Sign in required: Please sign in or create a free account to stream movies and TV series in HD/4K.', 'info');
                  return;
                }
                closeDetails();
                openStream(media);
              }}
              data-tv-focus="true"
              tabIndex={0}
              className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-xs shadow-sm transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-white ${
                user
                  ? 'bg-white hover:bg-neutral-200 text-neutral-950 active:scale-95'
                  : 'bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-neutral-200'
              }`}
            >
              {user ? (
                <Play className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>{user ? 'Stream Now' : 'Sign In to Stream'}</span>
            </button>

            <button
              onClick={() => {
                const deepLink = `cloudstream://watch?id=${encodeURIComponent(media.id)}&type=${media.type || 'movie'}&title=${encodeURIComponent(media.name)}`;
                triggerHaptic('medium');
                addToast('Launching in Cloudstream 3 App...', 'info');
                window.location.href = deepLink;
              }}
              data-tv-focus="true"
              tabIndex={0}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 hover:text-white font-medium text-xs active:scale-95 transition-all cursor-pointer"
              title="Open directly in Cloudstream 3 App"
            >
              <Smartphone className="w-3.5 h-3.5 text-neutral-400" />
              <span>Cloudstream</span>
            </button>

            <button
              onClick={() => {
                if (!user) {
                  openAuthModal('login');
                  addToast('Sign in required: Please log in or create a free account to access 4K downloads & batch ZIP files.', 'info');
                  return;
                }
                closeDetails();
                openDownload(media);
              }}
              data-tv-focus="true"
              tabIndex={0}
              className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                user
                  ? 'bg-neutral-800/80 hover:bg-neutral-700 border-neutral-700 text-neutral-200 hover:text-white active:scale-95'
                  : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {user ? (
                <Download className="w-3.5 h-3.5 text-neutral-300" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-neutral-400" />
              )}
              <span>{user ? 'Downloads' : 'Sign In to Download'}</span>
            </button>

            <button
              onClick={() => {
                if (!user) {
                  openAuthModal('login');
                  addToast('Sign in required: Please sign in or create an account to save movies & series to your personal Watchlist.', 'info');
                  return;
                }
                handleToggleWatchlist(media);
              }}
              data-tv-focus="true"
              tabIndex={0}
              className={`p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer ${
                inWatchlist
                  ? 'bg-neutral-100 border-neutral-200 text-neutral-950 font-semibold'
                  : 'bg-neutral-800/80 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
              }`}
              title={user ? (inWatchlist ? "Remove from Watchlist" : "Add to Watchlist") : "Sign in to add to Watchlist"}
            >
              <Bookmark className={`w-4 h-4 ${inWatchlist ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'overview' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Overview
            </button>

            {current.type === 'series' && (
              <button
                onClick={() => setActiveTab('episodes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'episodes' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Episodes
              </button>
            )}

            {trailerId && (
              <button
                onClick={() => setActiveTab('trailer')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'trailer' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
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
              
              {/* VIP Auth Callout for Guests */}
              {!user && (
                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center flex-shrink-0 text-amber-400">
                      <Lock className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white flex items-center gap-2">
                        <span>Sign In to Stream & Download</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30">Free</span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Stream in 4K Ultra-HD, access multi-server mirrors, and save to your private watchlist with a free account.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => openAuthModal('login')}
                    className="px-4 py-2 rounded-lg bg-white hover:bg-neutral-200 text-neutral-950 font-semibold text-xs whitespace-nowrap transition-colors cursor-pointer flex-shrink-0 w-full sm:w-auto text-center"
                  >
                    Sign In / Register
                  </button>
                </div>
              )}

              {/* Synopsis */}
              <div>
                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                  Storyline
                </h3>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  {current.description || 'No description available for this title.'}
                </p>
              </div>

              {/* Genres */}
              {current.genres && Array.isArray(current.genres) && (
                <div>
                  <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                    Genres
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    {current.genres.map((g) => (
                      <span key={g} className="px-2.5 py-1 rounded-md text-xs bg-neutral-900 border border-neutral-800 text-neutral-300 font-medium">
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
                    <div className="text-xs text-slate-400 font-medium mb-1.5 flex items-center justify-between">
                      <span>Starring Cast</span>
                      <span className="text-[10px] text-purple-400">Click to search titles</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(Array.isArray(current.cast) ? current.cast.slice(0, 6) : [current.cast]).map((actor, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            closeDetails();
                            setSearchQuery(actor);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs bg-white/[0.05] hover:bg-purple-600/30 border border-white/10 hover:border-purple-500/40 text-slate-200 hover:text-white transition-all cursor-pointer"
                        >
                          {actor}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* More Like This Recommendations */}
              {recommendations.length > 0 && (
                <div className="pt-4 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      More Like This
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
                    {recommendations.map((rec) => (
                      <div
                        key={rec.id}
                        className="flex-shrink-0 w-28 sm:w-36 group/rec cursor-pointer snap-start select-none"
                        onClick={() => {
                          setMetaDetails(null);
                          setRecommendations([]);
                          setLoading(true);
                          api.getMeta(rec.type || 'movie', rec.id)
                            .then(d => setMetaDetails(d || rec))
                            .finally(() => setLoading(false));
                          api.getRecommendations(rec.type || 'movie', rec.id)
                            .then(r => setRecommendations(r?.items || []));
                        }}
                      >
                        <div className="aspect-[2/3] w-full rounded-xl overflow-hidden bg-slate-900 border border-white/10 group-hover/rec:border-purple-500/50 transition-all group-hover/rec:scale-105 shadow-md">
                          <img
                            src={rec.poster || 'https://images.metahub.space/poster/small/default.jpg'}
                            alt={rec.name}
                            loading="lazy"
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&q=80'; }}
                          />
                        </div>
                        <h5 className="text-[11px] sm:text-xs font-semibold text-slate-200 group-hover/rec:text-purple-300 truncate mt-1.5">
                          {rec.name}
                        </h5>
                        <div className="text-[10px] text-slate-400">
                          {rec.year || rec.type}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                          if (!user) {
                            openAuthModal('login');
                            addToast(`Sign in required: Please sign in to stream Episode ${ep.episode}`, 'info');
                            return;
                          }
                          closeDetails();
                          openStream(media, selectedSeason, ep.episode);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer"
                      >
                        {!user && <Lock className="w-3 h-3 text-amber-300" />}
                        <span>Stream</span>
                      </button>
                      <button
                        onClick={() => {
                          if (!user) {
                            openAuthModal('login');
                            addToast(`Sign in required: Please sign in to download Episode ${ep.episode}`, 'info');
                            return;
                          }
                          closeDetails();
                          openDownload(media, selectedSeason, ep.episode);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 text-xs font-semibold border border-cyan-500/30 cursor-pointer"
                      >
                        {!user && <Lock className="w-3 h-3 text-cyan-300" />}
                        <span>Download</span>
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

