import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { X, Server, Download, ChevronRight, Layers, Maximize, AlertCircle, Smartphone, Cloud, Copy, ArrowLeft } from 'lucide-react';

export default function StreamPlayerModal() {
  const { streamModal, closeStream, openDownload, settings, addToast } = useApp();
  const { isOpen, media, season: initialSeason = 1, episode: initialEpisode = 1 } = streamModal;

  const [activeServer, setActiveServer] = useState('vidlink');
  const [currentSeason, setCurrentSeason] = useState(initialSeason);
  const [currentEpisode, setCurrentEpisode] = useState(initialEpisode);
  const [servers, setServers] = useState([]);
  const [metaDetails, setMetaDetails] = useState(null);
  const [theaterMode, setTheaterMode] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    if (!isOpen || !media) return;

    setCurrentSeason(initialSeason || 1);
    setCurrentEpisode(initialEpisode || 1);

    // Load available servers
    api.getEmbeds(media.type || 'movie', media.id, initialSeason || 1, initialEpisode || 1)
      .then(res => {
        if (res.servers) setServers(res.servers);
      })
      .catch(console.error);

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
      season: media.type === 'series' ? (initialSeason || 1) : null,
      episode: media.type === 'series' ? (initialEpisode || 1) : null,
      progress_percent: 15,
      progress_seconds: 300,
      duration_seconds: 7200
    }).catch(console.error);

    // Close on Escape key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeStream();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, media]);

  // Update server embed URLs when season/episode changes
  useEffect(() => {
    if (!media) return;
    api.getEmbeds(media.type || 'movie', media.id, currentSeason, currentEpisode)
      .then(res => {
        if (res.servers) setServers(res.servers);
        setIframeKey(k => k + 1);
      })
      .catch(console.error);

    if (media.type === 'series') {
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
    addToast('Opening Cloudstream App & Copied Stream Link!', 'success');
    window.location.href = deepLink;
  };

  if (!isOpen || !media) return null;

  const currentServerObj = servers.find(s => s.id === activeServer) || servers[0];
  const streamUrl = currentServerObj?.url || '';

  // Get current season episodes if series
  const seasonsMap = metaDetails?.seasonsData || {};
  const currentSeasonEpisodes = seasonsMap[currentSeason] || [];
  const availableSeasons = metaDetails?.seasonsList || [1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-2 sm:p-4 overflow-y-auto">
      
      {/* Modal Container */}
      <div className={`relative w-full ${theaterMode ? 'max-w-7xl' : 'max-w-6xl'} bg-[#0a0d18] border border-purple-500/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300`}>
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#0e1222] border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={closeStream}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer mr-1"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="w-3 h-3 rounded-full bg-red-500/80 animate-pulse"></div>
            <div>
              <h2 className="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-2">
                <span>{media.name}</span>
                {media.type === 'series' && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                    S{currentSeason} : E{currentEpisode}
                  </span>
                )}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenCloudstream}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-colors"
              title="Open in Cloudstream 3 (Android / PC)"
            >
              <Smartphone className="w-3.5 h-3.5 text-purple-400" />
              <span>Cloudstream</span>
            </button>

            <button
              onClick={() => {
                closeStream();
                openDownload(media, currentSeason, currentEpisode);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Links</span>
            </button>

            <button
              onClick={() => setTheaterMode(!theaterMode)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors hidden sm:block"
              title={theaterMode ? 'Exit Theater Mode' : 'Theater Mode'}
            >
              <Maximize className="w-4 h-4" />
            </button>

            <button
              onClick={closeStream}
              className="p-2 rounded-xl bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Server Switcher Bar */}
        <div className="px-5 py-2.5 bg-[#080a14] border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none select-none">
          <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 mr-2 flex-shrink-0 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded-xl">
            <Cloud className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Cloudstream Engine:</span>
          </div>

          {servers.map((s) => {
            const isCurrent = (activeServer === s.id) || (!activeServer && s.id === 'vidlink');
            return (
              <button
                key={s.id}
                onClick={() => {
                  setActiveServer(s.id);
                  setIframeKey(k => k + 1);
                  addToast(`Switched to ${s.name}`, 'info');
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isCurrent
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40 font-bold'
                    : 'bg-[#121626] text-slate-400 hover:text-slate-200 hover:bg-[#1a2037] border border-slate-800'
                }`}
              >
                <span>{s.name}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded ${
                  isCurrent ? 'bg-purple-800 text-purple-200' : 'bg-slate-800 text-slate-400'
                }`}>
                  {s.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Iframe Cinema Player */}
        <div className="relative aspect-video w-full bg-black">
          {streamUrl ? (
            <iframe
              key={iframeKey}
              src={streamUrl}
              title={media.name}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Connecting to streaming node...</span>
            </div>
          )}
        </div>

        {/* TV Series Episode Browser (If media.type === 'series') */}
        {media.type === 'series' && (
          <div className="p-5 bg-[#0b0e1b] border-t border-slate-800/80 space-y-4 max-h-72 overflow-y-auto">
            
            {/* Season Selector Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Season:</span>
              {availableSeasons.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setCurrentSeason(s);
                    setCurrentEpisode(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    currentSeason === s
                      ? 'bg-purple-600 text-white font-bold'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Season {s}
                </button>
              ))}
            </div>

            {/* Episodes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {currentSeasonEpisodes.length > 0 ? (
                currentSeasonEpisodes.map((ep) => {
                  const isCurrent = ep.episode === currentEpisode;
                  return (
                    <div
                      key={ep.id || ep.episode}
                      onClick={() => setCurrentEpisode(ep.episode)}
                      className={`p-2 rounded-xl cursor-pointer transition-all border ${
                        isCurrent
                          ? 'bg-purple-600/20 border-purple-500 shadow-md shadow-purple-900/30 ring-1 ring-purple-500'
                          : 'bg-[#121626] border-slate-800/80 hover:border-slate-700 hover:bg-[#181d33]'
                      }`}
                    >
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900 mb-1.5">
                        <img
                          src={ep.thumbnail || media.background || media.poster}
                          alt={ep.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = media.poster; }}
                        />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-black/80 text-purple-300">
                          EP {ep.episode}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-slate-200 truncate">
                        {ep.name || `Episode ${ep.episode}`}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-4 text-center text-xs text-slate-500">
                  Episodes list loading or direct server navigation enabled inside player.
                </div>
              )}
            </div>

          </div>
        )}

        {/* Adblocker / Tips Footer Notice */}
        <div className="px-5 py-2.5 bg-[#070912] border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tip: If a server buffers or stops, click any other server tab above for instant backup!</span>
          </div>
          <span className="text-slate-400 hidden sm:inline">Press ESC to exit</span>
        </div>

      </div>

    </div>
  );
}

