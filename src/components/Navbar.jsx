import React, { useRef, useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { spatialAudio } from '../utils/spatialAudio';
import { triggerHaptic } from '../utils/haptics';
import { 
  Search, Film, Bookmark, Download, Sparkles, Tv, Clapperboard, X, 
  Flame, ArrowLeft, LogIn, LogOut, User, Smartphone, Info, Menu,
  Palette, Monitor, Compass, Gamepad2, Check
} from 'lucide-react';

export default function Navbar({ onOpenMenu = () => {} }) {
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
    theme,
    settings,
    setTheme,
    user,
    openAuthModal,
    logoutUser
  } = useApp();

  const searchInputRef = useRef(null);
  const mobileInputRef = useRef(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Keyboard shortcut: Press "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current && document.activeElement !== mobileInputRef.current) {
        e.preventDefault();
        spatialAudio.playHover(0);
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const themeDropdownRef = useRef(null);

  const themes = [
    { id: 'visionos', name: 'VisionOS Spatial', subtitle: 'Spatial 3D Glass', color: '#6366f1', icon: Sparkles },
    { id: 'netflix', name: 'Netflix Cinema', subtitle: 'Obsidian Dark', color: '#E50914', icon: Tv },
    { id: 'cyberpunk', name: 'Cyberpunk 2077', subtitle: 'Sci-Fi HUD Aesthetic', color: '#00f0ff', icon: Monitor },
    { id: 'nordic', name: 'Nordic Minimal', subtitle: 'Clean Zen Monochrome', color: '#eceff4', icon: Compass },
    { id: 'synthwave', name: 'Anime Synthwave', subtitle: 'Arcade Retro Glow', color: '#ff71ce', icon: Gamepad2 }
  ];

  const currentThemeObj = themes.find(t => t.id === theme) || themes[0];

  // Close theme dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(e.target)) {
        setThemeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full spatial-glass border-b border-white/10 backdrop-blur-2xl transition-all duration-300 pt-[env(safe-area-inset-top)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Brand Logo & Back Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {canGoBack && (
            <button
              onClick={() => {
                spatialAudio.playClick();
                triggerHaptic('light');
                goBack();
              }}
              onMouseEnter={() => spatialAudio.playHover(-0.5)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-purple-600/25 border border-white/10 hover:border-purple-500/40 text-slate-300 hover:text-purple-300 text-xs font-bold transition-all shadow-md group cursor-pointer"
              title="Go Back"
            >
              <ArrowLeft className="w-4 h-4 text-purple-400 group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}

          <div 
            onClick={() => {
              spatialAudio.playClick();
              triggerHaptic('light');
              setActiveTab('home');
              setSearchQuery('');
            }}
            onMouseEnter={() => spatialAudio.playHover(-0.3)}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none flex-shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-neutral-900 border border-neutral-800 group-hover:border-[var(--color-accent)] flex items-center justify-center shadow-md transition-all duration-500 logo-animated-badge group-hover:scale-110">
              <Film className="w-5 h-5 text-[var(--color-accent)] transition-transform duration-700 ease-in-out group-hover:rotate-[360deg] group-hover:scale-125" />
            </div>
            <div>
              <div className="flex items-center font-bold text-lg sm:text-xl tracking-tight leading-none group-hover:brightness-125 transition-all">
                <span className="text-white">XEN</span>
                <span className="text-[var(--color-accent)] ml-1 font-semibold transition-colors duration-300">
                  {theme === 'netflix' ? 'CINEMA' : theme === 'cyberpunk' ? 'CYBER' : theme === 'nordic' ? 'MINIMAL' : theme === 'synthwave' ? 'SYNTH' : 'MOVIES'}
                </span>
              </div>
              <div className="text-[10px] tracking-wider text-neutral-400 uppercase font-medium mt-0.5 flex items-center gap-1">
                <span>{theme === 'cyberpunk' ? 'HUD_2077' : theme === 'netflix' ? 'Obsidian 4K' : theme === 'synthwave' ? 'Arcade Synth' : theme === 'nordic' ? 'Zen Stream' : 'Cinema UI v4.0'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Live Search Bar */}
        <div className="relative flex-1 max-w-xl mx-2 sm:mx-6 hidden md:block">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              name="search"
              id="search-desktop"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies, TV shows, anime... (Press '/' to focus)"
              className="w-full bg-[#11131c] border border-neutral-800 focus:border-neutral-600 rounded-xl py-2 pl-10 pr-9 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-600 transition-colors shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  spatialAudio.playClick();
                  setSearchQuery('');
                }}
                className="absolute right-3 text-neutral-400 hover:text-white cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Dropdown Modal - Wide, clear, unclipped */}
          {searchQuery.trim() && (
            <div className="absolute top-12 left-0 w-full min-w-[420px] lg:min-w-[520px] bg-[#11131a] border border-neutral-800 rounded-2xl shadow-2xl shadow-black/90 max-h-[28rem] overflow-y-auto overflow-x-hidden z-50 p-2 divide-y divide-white/[0.04] backdrop-blur-xl">
              {isSearching ? (
                <div className="py-8 text-center text-neutral-400 flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Searching titles...</span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-8 text-center text-neutral-400 text-sm">
                  No titles found for "{searchQuery}".
                </div>
              ) : (
                searchResults.map((item) => (
                  <div
                    key={item.id}
                    onMouseEnter={() => spatialAudio.playHover(0)}
                    className="p-2 flex items-center gap-3 hover:bg-neutral-800/60 rounded-xl cursor-pointer transition-colors group"
                    onClick={() => {
                      spatialAudio.playClick();
                      triggerHaptic('light');
                      openDetails(item);
                      setSearchQuery('');
                    }}
                  >
                    <img
                      src={item.poster || 'https://images.metahub.space/poster/small/default.jpg'}
                      alt={item.name}
                      className="w-11 h-15 object-cover rounded-md bg-neutral-900 flex-shrink-0"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100&q=80'; }}
                    />
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="font-semibold text-neutral-100 text-sm truncate group-hover:text-amber-400 transition-colors">
                        {item.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-neutral-400">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 font-medium">
                          {item.type === 'series' ? 'TV' : 'Movie'}
                        </span>
                        {item.year && <span>{item.year}</span>}
                        {item.imdbRating && (
                          <span className="text-amber-400 font-medium flex items-center gap-0.5">
                            ★ {item.imdbRating}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          spatialAudio.playOpen();
                          triggerHaptic('medium');
                          openStream(item);
                          setSearchQuery('');
                        }}
                        className="px-2.5 py-1 text-xs rounded-lg bg-white text-neutral-950 hover:bg-neutral-200 font-semibold cursor-pointer transition-colors"
                      >
                        Stream
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          spatialAudio.playOpen();
                          triggerHaptic('light');
                          openDownload(item);
                          setSearchQuery('');
                        }}
                        className="px-2.5 py-1 text-xs rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium border border-neutral-700 cursor-pointer transition-colors"
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

        {/* Right Action Icons (Mobile Search & Quick Nav) */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Mobile Search Button (iPhone / Android) */}
          <button
            onClick={() => {
              spatialAudio.playClick();
              triggerHaptic('light');
              setMobileSearchOpen(!mobileSearchOpen);
              setTimeout(() => mobileInputRef.current?.focus(), 150);
            }}
            className="md:hidden p-2 rounded-xl bg-neutral-800/80 border border-neutral-700/80 text-neutral-300 hover:text-white cursor-pointer"
            title="Search"
          >
            <Search className="w-5 h-5 text-neutral-300" />
          </button>

          {/* Quick Nav Badges (Desktop) */}
          <button
            onClick={() => {
              spatialAudio.playClick();
              triggerHaptic('light');
              setActiveTab('watchlist');
            }}
            onMouseEnter={() => spatialAudio.playHover(0.4)}
            className={`hidden sm:flex relative p-2 rounded-xl border transition-all cursor-pointer ${
              activeTab === 'watchlist' 
                ? 'bg-neutral-800 border-neutral-600 text-white' 
                : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
            }`}
            title="My Watchlist"
          >
            <Bookmark className="w-4 h-4" />
            {watchlist.length > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-amber-500 text-neutral-950 text-[10px] font-bold rounded-full">
                {watchlist.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              spatialAudio.playClick();
              triggerHaptic('light');
              setActiveTab('downloads');
            }}
            onMouseEnter={() => spatialAudio.playHover(0.5)}
            className={`hidden sm:flex relative p-2 rounded-xl border transition-all cursor-pointer ${
              activeTab === 'downloads' 
                ? 'bg-neutral-800 border-neutral-600 text-white' 
                : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
            }`}
            title="Download Queue"
          >
            <Download className="w-4 h-4" />
            {downloads.length > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-neutral-200 text-neutral-950 text-[10px] font-bold rounded-full">
                {downloads.length}
              </span>
            )}
          </button>

          {/* Theme Options Selector from User Showcase */}
          <div className="relative" ref={themeDropdownRef}>
            <button
              onClick={() => {
                spatialAudio.playClick();
                triggerHaptic('light');
                setThemeDropdownOpen(!themeDropdownOpen);
              }}
              className="flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold rounded-full bg-[var(--color-accent-soft)] hover:bg-[var(--color-accent)]/25 text-white border border-[var(--color-accent)]/40 shadow-lg transition-all cursor-pointer"
              title="Change Theme & Visual UI Style"
            >
              <Palette className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              <span className="hidden md:inline font-bold uppercase tracking-wider text-[11px]">THEME</span>
              <span className="bg-black/60 px-2 py-0.5 rounded-full text-[10px] font-mono text-[var(--color-accent)] border border-white/10">
                {currentThemeObj?.name?.split(' ')[0] || 'Theme'}
              </span>
            </button>

            {/* Dropdown 5-Theme Cards Panel */}
            {themeDropdownOpen && (
              <div className="absolute right-0 top-12 w-[310px] sm:w-[440px] p-3.5 sm:p-4 rounded-2xl bg-[#0b0d14]/95 border border-[var(--color-accent)]/40 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
                    <span className="text-xs font-bold uppercase tracking-widest text-white">Visual Interface Style</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono">5 Presets</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {themes.map((t) => {
                    const Icon = t.icon;
                    const isSelected = (theme || 'visionos') === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          spatialAudio.playClick();
                          triggerHaptic('selection');
                          setTheme(t.id);
                          setThemeDropdownOpen(false);
                        }}
                        className={`text-left p-2.5 sm:p-3 rounded-xl border transition-all flex flex-col justify-between cursor-pointer group ${
                          isSelected
                            ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] shadow-lg'
                            : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <Icon className="w-4 h-4" style={{ color: t.color }} />
                          <span
                            className={`w-2 h-2 rounded-full transition-opacity ${
                              isSelected ? 'opacity-100 ring-2 ring-white/50' : 'opacity-30'
                            }`}
                            style={{ backgroundColor: t.color }}
                          />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center justify-between">
                            <span>{t.name}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[var(--color-accent)]" />}
                          </div>
                          <div className="text-[10px] text-neutral-400 mt-0.5 font-medium">
                            {t.subtitle}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* User Sign In / Profile Badge */}
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-2 border-l border-neutral-800">
              <div 
                className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-neutral-900 border border-neutral-800"
                title={`Signed in as ${user.email}`}
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name || user.email || 'User')}`}
                  alt={user.name || user.email || 'User'}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="text-xs font-medium text-neutral-200 max-w-[90px] truncate hidden sm:inline">
                  {(user?.name || user?.email || 'User').split(' ')[0]}
                </span>
              </div>
              <button
                onClick={() => {
                  spatialAudio.playClick();
                  logoutUser();
                }}
                title="Sign Out"
                className="p-1.5 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                spatialAudio.playClick();
                triggerHaptic('light');
                openAuthModal('login');
              }}
              onMouseEnter={() => spatialAudio.playHover(0.5)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-neutral-950 hover:bg-neutral-200 font-semibold text-xs active:scale-95 transition-all cursor-pointer select-none"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Hub Menu Button */}
          <button
            onClick={() => {
              spatialAudio.playClick();
              triggerHaptic('light');
              onOpenMenu();
            }}
            className="lg:hidden p-2 rounded-2xl bg-white/[0.06] hover:bg-white/10 border border-white/10 text-cyan-300 active:scale-95 cursor-pointer ml-0.5"
            title="Open Hub Menu"
          >
            <Menu className="w-4 h-4" />
          </button>

        </div>

      </div>

      {/* Mobile Full-Width Search Overlay (iOS & Android) */}
      {mobileSearchOpen && (
        <div className="md:hidden p-3 bg-neutral-950 border-t border-neutral-800 animate-in slide-in-from-top-2 duration-200">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              ref={mobileInputRef}
              type="text"
              name="search"
              id="search-mobile"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cinema, series, anime, Hindi dub..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2 pl-9 pr-9 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
            />
            <button
              onClick={() => {
                setMobileSearchOpen(false);
                setSearchQuery('');
              }}
              className="absolute right-3 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Live Results */}
          {searchQuery.trim() && (
            <div className="mt-2 max-h-80 overflow-y-auto divide-y divide-white/5 rounded-xl bg-neutral-900 border border-neutral-800 p-1">
              {isSearching ? (
                <div className="py-6 text-center text-xs text-neutral-400">Searching...</div>
              ) : searchResults.length === 0 ? (
                <div className="py-6 text-center text-xs text-neutral-400">No titles found.</div>
              ) : (
                searchResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      openDetails(item);
                      setMobileSearchOpen(false);
                    }}
                    className="p-2 flex items-center gap-2.5 active:bg-neutral-800 rounded-lg"
                  >
                    <img
                      src={item.poster || 'https://images.metahub.space/poster/small/default.jpg'}
                      alt={item.name}
                      className="w-9 h-12 object-cover rounded bg-neutral-800"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{item.name}</div>
                      <div className="text-[10px] text-neutral-400">{item.year} • {item.type}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
