import React, { useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Film, Bookmark, Download, Sparkles, Tv, Clapperboard, X, Flame, ArrowLeft } from 'lucide-react';

export default function Navbar() {
  const {
    activeTab,
    setActiveTab,
    goBack,
    canGoBack,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    openStream,
    openDownload,
    openDetails,
    watchlist,
    downloads,
    settings,
    setTheme
  } = useApp();

  const searchInputRef = useRef(null);

  // Keyboard shortcut: Press "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const themes = [
    { id: 'cyberpunk', name: 'Cyberpunk', color: '#8b5cf6' },
    { id: 'matrix', name: 'Matrix', color: '#10b981' },
    { id: 'crimson', name: 'Crimson', color: '#f43f5e' },
    { id: 'gold', name: 'Solar', color: '#f59e0b' },
    { id: 'ocean', name: 'Glacier', color: '#0284c7' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#07080d]/85 border-b border-purple-500/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Back Button */}
        <div className="flex items-center gap-3">
          {canGoBack && (
            <button
              onClick={goBack}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#111422] hover:bg-purple-600/25 border border-slate-800 hover:border-purple-500/40 text-slate-300 hover:text-purple-300 text-xs font-bold transition-all shadow-md group cursor-pointer"
              title="Go Back (or press ESC / Alt+Left)"
            >
              <ArrowLeft className="w-4 h-4 text-purple-400 group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}

          <div 
            onClick={() => { setActiveTab('home'); setSearchQuery(''); }}
            className="flex items-center gap-3 cursor-pointer group select-none flex-shrink-0"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[2px] shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-all duration-300">
              <div className="w-full h-full bg-[#090b14] rounded-2xl flex items-center justify-center">
                <Film className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center font-extrabold text-2xl tracking-tight">
                <span className="text-white">XEN</span>
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent ml-1">
                  MOVIES
                </span>
              </div>
              <div className="text-[10px] tracking-widest text-slate-400 uppercase font-semibold flex items-center gap-1">
                <span>Stream & Download</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Search Bar with Instant Results */}
        <div className="relative flex-1 max-w-xl hidden md:block">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies, TV shows, anime, Bollywood... (Press '/' to focus)"
              className="w-full bg-[#111422] border border-slate-800 focus:border-purple-500 rounded-full py-2.5 pl-11 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Dropdown Modal */}
          {searchQuery.trim() && (
            <div className="absolute top-12 left-0 right-0 bg-[#0d101d] border border-purple-500/30 rounded-2xl shadow-2xl shadow-black/80 max-h-96 overflow-y-auto z-50 p-2 divide-y divide-slate-800/60 backdrop-blur-2xl">
              {isSearching ? (
                <div className="py-8 text-center text-slate-400 flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Searching databases...</span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">
                  No movies or shows found for "{searchQuery}".
                </div>
              ) : (
                searchResults.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 flex items-center gap-3.5 hover:bg-purple-950/30 rounded-xl cursor-pointer transition-colors group"
                    onClick={() => {
                      openDetails(item);
                      setSearchQuery('');
                    }}
                  >
                    <img
                      src={item.poster || 'https://images.metahub.space/poster/small/default.jpg'}
                      alt={item.name}
                      className="w-12 h-16 object-cover rounded-lg bg-slate-800 flex-shrink-0"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100&q=80'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-100 text-sm truncate group-hover:text-purple-300 transition-colors">
                        {item.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                        <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                          {item.type || 'Media'}
                        </span>
                        {item.year && <span>{item.year}</span>}
                        {item.imdbRating && <span>⭐ {item.imdbRating}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openStream(item);
                          setSearchQuery('');
                        }}
                        className="px-2.5 py-1 text-xs rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium"
                      >
                        Stream
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDownload(item);
                          setSearchQuery('');
                        }}
                        className="px-2.5 py-1 text-xs rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right Action Icons & Theme Pill */}
        <div className="flex items-center gap-3">
          
          {/* Quick Nav Badges */}
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`relative p-2.5 rounded-xl border transition-all ${
              activeTab === 'watchlist' 
                ? 'bg-purple-600/20 border-purple-500 text-purple-300' 
                : 'bg-[#111422] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
            title="My Watchlist"
          >
            <Bookmark className="w-5 h-5" />
            {watchlist.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 bg-purple-500 text-white text-[10px] font-bold rounded-full">
                {watchlist.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('downloads')}
            className={`relative p-2.5 rounded-xl border transition-all ${
              activeTab === 'downloads' 
                ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300' 
                : 'bg-[#111422] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
            title="Download Queue"
          >
            <Download className="w-5 h-5" />
            {downloads.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 bg-cyan-500 text-white text-[10px] font-bold rounded-full">
                {downloads.length}
              </span>
            )}
          </button>

          {/* Visual Theme Selector Swatches */}
          <div className="hidden sm:flex items-center bg-[#111422] border border-slate-800 rounded-2xl p-1 gap-1">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                title={`${t.name} Theme`}
                className={`w-6 h-6 rounded-full transition-transform ${
                  settings.theme === t.id ? 'ring-2 ring-white scale-110 shadow-lg' : 'opacity-70 hover:opacity-100 hover:scale-105'
                }`}
                style={{ backgroundColor: t.color }}
              />
            ))}
          </div>

        </div>

      </div>
    </header>
  );
}

