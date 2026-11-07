import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { spatialAudio } from '../utils/spatialAudio';
import { triggerHaptic } from '../utils/haptics';
import { X, Download, Maximize, Minimize, Smartphone, Cloud, ArrowLeft, FastForward, RefreshCw } from 'lucide-react';

// Pre-built fallback servers list generator for instant playback
function buildFallbackServers(type, id, season = 1, episode = 1, tmdbId = null) {
  const isMovie = type === 'movie';
  const s = parseInt(season, 10) || 1;
  const e = parseInt(episode, 10) || 1;
  const effectiveTmdb = tmdbId || id;
  return [
    {
      id: 'vidlink',
      name: 'VidLink 4K',
      badge: '4K UHD',
      url: isMovie 
        ? `https://vidlink.pro/movie/${effectiveTmdb || id}?primaryColor=f59e0b&secondaryColor=10b981&iconColor=f59e0b`
        : `https://vidlink.pro/tv/${effectiveTmdb || id}/${s}/${e}?primaryColor=f59e0b&secondaryColor=10b981&iconColor=f59e0b`
    },
    {
      id: 'vidsrc_su',
      name: 'VidSrc Ultra',
      badge: '4K Ultra',
      url: isMovie
        ? `https://vidsrc.su/embed/movie/${id}`
        : `https://vidsrc.su/embed/tv/${effectiveTmdb || id}/${s}/${e}`
    },
    {
      id: 'autoembed',
      name: 'AutoEmbed 4K',
      badge: '4K Cloud CDN',
      url: isMovie
        ? `https://autoembed.me/movie/imdb/${id}`
        : `https://autoembed.me/tv/imdb/${id}-${s}-${e}`
    },
    {
      id: '2embed',
      name: '2Embed VIP',
      badge: 'Auto-Play',
      url: isMovie
        ? `https://www.2embed.cc/embed/${id}`
        : `https://www.2embed.cc/embedtv/${id}?s=${s}&e=${e}`
    },
    {
      id: 'vidsrc_pm',
      name: 'VidSrc PM',
      badge: 'Multi-Audio',
      url: isMovie
        ? `https://vidsrc.pm/embed/movie/${id}`
        : `https://vidsrc.pm/embed/tv/${id}/${s}/${e}`
    },
    {
      id: 'movies111',
      name: '111Movies',
      badge: 'Fast Mirror',
      url: isMovie
        ? `https://111movies.com/movie/${id}`
        : `https://111movies.com/tv/${effectiveTmdb || id}/${s}/${e}`
    },
    {
      id: 'vidsrc_work',
      name: 'VidSrc Work',
      badge: 'Universal Backup',
      url: isMovie
        ? `https://vidsrc.work/embed/movie/${effectiveTmdb || id}`
        : `https://vidsrc.work/embed/tv/${effectiveTmdb || id}/${s}/${e}`
    }
  ];
}

export default function StreamPlayerModal() {
  const { streamModal, closeStream, openDownload, settings, addToast, user, authLoading, openAuthModal } = useApp();
  const { isOpen, media, season: initialSeason = 1, episode: initialEpisode = 1 } = streamModal;

  const [activeServer, setActiveServer] = useState('vidlink');
  const [currentSeason, setCurrentSeason] = useState(initialSeason);
  const [currentEpisode, setCurrentEpisode] = useState(initialEpisode);
  const [servers, setServers] = useState([]);
  const [metaDetails, setMetaDetails] = useState(null);
  const [theaterMode, setTheaterMode] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerContainerRef = useRef(null);

  // Fullscreen change listener
  useEffect(() => {
    const onFullscreenChange = () => {
      const isFull = Boolean(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isFull);
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    document.addEventListener('mozfullscreenchange', onFullscreenChange);
    document.addEventListener('MSFullscreenChange', onFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
      document.removeEventListener('mozfullscreenchange', onFullscreenChange);
      document.removeEventListener('MSFullscreenChange', onFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      const elem = playerContainerRef.current || document.documentElement;
      const isCurrentlyFull = Boolean(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );

      if (!isCurrentlyFull) {
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
          await elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
          await elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) {
          await elem.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          await document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
      setTheaterMode(prev => !prev);
    }
  };

  // Hard auth barrier: unauthenticated users cannot open player (only evaluated after auth finishes loading)
  useEffect(() => {
    if (isOpen && !authLoading && !user) {
      closeStream();
      openAuthModal('login');
      addToast('Sign in required: Please sign in or create a free account to stream movies and TV series in HD/4K.', 'info');
    }
  }, [isOpen, authLoading, user]);

  useEffect(() => {
    if (!isOpen || !media) return;
    if (authLoading) return;
    if (!user) return;

    const s = initialSeason || 1;
    const e = initialEpisode || 1;
    setCurrentSeason(s);
    setCurrentEpisode(e);

    // Immediately supply instant playback servers so there is ZERO waiting or stuck spinner
    const defaults = buildFallbackServers(media.type || 'movie', media.id, s, e);
    setServers(defaults);

    // Fetch live enriched servers from API
    api.getEmbeds(media.type || 'movie', media.id, s, e)
      .then(res => {
        if (res?.servers && res.servers.length > 0) {
          setServers(res.servers);
        }
      })
      .catch(err => {
        console.warn('Using instant default mirrors:', err);
      });

    // If series, load full seasons and episode data
    if (media.type === 'series') {
      api.getMeta('series', media.id)
        .then(data => {
          if (data) setMetaDetails(data);
        })
        .catch(console.error);
    }

    // Auto save to History in SQLite
    api.saveHistory({
      media_id: media.id,
      title: media.name || media.title,
      type: media.type || 'movie',
      poster: media.poster,
      backdrop: media.background || media.poster,
      season: media.type === 'series' ? s : null,
      episode: media.type === 'series' ? e : null,
      progress_percent: 15,
      progress_seconds: 300,
      duration_seconds: 7200
    }).catch(console.error);

    // Close on Escape or TV Back
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'BrowserBack' || e.key === 'GoBack') {
        closeStream();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, media]);

  // When season/episode changes, update servers
  useEffect(() => {
    if (!isOpen || !media) return;

    // Immediately supply instant servers for new season/episode
    const tmdbId = metaDetails?.moviedb_id || null;
    const defaults = buildFallbackServers(media.type || 'movie', media.id, currentSeason, currentEpisode, tmdbId);
    setServers(defaults);
    setIframeKey(k => k + 1);

    api.getEmbeds(media.type || 'movie', media.id, currentSeason, currentEpisode)
      .then(res => {
        if (res?.servers && res.servers.length > 0) {
          setServers(res.servers);
        }
      })
      .catch(console.error);

    if (media.type === 'series') {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('s', currentSeason);
        url.searchParams.set('e', currentEpisode);
        window.history.replaceState({ xen: 'stream', id: media.id }, '', url.pathname + url.search);
        const cached = localStorage.getItem('xen_active_stream');
        if (cached) {
          const parsed = JSON.parse(cached);
          parsed.season = currentSeason;
          parsed.episode = currentEpisode;
          localStorage.setItem('xen_active_stream', JSON.stringify(parsed));
        }
      } catch (e) {}

      api.saveHistory({
        media_id: media.id,
        title: media.name || media.title,
        type: 'series',
        poster: media.poster,
        backdrop: media.background || media.poster,
        season: currentSeason,
        episode: currentEpisode,
        progress_percent: 20,
        progress_seconds: 350,
        duration_seconds: 3600
      }).catch(console.error);
    }
  }, [currentSeason, currentEpisode]);

  const handleOpenCloudstream = () => {
    const deepLink = `cloudstream://watch?id=${encodeURIComponent(media.id)}&type=${media.type || 'movie'}&s=${currentSeason}&e=${currentEpisode}&title=${encodeURIComponent(media.name)}`;
    if (streamUrl) {
      navigator.clipboard.writeText(streamUrl);
    }
    triggerHaptic('success');
    addToast('Opening Cloudstream App & Copied Stream Link!', 'success');
    window.location.href = deepLink;
  };

  const handleNextEpisode = () => {
    spatialAudio.playOpen();
    triggerHaptic('medium');
    setCurrentEpisode(prev => prev + 1);
    addToast(`Loading Episode ${currentEpisode + 1}...`, 'info');
  };

  const handleCycleServer = () => {
    if (!servers || servers.length === 0) return;
    const currentIndex = servers.findIndex(s => s.id === activeServer);
    const nextIndex = (currentIndex + 1) % servers.length;
    const nextServer = servers[nextIndex];
    spatialAudio.playClick();
    triggerHaptic('selection');
    setActiveServer(nextServer.id);
    setIframeKey(k => k + 1);
    addToast(`Switched to Mirror: ${nextServer.name}`, 'info');
  };

  if (!isOpen || !media || !user) return null;

  const currentServerObj = servers.find(s => s.id === activeServer) || servers[0];
  const streamUrl = currentServerObj?.url || '';

  // Get current season episodes if series
  const seasonsMap = metaDetails?.seasonsData || {};
  const currentSeasonEpisodes = seasonsMap[currentSeason] || [];
  const availableSeasons = metaDetails?.seasonsList || [1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-1 sm:p-4 overflow-y-auto pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      
      {/* Modal Container */}
      <div className={`relative w-full ${theaterMode ? 'max-w-7xl' : 'max-w-6xl'} bg-[#0a0d18] border border-neutral-800 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300`}>
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3.5 bg-[#0e1222] border-b border-slate-800">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <button
              onClick={() => {
                spatialAudio.playClick();
                triggerHaptic('light');
                closeStream();
              }}
              data-tv-focus="true"
              data-modal-close="true"
              tabIndex={0}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer mr-1 focus-visible:ring-2 focus-visible:ring-purple-400"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0"></div>
            <div className="truncate">
              <h2 className="font-semibold text-neutral-100 text-xs sm:text-sm flex items-center gap-1.5 truncate">
                <span className="truncate">{media.name}</span>
                {media.type === 'series' && (
                  <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 font-medium border border-neutral-700 flex-shrink-0">
                    S{currentSeason} : E{currentEpisode}
                  </span>
                )}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {media.type === 'series' && (
              <button
                onClick={handleNextEpisode}
                data-tv-focus="true"
                tabIndex={0}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-950 font-semibold text-[11px] sm:text-xs transition-colors cursor-pointer active:scale-95"
                title="Next Episode"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Next Ep</span>
              </button>
            )}

            <button
              onClick={handleOpenCloudstream}
              data-tv-focus="true"
              tabIndex={0}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-750 text-neutral-300 hover:text-white border border-neutral-700 text-[11px] sm:text-xs font-medium transition-colors cursor-pointer active:scale-95"
              title="Open in Cloudstream 3 (Android / TV / PC)"
            >
              <Smartphone className="w-3.5 h-3.5 text-neutral-400" />
              <span className="hidden xs:inline">Cloudstream</span>
            </button>

            <button
              onClick={() => {
                spatialAudio.playOpen();
                triggerHaptic('light');
                closeStream();
                openDownload(media, currentSeason, currentEpisode);
              }}
              data-tv-focus="true"
              tabIndex={0}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-750 text-neutral-300 hover:text-white border border-neutral-700 text-[11px] sm:text-xs font-medium transition-colors cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Downloads</span>
            </button>

            <button
              onClick={() => {
                spatialAudio.playClick();
                toggleFullscreen();
              }}
              data-tv-focus="true"
              tabIndex={0}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-750 text-neutral-300 hover:text-white border border-neutral-700 text-[11px] sm:text-xs font-medium transition-colors cursor-pointer active:scale-95"
              title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
              <span className="hidden xs:inline">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
            </button>

            <button
              onClick={() => {
                spatialAudio.playClick();
                triggerHaptic('light');
                closeStream();
              }}
              data-tv-focus="true"
              tabIndex={0}
              className="p-2 rounded-lg bg-neutral-850 hover:bg-red-600 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Server Switcher Bar */}
        <div className="px-3 sm:px-5 py-2 bg-[#0c0e14] border-b border-neutral-800 flex items-center gap-2 overflow-x-auto scrollbar-none select-none">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-neutral-400 mr-1 flex-shrink-0 bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-md">
            <Cloud className="w-3 h-3 text-neutral-400" />
            <span>Servers:</span>
          </div>

          {servers.map((s) => {
            const isCurrent = (activeServer === s.id) || (!activeServer && s.id === 'vidlink');
            return (
              <button
                key={s.id}
                onClick={() => {
                  spatialAudio.playClick();
                  triggerHaptic('selection');
                  setActiveServer(s.id);
                  setIframeKey(k => k + 1);
                  addToast(`Switched to ${s.name}`, 'info');
                }}
                data-tv-focus="true"
                tabIndex={0}
                className={`whitespace-nowrap flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer select-none active:scale-95 ${
                  isCurrent
                    ? 'bg-neutral-100 text-neutral-950 font-semibold shadow-sm'
                    : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850 border border-neutral-800'
                }`}
              >
                <span>{s.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                  isCurrent ? 'bg-neutral-300 text-neutral-900' : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {s.badge}
                </span>
              </button>
            );
          })}

          {/* Auto-Switch Next Mirror Button */}
          <button
            onClick={handleCycleServer}
            data-tv-focus="true"
            tabIndex={0}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ml-auto active:scale-95 flex-shrink-0"
            title="Mirror buffering or slow? Click to automatically switch to the next best mirror."
          >
            <RefreshCw className="w-3 h-3 text-neutral-400" />
            <span className="hidden sm:inline">Mirror Slow?</span>
            <span>Switch</span>
          </button>

          {/* 4K Remux / Direct Stream Badge */}
          <div 
            onClick={() => {
              spatialAudio.playOpen();
              triggerHaptic('light');
              closeStream();
              openDownload(media, currentSeason, currentEpisode);
            }}
            title="Need guaranteed uncompressed 4K UHD Remux / 2160p HDR? Click to access 4K torrents, Debrid, and direct streams."
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium cursor-pointer hover:bg-amber-500/20 transition-all flex-shrink-0 active:scale-95"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span>4K HDR Vault</span>
          </div>
        </div>

        {/* Iframe Cinema Player */}
        <div 
          ref={playerContainerRef}
          className={`relative ${isFullscreen ? 'fixed inset-0 z-[100] w-screen h-screen bg-black' : 'aspect-video w-full bg-black'}`}
        >
          {streamUrl ? (
            <iframe
              key={iframeKey}
              src={streamUrl}
              title={media.name}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen={true}
              webkitallowfullscreen="true"
              mozallowfullscreen="true"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Connecting to streaming node...</span>
            </div>
          )}

          {/* Floating Fullscreen button inside player overlay for easy one-click access on mobile/TV */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              spatialAudio.playClick();
              toggleFullscreen();
            }}
            data-tv-focus="true"
            className="absolute bottom-3 right-3 z-20 p-2 rounded-xl bg-black/60 hover:bg-black/90 text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition-all cursor-pointer opacity-75 hover:opacity-100"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>

        {/* TV Series Episode Browser (If media.type === 'series') */}
        {media.type === 'series' && (
          <div className="p-3 sm:p-5 bg-[#0b0e1b] border-t border-slate-800/80 space-y-3 sm:space-y-4 max-h-64 sm:max-h-72 overflow-y-auto">
            
            {/* Season Selector Tabs */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Season:</span>
              {availableSeasons.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    spatialAudio.playClick();
                    triggerHaptic('light');
                    setCurrentSeason(s);
                    setCurrentEpisode(1);
                  }}
                  data-tv-focus="true"
                  tabIndex={0}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                    currentSeason === s
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  Season {s}
                </button>
              ))}
            </div>

            {/* Episode Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {currentSeasonEpisodes.length > 0 ? (
                currentSeasonEpisodes.map((ep) => {
                  const isCurrent = currentEpisode === ep.episode;
                  return (
                    <button
                      key={ep.episode}
                      onClick={() => {
                        spatialAudio.playClick();
                        triggerHaptic('medium');
                        setCurrentEpisode(ep.episode);
                      }}
                      data-tv-focus="true"
                      tabIndex={0}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-400 ${
                        isCurrent
                          ? 'bg-purple-600/40 border-purple-500 text-white font-bold'
                          : 'bg-[#121629] border-slate-800/80 text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <div className="text-[10px] uppercase tracking-wider text-purple-400 font-bold">
                        Ep {ep.episode}
                      </div>
                      <div className="text-xs truncate font-medium">
                        {ep.title || `Episode ${ep.episode}`}
                      </div>
                    </button>
                  );
                })
              ) : (
                Array.from({ length: 12 }, (_, i) => i + 1).map((epNum) => {
                  const isCurrent = currentEpisode === epNum;
                  return (
                    <button
                      key={epNum}
                      onClick={() => {
                        spatialAudio.playClick();
                        triggerHaptic('medium');
                        setCurrentEpisode(epNum);
                      }}
                      data-tv-focus="true"
                      tabIndex={0}
                      className={`p-2 rounded-xl text-center border transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-400 ${
                        isCurrent
                          ? 'bg-purple-600/40 border-purple-500 text-white font-bold'
                          : 'bg-[#121629] border-slate-800/80 text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-bold">Episode {epNum}</div>
                    </button>
                  );
                })
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
