import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  // User Authentication State
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'signup'

  // UI Mode (5 distinct aesthetic visual interfaces)
  const [uiMode, setUiModeState] = useState(() => {
    try {
      return localStorage.getItem('xen_ui_mode') || 'vision-spatial';
    } catch (e) {
      return 'vision-spatial';
    }
  });

  // Active Accent Theme (5 vibrant color schemes)
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem('xen_theme') || 'cyberpunk';
    } catch (e) {
      return 'cyberpunk';
    }
  });

  // Navigation & Browsing State
  const [activeTab, setActiveTabState] = useState('home');
  const [tabHistory, setTabHistory] = useState(['home']);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Modals state
  const [streamModal, setStreamModal] = useState({ isOpen: false, media: null, season: 1, episode: 1 });
  const [downloadModal, setDownloadModal] = useState({ isOpen: false, media: null, season: 1, episode: 1 });
  const [detailsModal, setDetailsModal] = useState({ isOpen: false, media: null });
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Persistent User Data from Database
  const [watchlist, setWatchlist] = useState([]);
  const [history, setHistory] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [settings, setSettings] = useState({
    theme: 'cyberpunk',
    ui_mode: 'vision-spatial',
    preferred_server: '2embed',
    preferred_quality: '1080p',
    preferred_audio: 'dual_audio',
    auto_play_next: 'true',
    torrent_client_action: 'open_magnet'
  });
  const [stats, setStats] = useState({
    historyCount: 0,
    watchlistCount: 0,
    downloadsCount: 0,
    totalHoursWatched: 0
  });

  // Toast Notification System
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  };

  // Auth Modal Controls
  const openAuthModal = (mode = 'login') => {
    if (typeof window !== 'undefined') {
      window.history.pushState({ xen: 'auth' }, '');
    }
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const loginUser = (token, userData) => {
    try {
      localStorage.setItem('xen_token', token);
      localStorage.setItem('xen_user', JSON.stringify(userData));
    } catch (e) {}
    setUser(userData);
    setIsAuthModalOpen(false);
    reloadData();
    addToast(`Welcome back, ${userData?.name || 'User'}! Your private library is loaded.`, 'success');
  };

  const requestLogout = () => {
    if (!user) return;
    if (typeof window !== 'undefined') {
      window.history.pushState({ xen: 'logout' }, '');
    }
    setIsLogoutConfirmOpen(true);
  };

  const cancelLogout = () => {
    setIsLogoutConfirmOpen(false);
  };

  const confirmLogout = () => {
    setIsLogoutConfirmOpen(false);
    try {
      localStorage.removeItem('xen_token');
      localStorage.removeItem('xen_user');
    } catch (e) {}
    setUser(null);
    reloadData();
    addToast('Signed out successfully. Switched to guest mode.', 'info');
  };

  const logoutUser = (force = false) => {
    if (force === true) {
      confirmLogout();
    } else {
      requestLogout();
    }
  };

  // UI Mode switcher
  const setUiMode = (mode) => {
    setUiModeState(mode);
    try {
      localStorage.setItem('xen_ui_mode', mode);
      document.documentElement.setAttribute('data-ui-mode', mode);
    } catch (e) {}
  };

  // Apply UI mode to HTML tag on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-ui-mode', uiMode);
  }, [uiMode]);

  // Check existing auth session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const cachedUser = localStorage.getItem('xen_user');
        if (cachedUser) {
          try {
            setUser(JSON.parse(cachedUser));
          } catch (e) {}
        }
        const res = await api.getMe();
        if (res && res.user) {
          setUser(res.user);
          try {
            localStorage.setItem('xen_user', JSON.stringify(res.user));
          } catch (e) {}
        } else {
          setUser(null);
          try {
            localStorage.removeItem('xen_user');
          } catch (e) {}
        }
      } catch (e) {
        // Guest mode
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Restore active stream on page refresh so user NEVER loses their place or gets kicked to home
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const watchType = url.searchParams.get('watch');
      const mediaId = url.searchParams.get('id');
      const s = parseInt(url.searchParams.get('s'), 10) || 1;
      const e = parseInt(url.searchParams.get('e'), 10) || 1;

      if (watchType && mediaId) {
        // Instant restore from local cache
        const cached = localStorage.getItem('xen_active_stream');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed?.media?.id === mediaId) {
              setStreamModal({
                isOpen: true,
                media: parsed.media,
                season: s || parsed.season || 1,
                episode: e || parsed.episode || 1
              });
              return;
            }
          } catch (err) {}
        }

        // Fetch meta details if not in cache
        api.getMeta(watchType, mediaId)
          .then(meta => {
            if (meta) {
              setStreamModal({
                isOpen: true,
                media: meta,
                season: s,
                episode: e
              });
            }
          })
          .catch(console.error);
      }
    } catch (err) {
      console.warn('Stream restore error:', err);
    }
  }, []);

  // Latest state ref to avoid stale closures in window popstate event
  const navStateRef = useRef({});
  navStateRef.current = {
    streamModal,
    downloadModal,
    detailsModal,
    isAuthModalOpen,
    isLogoutConfirmOpen,
    mobileDrawerOpen,
    searchQuery,
    activeTab,
    tabHistory,
    isExitModalOpen
  };

  // Exit Confirmation Controls
  const openExitModal = () => {
    setIsExitModalOpen(true);
  };

  const closeExitModal = () => {
    setIsExitModalOpen(false);
  };

  const confirmExit = () => {
    setIsExitModalOpen(false);
    try {
      if (window.history.length > 1) {
        window.history.go(-2);
      } else {
        window.close();
      }
      setTimeout(() => {
        window.location.replace('about:blank');
      }, 350);
    } catch (e) {
      window.location.href = 'about:blank';
    }
  };

  const openMobileDrawer = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({ xen: 'drawer' }, '');
    }
    setMobileDrawerOpen(true);
  };

  const closeMobileDrawer = () => {
    setMobileDrawerOpen(false);
  };

  // Modal Launchers with Browser History and URL State integration
  const openStream = (media, season = 1, episode = 1) => {
    if (!user) {
      openAuthModal('login');
      addToast('Sign in required: Please sign in or create a free account to stream movies and TV series in HD/4K.', 'info');
      return;
    }
    const s = parseInt(season, 10) || 1;
    const e = parseInt(episode, 10) || 1;

    // Sync to browser URL query parameters so page refresh NEVER resets or redirects to home
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('watch', media.type || 'movie');
      url.searchParams.set('id', media.id);
      if (media.type === 'series') {
        url.searchParams.set('s', s);
        url.searchParams.set('e', e);
      } else {
        url.searchParams.delete('s');
        url.searchParams.delete('e');
      }
      window.history.replaceState({ xen: 'stream', id: media.id }, '', url.pathname + url.search);
      localStorage.setItem('xen_active_stream', JSON.stringify({ media, season: s, episode: e }));
    } catch (err) {}

    setStreamModal({ isOpen: true, media, season: s, episode: e });
  };

  const closeStream = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('watch');
      url.searchParams.delete('id');
      url.searchParams.delete('s');
      url.searchParams.delete('e');
      window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
      localStorage.removeItem('xen_active_stream');
    } catch (err) {}

    setStreamModal({ isOpen: false, media: null, season: 1, episode: 1 });
    reloadData(); // Refresh history
  };

  const openDownload = (media, season = 1, episode = 1) => {
    if (!user) {
      openAuthModal('login');
      addToast('Sign in required: Please log in or create a free account to access 4K downloads & batch ZIP files.', 'info');
      return;
    }
    if (typeof window !== 'undefined') {
      window.history.pushState({ xen: 'download' }, '');
    }
    setDownloadModal({ isOpen: true, media, season, episode });
  };

  const closeDownload = () => {
    setDownloadModal({ isOpen: false, media: null, season: 1, episode: 1 });
  };

  const openDetails = (media) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({ xen: 'details' }, '');
    }
    setDetailsModal({ isOpen: true, media });
  };

  const closeDetails = () => {
    setDetailsModal({ isOpen: false, media: null });
  };

  // Navigation handlers
  const setActiveTab = (tab) => {
    if (typeof window !== 'undefined' && tab !== activeTab) {
      window.history.pushState({ xen: 'tab', tab }, '');
    }
    setActiveTabState(prev => {
      if (prev !== tab) {
        setTabHistory(h => [...h, prev]);
      }
      return tab;
    });
  };

  const goBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  const canGoBack = Boolean(
    streamModal.isOpen || 
    downloadModal.isOpen || 
    detailsModal.isOpen || 
    isAuthModalOpen ||
    isLogoutConfirmOpen ||
    mobileDrawerOpen ||
    (searchQuery && searchQuery.trim().length > 0) || 
    activeTab !== 'home' || 
    tabHistory.length > 1
  );

  // Browser Back Button & Exit Interception Listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Ensure baseline history entry so back button doesn't immediately exit site
    if (!window.history.state || !window.history.state.xen) {
      window.history.replaceState({ xen: 'root' }, '');
      window.history.pushState({ xen: 'home' }, '');
    }

    const handlePopState = () => {
      const state = navStateRef.current;

      // 0. If Logout Confirm Modal is open, back closes it
      if (state.isLogoutConfirmOpen) {
        setIsLogoutConfirmOpen(false);
        return;
      }

      // 1. If Exit Modal is currently open, pressing back cancels/closes it
      if (state.isExitModalOpen) {
        setIsExitModalOpen(false);
        window.history.pushState({ xen: 'home' }, '');
        return;
      }

      // 2. If Stream player modal is open, back closes it
      if (state.streamModal?.isOpen) {
        setStreamModal({ isOpen: false, media: null, season: 1, episode: 1 });
        reloadData();
        return;
      }

      // 3. If Download modal is open, back closes it
      if (state.downloadModal?.isOpen) {
        setDownloadModal({ isOpen: false, media: null, season: 1, episode: 1 });
        return;
      }

      // 4. If Details modal is open, back closes it
      if (state.detailsModal?.isOpen) {
        setDetailsModal({ isOpen: false, media: null });
        return;
      }

      // 5. If Auth modal is open, back closes it
      if (state.isAuthModalOpen) {
        setIsAuthModalOpen(false);
        return;
      }

      // 6. If Mobile Drawer is open, back closes it
      if (state.mobileDrawerOpen) {
        setMobileDrawerOpen(false);
        return;
      }

      // 7. If Search Query is active, back clears search
      if (state.searchQuery && state.searchQuery.trim().length > 0) {
        setSearchQuery('');
        return;
      }

      // 8. If on another tab, back navigates to previous tab or home
      if (state.activeTab !== 'home') {
        if (state.tabHistory && state.tabHistory.length > 0) {
          const prev = state.tabHistory[state.tabHistory.length - 1];
          setTabHistory(h => h.slice(0, -1));
          setActiveTabState(prev || 'home');
        } else {
          setActiveTabState('home');
        }
        return;
      }

      // 9. Root Home reached! User pressed back to EXIT website.
      // Re-push state so page doesn't exit automatically, and prompt user!
      window.history.pushState({ xen: 'home' }, '');
      setIsExitModalOpen(true);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Load initial data from SQLite
  const reloadData = async () => {
    try {
      const [wl, hist, dl, setts, st] = await Promise.all([
        api.getWatchlist().catch(() => []),
        api.getHistory().catch(() => []),
        api.getDownloads().catch(() => []),
        api.getSettings().catch(() => ({})),
        api.getStats().catch(() => ({ historyCount: 0, watchlistCount: 0, downloadsCount: 0, totalHoursWatched: 0 }))
      ]);
      setWatchlist(wl || []);
      setHistory(hist || []);
      setDownloads(dl || []);
      if (setts && Object.keys(setts).length > 0) {
        setSettings(prev => ({ ...prev, ...setts }));
        if (setts.theme) {
          document.documentElement.setAttribute('data-theme', setts.theme);
        }
      }
      if (st) setStats(st);
    } catch (e) {
      console.error('Error reloading local app data:', e);
    }
  };

  const applyThemeClasses = (themeName) => {
    try {
      document.documentElement.setAttribute('data-theme', themeName);
      document.documentElement.setAttribute('data-ui-mode', themeName);
      const isScanline = ['cyberpunk', 'cyberpunk-hud', 'synthwave', 'anime-arcade'].includes(themeName);
      document.body.classList.remove('theme-visionos', 'theme-netflix', 'theme-cyberpunk', 'theme-nordic', 'theme-synthwave', 'scanlines');
      document.body.classList.add(`theme-${themeName}`);
      if (isScanline) {
        document.body.classList.add('scanlines');
      }
    } catch (e) {}
  };

  useEffect(() => {
    reloadData();
    try {
      const savedTheme = localStorage.getItem('xen_theme') || 'visionos';
      setThemeState(savedTheme);
      applyThemeClasses(savedTheme);
    } catch (e) {}
  }, []);

  // Update theme on document
  const setTheme = async (themeName) => {
    try {
      localStorage.setItem('xen_theme', themeName);
      localStorage.setItem('xen_ui_mode', themeName);
    } catch (e) {}
    setThemeState(themeName);
    setUiModeState(themeName);
    applyThemeClasses(themeName);
    setSettings(prev => ({ ...prev, theme: themeName }));
    try {
      await api.saveSettings({ theme: themeName });
      const themeDisplayNames = {
        visionos: 'VisionOS Spatial',
        netflix: 'Netflix Cinema',
        cyberpunk: 'Cyberpunk 2077',
        nordic: 'Nordic Minimal',
        synthwave: 'Anime Synthwave'
      };
      addToast(`Interface theme switched to ${themeDisplayNames[themeName] || themeName.toUpperCase()}!`, 'success');
    } catch (e) {
      console.error(e);
    }
  };

  // Search debounce handler
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.search(searchQuery);
        setSearchResults(res.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Toggle Watchlist (Strictly gated for authenticated users)
  const handleToggleWatchlist = async (media) => {
    if (!user) {
      openAuthModal('login');
      addToast('Sign in required: Please log in or create a free account to save movies to your personal Watchlist.', 'info');
      return;
    }
    try {
      const res = await api.toggleWatchlist({
        media_id: media.id,
        title: media.name || media.title,
        type: media.type || 'movie',
        poster: media.poster,
        year: media.year,
        genres: media.genres,
        imdb_rating: media.imdbRating || media.rating
      });

      if (res.action === 'added') {
        addToast(`Added "${media.name || media.title}" to Watchlist!`, 'success');
      } else {
        addToast(`Removed from Watchlist`, 'info');
      }
      const updatedWl = await api.getWatchlist();
      setWatchlist(updatedWl || []);
      reloadData();
    } catch (e) {
      addToast('Failed to update watchlist', 'error');
    }
  };

  const isInWatchlist = (mediaId) => {
    return watchlist.some(item => item.media_id === mediaId);
  };

  const removeHistoryItem = async (id) => {
    try {
      await api.deleteHistory(id);
      addToast('Removed from Continue Watching', 'info');
      reloadData();
    } catch (e) {
      console.error('Failed to remove history item:', e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        authLoading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        loginUser,
        logoutUser,
        isLogoutConfirmOpen,
        requestLogout,
        confirmLogout,
        cancelLogout,
        uiMode,
        setUiMode,
        activeTab,
        setActiveTab,
        goBack,
        canGoBack,
        selectedGenre,
        setSelectedGenre,
        searchQuery,
        setSearchQuery,
        searchResults,
        isSearching,
        streamModal,
        openStream,
        closeStream,
        downloadModal,
        openDownload,
        closeDownload,
        detailsModal,
        openDetails,
        closeDetails,
        watchlist,
        isInWatchlist,
        handleToggleWatchlist,
        history,
        removeHistoryItem,
        downloads,
        theme,
        settings,
        setSettings,
        setTheme,
        stats,
        reloadData,
        toasts,
        addToast,
        isExitModalOpen,
        openExitModal,
        closeExitModal,
        confirmExit,
        mobileDrawerOpen,
        setMobileDrawerOpen,
        openMobileDrawer,
        closeMobileDrawer
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
