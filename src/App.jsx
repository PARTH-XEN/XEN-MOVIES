import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { api } from './services/api';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import HeroBanner from './components/HeroBanner';
import MovieCard from './components/MovieCard';
import FilterBar from './components/FilterBar';
import StreamPlayerModal from './components/StreamPlayerModal';
import DownloadModal from './components/DownloadModal';
import MediaDetailsModal from './components/MediaDetailsModal';
import AuthModal from './components/AuthModal';
import WatchlistTab from './components/WatchlistTab';
import HistoryTab from './components/HistoryTab';
import DownloadsTab from './components/DownloadsTab';
import SettingsTab from './components/SettingsTab';
import StatsTab from './components/StatsTab';
import AboutTab from './components/AboutTab';
import CloudstreamTab from './components/CloudstreamTab';
import MobileDrawer from './components/MobileDrawer';
import ExitModal from './components/ExitModal';
import LogoutConfirmModal from './components/LogoutConfirmModal';
import ContinueWatchingRow from './components/ContinueWatchingRow';
import SpatialBackground from './components/SpatialBackground';
import ScrollProgressBar from './components/ScrollProgressBar';
import SpatialHUD from './components/SpatialHUD';
import SpatialSection from './components/SpatialSection';
import { useTVNavigation } from './hooks/useTVNavigation';
import { spatialAudio } from './utils/spatialAudio';
import { Flame, Sparkles, Tv, Film, ChevronRight, CheckCircle2, AlertTriangle, Info, X, Filter, Layers } from 'lucide-react';

function MainContent() {
  const { 
    activeTab, 
    setActiveTab, 
    selectedGenre, 
    setSelectedGenre, 
    toasts,
    theme,
    mobileDrawerOpen,
    openMobileDrawer,
    closeMobileDrawer
  } = useApp();
  const { isTV, tvModeActive, toggleTVMode } = useTVNavigation();

  const [trendingData, setTrendingData] = useState({ hero: [], trendingMovies: [], trendingSeries: [] });
  const [catalogItems, setCatalogItems] = useState([]);
  const [bollywoodItems, setBollywoodItems] = useState([]);
  const [homeFilteredItems, setHomeFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);

  // Load initial trending and featured items
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

  // When activeTab or selectedGenre changes
  useEffect(() => {
    if (activeTab === 'home') {
      if (selectedGenre !== 'all') {
        setFilterLoading(true);
        if (selectedGenre === 'bollywood') {
          api.getCatalog('movie', 'bollywood')
            .then(res => setHomeFilteredItems(res.items || []))
            .catch(console.error)
            .finally(() => setFilterLoading(false));
        } else {
          Promise.all([
            api.getCatalog('movie', selectedGenre).catch(() => ({ items: [] })),
            api.getCatalog('series', selectedGenre).catch(() => ({ items: [] }))
          ])
            .then(([moviesRes, seriesRes]) => {
              const movies = moviesRes.items || [];
              const series = seriesRes.items || [];
              // Interleave or combine movies and series
              setHomeFilteredItems([...movies, ...series]);
            })
            .finally(() => setFilterLoading(false));
        }
      } else {
        setHomeFilteredItems([]);
      }
    } else if (activeTab === 'movies') {
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
    <div className={`min-h-screen theme-app-root flex flex-col relative overflow-x-hidden theme-${theme || 'visionos'} ${tvModeActive ? 'tv-mode' : ''} ${['cyberpunk', 'cyberpunk-hud', 'synthwave', 'anime-arcade'].includes(theme) ? 'scanlines' : ''}`}>
      
      {/* 3D Spatial Holographic Background & Orbs */}
      <SpatialBackground />

      {/* Viewport Laser Scroll Progress Indicator */}
      <ScrollProgressBar />

      {/* Floating Spatial HUD Controls (Sound, Tilt, TV Mode, Themes, Top) */}
      <SpatialHUD isTV={isTV} tvMode={tvModeActive} onToggleTVMode={toggleTVMode} />

      {/* Top Navigation Bar */}
      <Navbar onOpenMenu={openMobileDrawer} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto relative z-10">
        {/* Sidebar (Desktop / Large Screens) */}
        <Sidebar />

        {/* Dynamic Main Body with Mobile Bottom Inset */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 space-y-8 sm:space-y-12 pb-28 lg:pb-10 max-w-full overflow-hidden">
          
          {/* HOME TAB */}
          {activeTab === 'home' && (
            <div className="space-y-10 sm:space-y-12">
              
              {/* Hero Banner Showcase with 3D Spatial Parallax */}
              <SpatialSection delay={0}>
                <HeroBanner items={trendingData.hero} />
              </SpatialSection>

              {/* Continue Watching Shelf (Personalized Video Progress) */}
              <SpatialSection delay={25}>
                <ContinueWatchingRow />
              </SpatialSection>

              {/* Genre Filter Bar */}
              <SpatialSection delay={50} className="space-y-2">
                <div className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-purple-400" />
                    <span>Spatial Filter Matrix</span>
                    {selectedGenre !== 'all' && (
                      <span className="text-purple-300 bg-purple-500/20 px-2 py-0.2 rounded-full border border-purple-500/30">
                        Active: {selectedGenre}
                      </span>
                    )}
                  </div>
                  <div className="h-[1px] flex-1 max-w-xs ml-3 bg-gradient-to-r from-purple-500/30 to-transparent hidden sm:block" />
                </div>
                <FilterBar />
              </SpatialSection>

              {/* WHEN GENRE FILTER IS ACTIVE ON HOME TAB */}
              {selectedGenre !== 'all' ? (
                <SpatialSection delay={100} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700/80">
                        <Film className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-semibold text-neutral-100 tracking-tight flex items-center gap-2">
                          <span className="capitalize">{selectedGenre} Collection</span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-400 border border-neutral-700/80">
                            {homeFilteredItems.length} Titles
                          </span>
                        </h2>
                        <p className="text-xs text-neutral-400">
                          Titles in {selectedGenre}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        spatialAudio.playClick();
                        setSelectedGenre('all');
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs font-medium text-neutral-300 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                  </div>

                  {filterLoading ? (
                    <div className="py-24 flex flex-col items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs text-neutral-400">
                        Filtering titles...
                      </span>
                    </div>
                  ) : homeFilteredItems.length === 0 ? (
                    <div className="py-20 text-center text-neutral-400 text-sm bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                      No titles found for {selectedGenre}. Try selecting another genre.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-5">
                      {homeFilteredItems.map((item, idx) => (
                        <MovieCard key={item.id} item={item} index={idx} />
                      ))}
                    </div>
                  )}
                </SpatialSection>
              ) : (
                /* NORMAL HOME SECTIONS (WHEN NO FILTER ACTIVE) */
                <>
                  {/* Trending Movies Row */}
                  <SpatialSection delay={100} className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700/80">
                          <Flame className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                          <h2 className="text-base sm:text-lg font-semibold text-neutral-100 tracking-tight flex items-center gap-2">
                            <span>Trending Titles</span>
                          </h2>
                          <p className="text-xs text-neutral-400">Popular movies and series</p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          spatialAudio.playClick();
                          setActiveTab('movies');
                        }}
                        onMouseEnter={() => spatialAudio.playHover(0.5)}
                        className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white font-medium transition-colors cursor-pointer group"
                      >
                        <span>View All</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-5">
                      {trendingData.trendingMovies.slice(0, 14).map((item, idx) => (
                        <MovieCard key={item.id} item={item} index={idx} />
                      ))}
                    </div>
                  </SpatialSection>

                  {/* Dual Audio & Hindi Specials */}
                  <SpatialSection delay={150}>
                    <section className="space-y-3 sm:space-y-4 p-4 sm:p-6 rounded-2xl bg-[#0f1118] border border-neutral-800 relative overflow-hidden">
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700/80">
                            <Film className="w-4 h-4 text-neutral-300" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h2 className="text-base sm:text-lg font-semibold text-neutral-100 tracking-tight">
                                Hindi & Dual Audio
                              </h2>
                            </div>
                            <p className="text-xs text-neutral-400">Multi-language audio tracks and direct downloads</p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            spatialAudio.playClick();
                            setActiveTab('bollywood');
                          }}
                          onMouseEnter={() => spatialAudio.playHover(0.5)}
                          className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white font-medium transition-colors cursor-pointer group"
                        >
                          <span>View All</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-5 relative z-10">
                        {bollywoodItems.slice(0, 7).map((item, idx) => (
                          <MovieCard key={item.id} item={item} index={idx} />
                        ))}
                      </div>
                    </section>
                  </SpatialSection>

                  {/* Top Binge-Worthy TV Series */}
                  <SpatialSection delay={200} className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 border border-neutral-700/80">
                          <Tv className="w-4 h-4 text-neutral-300" />
                        </div>
                        <div>
                          <h2 className="text-base sm:text-lg font-semibold text-neutral-100 tracking-tight">
                            TV Series & Seasons
                          </h2>
                          <p className="text-xs text-neutral-400">Full episodes and complete seasons</p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          spatialAudio.playClick();
                          setActiveTab('series');
                        }}
                        onMouseEnter={() => spatialAudio.playHover(0.5)}
                        className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white font-medium transition-colors cursor-pointer group"
                      >
                        <span>View All</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-5">
                      {trendingData.trendingSeries.slice(0, 14).map((item, idx) => (
                        <MovieCard key={item.id} item={item} index={idx} />
                      ))}
                    </div>
                  </SpatialSection>
                </>
              )}

            </div>
          )}

          {/* MOVIES TAB */}
          {activeTab === 'movies' && (
            <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-300">
              <div className="p-4 sm:p-5 rounded-2xl bg-[#0f1118] border border-neutral-800">
                <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5 tracking-tight">
                  <Film className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-200" />
                  <span>Feature Films</span>
                </h1>
                <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                  Stream online in high quality or download torrents in 4K UHD and 1080p.
                </p>
              </div>

              <FilterBar />

              {loading ? (
                <div className="py-24 flex flex-col items-center justify-center gap-3">
                  <div className="w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-neutral-400">Loading library...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-5">
                  {catalogItems.map((item, idx) => (
                    <MovieCard key={item.id} item={item} index={idx} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TV SERIES TAB */}
          {activeTab === 'series' && (
            <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-300">
              <div className="p-4 sm:p-5 rounded-2xl bg-[#0f1118] border border-neutral-800">
                <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5 tracking-tight">
                  <Tv className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-200" />
                  <span>TV Series</span>
                </h1>
                <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                  Full season guides, multiple streaming servers, and episode downloads.
                </p>
              </div>

              <FilterBar />

              {loading ? (
                <div className="py-24 flex flex-col items-center justify-center gap-3">
                  <div className="w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-neutral-400">Loading series...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-5">
                  {catalogItems.map((item, idx) => (
                    <MovieCard key={item.id} item={item} index={idx} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* BOLLYWOOD & DUAL AUDIO TAB */}
          {activeTab === 'bollywood' && (
            <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-300">
              <div className="p-4 sm:p-5 rounded-2xl bg-[#0f1118] border border-neutral-800">
                <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5 tracking-tight">
                  <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-200" />
                  <span>Hindi & Dual Audio Cinema</span>
                </h1>
                <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                  Direct downloads, multi-audio tracks, and high-efficiency HEVC rips.
                </p>
              </div>

              {loading ? (
                <div className="py-24 flex flex-col items-center justify-center gap-3">
                  <div className="w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-neutral-400">Loading titles...</span>
                </div>
              ) : bollywoodItems.length === 0 ? (
                <div className="py-24 text-center text-neutral-400 text-sm">
                  No Hindi or Dual Audio titles found.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-5">
                  {bollywoodItems.map((item, idx) => (
                    <MovieCard key={item.id} item={item} index={idx} />
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

          {/* CLOUDSTREAM REPO TAB */}
          {activeTab === 'cloudstream' && <CloudstreamTab />}

          {/* ABOUT US TAB */}
          {activeTab === 'about' && <AboutTab />}

          {/* STATS TAB */}
          {activeTab === 'stats' && <StatsTab />}

        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* Floating Spatial Mobile Navigation Bar (iOS & Android) */}
      <MobileNav onOpenMenu={openMobileDrawer} />

      {/* Slide-Up Mobile Spatial Hub Drawer */}
      <MobileDrawer isOpen={mobileDrawerOpen} onClose={closeMobileDrawer} />

      {/* Global Modals */}
      <StreamPlayerModal />
      <DownloadModal />
      <MediaDetailsModal />
      <AuthModal />
      <ExitModal />
      <LogoutConfirmModal />

      {/* Toast Notification Container */}
      <div className="fixed bottom-20 lg:bottom-5 left-3 sm:left-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl shadow-2xl backdrop-blur-2xl border text-xs font-bold animate-in slide-in-from-bottom-3 duration-300 ${
              t.type === 'success'
                ? 'bg-[#0e241b]/95 border-emerald-500/40 text-emerald-200 shadow-emerald-950/50'
                : t.type === 'error'
                ? 'bg-[#290e14]/95 border-red-500/40 text-red-200 shadow-red-950/50'
                : 'bg-[#12162a]/95 border-purple-500/40 text-purple-200 shadow-purple-950/50'
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
