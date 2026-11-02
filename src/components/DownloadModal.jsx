import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { 
  X, 
  Download, 
  Play, 
  Copy, 
  Check, 
  HardDrive, 
  PackageCheck,
  FileArchive,
  FolderArchive,
  Layers,
  Sparkles,
  ArrowDownToLine,
  ArrowLeft
} from 'lucide-react';

export default function DownloadModal() {
  const { downloadModal, closeDownload, openStream, addToast, reloadData } = useApp();
  const { isOpen, media, season: initialSeason = 1, episode: initialEpisode = 1 } = downloadModal;

  const [activeTab, setActiveTab] = useState('all');
  const [downloadMode, setDownloadMode] = useState('batch'); // 'batch' | 'single' for series
  const [currentSeason, setCurrentSeason] = useState(initialSeason);
  const [currentEpisode, setCurrentEpisode] = useState(initialEpisode);
  const [loading, setLoading] = useState(true);
  const [zipping, setZipping] = useState(false);
  const [streamsData, setStreamsData] = useState({ 
    streams: [], 
    seasonPacks: [], 
    singleEpisodes: [],
    categorized: {}, 
    seasonBatchCategorized: {} 
  });
  const [copiedHash, setCopiedHash] = useState(null);

  useEffect(() => {
    if (!isOpen || !media) return;

    setLoading(true);
    setCurrentSeason(initialSeason || 1);
    setCurrentEpisode(initialEpisode || 1);
    setDownloadMode(media.type === 'series' ? 'batch' : 'single');

    api.getStreams(media.type || 'movie', media.id, initialSeason || 1, initialEpisode || 1)
      .then(res => {
        setStreamsData(res);
      })
      .catch(err => {
        console.error(err);
        addToast('Failed to load download streams', 'error');
      })
      .finally(() => {
        setLoading(false);
      });

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeDownload();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, media]);

  // When season changes or episode changes
  const handleSeasonEpisodeChange = (s, e, mode = downloadMode) => {
    setCurrentSeason(s);
    setCurrentEpisode(e);
    setLoading(true);
    api.getStreams('series', media.id, s, e)
      .then(res => setStreamsData(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  if (!isOpen || !media) return null;

  const handleCopyMagnet = (stream) => {
    if (!stream.magnet) return;
    navigator.clipboard.writeText(stream.magnet);
    setCopiedHash(stream.infoHash);
    addToast('Magnet Link copied to clipboard!', 'success');
    setTimeout(() => setCopiedHash(null), 2500);

    // Save to local downloads DB
    api.saveDownload({
      media_id: media.id,
      title: media.name || media.title,
      release_title: stream.releaseTitle,
      quality: stream.quality,
      size: stream.size,
      seeders: stream.seeders,
      magnet: stream.magnet,
      info_hash: stream.infoHash,
      status: stream.isSeasonBatch ? 'season_batch_magnet' : 'single_magnet'
    }).then(() => reloadData()).catch(console.error);
  };

  const handleLaunchTorrent = (stream) => {
    if (!stream.magnet) return;
    
    api.saveDownload({
      media_id: media.id,
      title: media.name || media.title,
      release_title: stream.releaseTitle,
      quality: stream.quality,
      size: stream.size,
      seeders: stream.seeders,
      magnet: stream.magnet,
      info_hash: stream.infoHash,
      status: stream.isSeasonBatch ? 'season_batch_launched' : 'launched_client'
    }).then(() => reloadData()).catch(console.error);

    addToast(
      stream.isSeasonBatch
        ? `Launching Complete Season ${currentSeason} Batch in Torrent Client...`
        : 'Launching in Torrent Client (qBittorrent / uTorrent / FDM)...', 
      'info'
    );
    window.location.href = stream.magnet;
  };

  // Download Season Batch as a real .ZIP file
  const handleDownloadSeasonZip = () => {
    setZipping(true);
    addToast(`Building Season ${currentSeason} Complete Batch ZIP archive...`, 'info');

    const zipUrl = api.getSeasonBatchZipUrl(media.id, currentSeason);
    
    // Create an invisible link to trigger browser download
    const link = document.createElement('a');
    link.href = zipUrl;
    link.download = `${media.name}_Season_${currentSeason}_Complete_Batch_Pack.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setZipping(false);
      addToast(`Season ${currentSeason} ZIP download started!`, 'success');
      reloadData();
    }, 1500);
  };

  const isSeries = media.type === 'series';
  const seasonPacks = streamsData.seasonPacks || [];
  const singleEpisodes = streamsData.singleEpisodes || [];
  const allStreams = streamsData.streams || [];
  const topSeasonPack = seasonPacks[0] || allStreams[0];

  // Determine which streams to show based on mode (batch vs single)
  let pool = allStreams;
  let categorizedPool = streamsData.categorized || {};

  if (isSeries) {
    if (downloadMode === 'batch') {
      pool = seasonPacks.length > 0 ? seasonPacks : allStreams;
      categorizedPool = streamsData.seasonBatchCategorized || streamsData.categorized || {};
    } else {
      pool = singleEpisodes.length > 0 ? singleEpisodes : allStreams;
      categorizedPool = streamsData.categorized || {};
    }
  }

  let displayedStreams = pool;
  if (activeTab === '4k') displayedStreams = categorizedPool.fourK || [];
  else if (activeTab === '1080p') displayedStreams = categorizedPool.tenEightyP || [];
  else if (activeTab === '720p') displayedStreams = categorizedPool.sevenTwentyP || [];
  else if (activeTab === '480p') displayedStreams = categorizedPool.fourEightyP || [];
  else if (activeTab === 'hindi') displayedStreams = categorizedPool.dualAudioHindi || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-3 sm:p-6 overflow-y-auto">
      
      {/* Modal Card */}
      <div className="relative w-full max-w-5xl bg-[#0a0d18] border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#111628] to-[#0d1020] border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={closeDownload}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer mr-1"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <img
              src={media.poster || 'https://images.metahub.space/poster/small/default.jpg'}
              alt={media.name}
              className="w-14 h-20 object-cover rounded-xl border border-cyan-500/20 shadow-lg flex-shrink-0"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100&q=80'; }}
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Vegamovies / HDHub4u Engine
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {media.year} • {isSeries ? 'Series' : 'Movie'}
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                {media.name} — Direct Download Hub
              </h2>
              <p className="text-xs text-slate-400 hidden sm:block">
                {isSeries 
                  ? `Whole Season Batch ZIP packs & multi-quality downloads for Season ${currentSeason}` 
                  : '4K, 1080p, 720p & Dual Audio magnets with seed health indicators.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                closeDownload();
                openStream(media, currentSeason, currentEpisode);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-purple-300" />
              <span>Stream Instead</span>
            </button>

            <button
              onClick={closeDownload}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TV Series: Season Batch ZIP Banner & Episode Selectors */}
        {isSeries && (
          <div className="space-y-0">
            {/* Whole Season ZIP Download Showcase Card */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-950/40 via-[#101426] to-cyan-950/40 border-b border-cyan-500/30 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 p-0.5 shadow-lg shadow-purple-600/25 flex-shrink-0">
                  <div className="w-full h-full bg-[#0a0d18] rounded-2xl flex items-center justify-center">
                    <FileArchive className="w-5 h-5 text-cyan-400" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black text-white">
                      Download Whole Season {currentSeason} on a ZIP File
                    </h3>
                    <span className="text-[10px] font-extrabold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-full">
                      All Episodes ZIP
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Bundles 1-click batch launcher, complete season torrents, all episode shortcuts, and offline player portal into one <strong>.zip file</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={handleDownloadSeasonZip}
                  disabled={zipping}
                  className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-xl shadow-purple-600/30 hover:scale-105 transition-all duration-200"
                >
                  <ArrowDownToLine className={`w-4 h-4 ${zipping ? 'animate-bounce' : ''}`} />
                  <span>{zipping ? 'Building ZIP Archive...' : `Download Season ${currentSeason} ZIP`}</span>
                </button>

                {topSeasonPack && (
                  <button
                    onClick={() => handleLaunchTorrent(topSeasonPack)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#141829] hover:bg-[#1f253f] border border-cyan-500/40 text-cyan-300 font-semibold text-xs transition-colors"
                    title="Download all episodes into a single folder in your torrent client"
                  >
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span>Launch Season Batch Torrent</span>
                  </button>
                )}
              </div>
            </div>

            {/* Mode Switcher: Full Season Batch Packs vs Single Episodes */}
            <div className="px-6 py-3 bg-[#0d1020] border-b border-slate-800 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Download Mode:</span>
                <div className="flex items-center bg-[#131728] p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setDownloadMode('batch')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      downloadMode === 'batch'
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <PackageCheck className="w-3.5 h-3.5" />
                    <span>Whole Season Batch ({seasonPacks.length})</span>
                  </button>

                  <button
                    onClick={() => setDownloadMode('single')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      downloadMode === 'single'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Single Episode</span>
                  </button>
                </div>
              </div>

              {/* Season & Episode selectors */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-400 uppercase">Season:</span>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={currentSeason}
                    onChange={(e) => handleSeasonEpisodeChange(parseInt(e.target.value, 10) || 1, currentEpisode)}
                    className="w-14 bg-[#161a2e] border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {downloadMode === 'single' && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-400 uppercase">Episode:</span>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={currentEpisode}
                      onChange={(e) => handleSeasonEpisodeChange(currentSeason, parseInt(e.target.value, 10) || 1)}
                      className="w-14 bg-[#161a2e] border border-slate-700 rounded-lg px-2 py-1 text-xs text-white text-center font-bold focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quality Category Tabs (Vegamovies / HDHub4u signature) */}
        <div className="px-6 py-3 bg-[#090b14] border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none select-none">
          {[
            { id: 'all', label: `All Links (${pool.length})` },
            { id: '4k', label: `🌟 4K Ultra HD (${categorizedPool.fourK?.length || 0})` },
            { id: '1080p', label: `💎 1080p Full HD (${categorizedPool.tenEightyP?.length || 0})` },
            { id: '720p', label: `⚡ 720p HD (${categorizedPool.sevenTwentyP?.length || 0})` },
            { id: '480p', label: `📱 480p SD (${categorizedPool.fourEightyP?.length || 0})` },
            { id: 'hindi', label: `🇮🇳 Hindi / Dual Audio (${categorizedPool.dualAudioHindi?.length || 0})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30'
                  : 'bg-[#121626] text-slate-400 hover:text-slate-200 hover:bg-[#1a2037] border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Links List Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-slate-400 font-medium">
                Querying multi-trackers (1337x, YTS, TorrentGalaxy, Rutracker)...
              </span>
            </div>
          ) : displayedStreams.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <PackageCheck className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-slate-300 font-semibold">No streams found in this category.</p>
              <div className="flex items-center justify-center gap-3">
                {isSeries && downloadMode === 'batch' && (
                  <button
                    onClick={handleDownloadSeasonZip}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                  >
                    📦 Generate Season {currentSeason} ZIP Anyway
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('all')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs"
                >
                  View All Links
                </button>
              </div>
            </div>
          ) : (
            displayedStreams.map((stream, idx) => {
              const isCopied = copiedHash === stream.infoHash;
              return (
                <div
                  key={stream.infoHash || idx}
                  className="p-4 rounded-2xl bg-[#0f1222] border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
                >
                  
                  {/* Left: Release Info */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    
                    {/* Badges: Batch vs Single, Quality, Codec, Audio */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {stream.isSeasonBatch && (
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                          <PackageCheck className="w-3 h-3" />
                          <span>Complete Season Batch</span>
                        </span>
                      )}

                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        stream.quality === '4K UHD' 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}>
                        {stream.quality}
                      </span>

                      {stream.size && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-slate-300 bg-slate-800/90 px-2 py-0.5 rounded">
                          <HardDrive className="w-3 h-3 text-cyan-400" />
                          <span>{stream.size}</span>
                        </span>
                      )}

                      {stream.seeders > 0 && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span>{stream.seeders} Seeds</span>
                        </span>
                      )}

                      {stream.isHindi && (
                        <span className="text-[10px] font-extrabold bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2 py-0.5 rounded">
                          Dual Audio / Hindi 🇮🇳
                        </span>
                      )}

                      {stream.codecs?.map((c) => (
                        <span key={c} className="text-[10px] text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded">
                          {c}
                        </span>
                      ))}

                      <span className="text-[10px] text-slate-500">
                        via {stream.tracker}
                      </span>
                    </div>

                    {/* Release File Name */}
                    <div className="font-semibold text-slate-100 text-xs sm:text-sm break-all group-hover:text-cyan-300 transition-colors">
                      {stream.releaseTitle}
                    </div>

                  </div>

                  {/* Right Action Buttons */}
                  <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
                    
                    {/* Primary Button: 1-Click Launch Torrent Client */}
                    <button
                      onClick={() => handleLaunchTorrent(stream)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-600/30 hover:scale-105 transition-all"
                      title={stream.isSeasonBatch ? "Download all episodes in torrent client" : "Launch in Desktop Torrent Client"}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{stream.isSeasonBatch ? 'Download Batch Pack' : 'Start Download'}</span>
                    </button>

                    {/* Copy Magnet Link */}
                    <button
                      onClick={() => handleCopyMagnet(stream)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#161a2e] hover:bg-[#1d223c] border border-slate-700 text-slate-300 text-xs font-medium transition-colors"
                      title="Copy Magnet Link"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Copied!' : 'Copy Magnet'}</span>
                    </button>

                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Footer Note */}
        <div className="p-4 bg-[#070912] border-t border-slate-900 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
          <span>
            {isSeries 
              ? 'Complete season packs download all episodes into one organized directory in your torrent client.' 
              : 'Clicking "Start Download" directly sends magnet to your Windows Torrent app (qBittorrent / FDM).'}
          </span>
          <span className="text-cyan-400 font-semibold">100% Free • Unlimited Bandwidth</span>
        </div>

      </div>

    </div>
  );
}
