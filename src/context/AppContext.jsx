import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
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

  // Persistent User Data from SQLite
  const [watchlist, setWatchlist] = useState([]);
  const [history, setHistory] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [settings, setSettings] = useState({
    theme: 'cyberpunk',
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

  // Modal Launchers
  const openStream = (media, season = 1, episode = 1) => {
    setStreamModal({ isOpen: true, media, season, episode });
  };

  const closeStream = () => {
    setStreamModal({ isOpen: false, media: null, season: 1, episode: 1 });
    reloadData(); // Refresh history
  };

  const openDownload = (media, season = 1, episode = 1) => {
    setDownloadModal({ isOpen: true, media, season, episode });
  };

  const closeDownload = () => {
    setDownloadModal({ isOpen: false, media: null, season: 1, episode: 1 });
  };

  const openDetails = (media) => {
    setDetailsModal({ isOpen: true, media });
  };

  const closeDetails = () => {
    setDetailsModal({ isOpen: false, media: null });
  };

  // Navigation handlers
  const setActiveTab = (tab) => {
    setActiveTabState(prev => {
      if (prev !== tab) {
        setTabHistory(h => [...h, prev]);
      }
      return tab;
    });
  };

  const goBack = () => {
    if (streamModal.isOpen) {
      closeStream();
      return;
    }
    if (downloadModal.isOpen) {
      closeDownload();
      return;
    }
    if (detailsModal.isOpen) {
      closeDetails();
      return;
    }
    if (searchQuery) {
      setSearchQuery('');
      return;
    }
    if (tabHistory.length > 0) {
      const prev = tabHistory[tabHistory.length - 1];
      setTabHistory(h => h.slice(0, -1));
      setActiveTabState(prev || 'home');
    } else if (activeTab !== 'home') {
      setActiveTabState('home');
    }
  };

  const canGoBack = Boolean(
    streamModal.isOpen || 
    downloadModal.isOpen || 
    detailsModal.isOpen || 
    (searchQuery && searchQuery.trim().length > 0) || 
    activeTab !== 'home' || 
    tabHistory.length > 1
  );

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

  useEffect(() => {
    reloadData();
  }, []);

  // Update theme on document
  const setTheme = async (themeName) => {
    document.documentElement.setAttribute('data-theme', themeName);
    setSettings(prev => ({ ...prev, theme: themeName }));
    try {
      await api.saveSettings({ theme: themeName });
      addToast(`Theme set to ${themeName.toUpperCase()}`, 'success');
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

  // Toggle Watchlist
  const handleToggleWatchlist = async (media) => {
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

  return (
    <AppContext.Provider
      value={{
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
        downloads,
        settings,
        setSettings,
        setTheme,
        stats,
        reloadData,
        toasts,
        addToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
