import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { api } from './services/api';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import HeroBanner from './components/HeroBanner';
import MovieCard from './components/MovieCard';
import FilterBar from './components/FilterBar';
import StreamPlayerModal from './components/StreamPlayerModal';
import DownloadModal from './components/DownloadModal';
import MediaDetailsModal from './components/MediaDetailsModal';
import WatchlistTab from './components/WatchlistTab';
import HistoryTab from './components/HistoryTab';
import DownloadsTab from './components/DownloadsTab';
import SettingsTab from './components/SettingsTab';
import StatsTab from './components/StatsTab';
import { Flame, Sparkles, Tv, Film, ChevronRight, CheckCircle2, AlertTriangle, Info, Play, Download } from 'lucide-react';

function MainContent() {
  const { activeTab, setActiveTab, selectedGenre, toasts } = useApp();

  const [trendingData, setTrendingData] = useState({ hero: [], trendingMovies: [], trendingSeries: [] });
  const [catalogItems, setCatalogItems] = useState([]);
  const [bollywoodItems, setBollywoodItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load trending and featured items
  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getTrending().catch(() => ({ hero: [], trendingMovies: [], trendingSeries: [] })),
      api.getCatalog('movie', 'bollywood').catch(() => ({ items: [] }))
    ])
      .then(([trend, bolly]) => {
        setTrendingData(trend);
        if (bolly?.items) setBollywoodItems(bolly.items);
      })
      .finally(() => setLoading(false));
  }, []);

  // When activeTab or selectedGenre changes in Movies/Series
  useEffect(() => {
    if (activeTab === 'movies') {
      setLoading(true);
      api.getCatalog('movie', selectedGenre)
        .then(res => setCatalogItems(res.items || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (activeTab === 'series') {
      setLoading(true);
      api.getCatalog('series', selectedGenre)
        .then(res => setCatalogItems(res.items || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (activeTab === 'bollywood') {
      setLoading(true);
      api.getCatalog('movie', 'bollywood')
        .then(res => setBollywoodItems(res.items || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [activeTab, selectedGenre]);

  return (
    <div className="min-h-screen bg-[#07080d] flex flex-col">
      {/* Top Navigation */}
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar />

        {/* Dynamic Main Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-10">
          
          {/* HOME TAB */}
          {activeTab === 'home' && (
            <div className="space-y-10">
              
              {/* Hero Banner Showcase */}
              <HeroBanner items={trendingData.hero} />

              {/* Genre Filter Bar */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                  Quick Filter by Genre
                </div>
                <FilterBar />
              </div>

              {/* Trending Movies Row */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        Trending Movies
                      </h2>
                      <p className="text-xs text-slate-400">Popular hits streaming in 4K & Dual Audio</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('movies')}
                    className="flex items-center gap-1 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {trendingData.trendingMovies.slice(0, 12).map((item) => (
                    <MovieCard key={item.id} item={item} />
                  ))}
                </div>
              </section>

              {/* Dual Audio & Hindi Specials (Vegamovies / HDHub4u Special) */}
              <section className="space-y-4 p-6 rounded-3xl bg-gradient-to-r from-purple-950/20 via-[#0e1222] to-cyan-950/20 border border-cyan-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                          Hindi Dubbed & Dual Audio Specials
                        </h2>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hidden sm:inline">
                          Vegamovies Engine
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">Direct download in 480p, 720p, 1080p HEVC with Hindi audio</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('bollywood')}
                    className="flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <span>Explore All</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {bollywoodItems.slice(0, 6).map((item) => (
                    <MovieCard key={item.id} item={item} />
                  ))}
                </div>
              </section>

              {/* Top Binge-Worthy TV Series */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                      <Tv className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        Top TV Series & Web Shows
                      </h2>
                      <p className="text-xs text-slate-400">Complete seasons, episodes & direct download packs</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('series')}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {trendingData.trendingSeries.slice(0, 12).map((item) => (
                    <MovieCard key={item.id} item={item} />
                  ))}
                </div>
              </section>

            </div>
          )}

          {/* MOVIES TAB */}
          {activeTab === 'movies' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
                  <Film className="w-7 h-7 text-purple-400" />
                  <span>Browse Feature Films</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Stream online or download torrents in 4K UHD, 1080p, and 720p
                </p>
              </div>

              <FilterBar />

              {loading ? (
                <div className="py-24 flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {catalogItems.map((item) => (
                    <MovieCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TV SERIES TAB */}
          {activeTab === 'series' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
                  <Tv className="w-7 h-7 text-indigo-400" />
                  <span>TV Series & Web Shows</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Full season episode guides with multi-server streams and downloads
                </p>
              </div>

              <FilterBar />

              {loading ? (
                <div className="py-24 flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {catalogItems.map((item) => (
                    <MovieCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* BOLLYWOOD & DUAL AUDIO TAB */}
          {activeTab === 'bollywood' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
                  <Sparkles className="w-7 h-7 text-cyan-400" />
                  <span>Dual Audio & Hindi Cinema Hub</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  HDHub4u & Vegamovies style direct downloads and dual-audio streaming
                </p>
              </div>

              {loading ? (
                <div className="py-24 flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {bollywoodItems.map((item) => (
                    <MovieCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* WATCHLIST TAB */}
          {activeTab === 'watchlist' && <WatchlistTab />}

          {/* HISTORY TAB */}
          {activeTab === 'history' && <HistoryTab />}

          {/* DOWNLOADS TAB */}
          {activeTab === 'downloads' && <DownloadsTab />}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && <SettingsTab />}

          {/* STATS TAB */}
          {activeTab === 'stats' && <StatsTab />}

        </main>
      </div>

      {/* Global Modals */}
      <StreamPlayerModal />
      <DownloadModal />
      <MediaDetailsModal />

      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border text-xs font-semibold animate-slide-up ${
              t.type === 'success'
                ? 'bg-[#0e241b]/95 border-emerald-500/40 text-emerald-200'
                : t.type === 'error'
                ? 'bg-[#290e14]/95 border-red-500/40 text-red-200'
                : 'bg-[#12162a]/95 border-purple-500/40 text-purple-200'
            }`}
          >
            {t.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : t.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-purple-400 flex-shrink-0" />
            )}
            <span>{t.message}</span>
          </div>
        ))}
      </div>

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

