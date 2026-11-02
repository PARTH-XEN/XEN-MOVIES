const API_BASE = '/api';

export const api = {
  // Trending & Home
  async getTrending() {
    const res = await fetch(`${API_BASE}/trending`);
    if (!res.ok) throw new Error('Failed to fetch trending');
    return res.json();
  },

  // Catalog by type & genre
  async getCatalog(type = 'movie', genre = 'all', page = 1) {
    const res = await fetch(`${API_BASE}/catalog?type=${type}&genre=${genre}&page=${page}`);
    if (!res.ok) throw new Error('Failed to fetch catalog');
    return res.json();
  },

  // Live Search
  async search(query, type = 'all') {
    if (!query) return { results: [] };
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}&type=${type}`);
    if (!res.ok) throw new Error('Search failed');
    return res.json();
  },

  // Metadata with episodes & seasons
  async getMeta(type, id) {
    const res = await fetch(`${API_BASE}/meta/${type}/${id}`);
    if (!res.ok) throw new Error('Metadata fetch failed');
    return res.json();
  },

  // Torrent / Magnet Streams + Embeds
  async getStreams(type, id, season = 1, episode = 1) {
    const res = await fetch(`${API_BASE}/streams/${type}/${id}?s=${season}&e=${episode}`);
    if (!res.ok) throw new Error('Failed to fetch streams');
    return res.json();
  },

  // Batch Season Download URL
  getSeasonBatchZipUrl(id, season = 1) {
    return `${API_BASE}/batch/zip?id=${encodeURIComponent(id)}&season=${season}`;
  },

  // Cloudstream API
  async getCloudstreamProviders() {
    const res = await fetch(`${API_BASE}/cloudstream/providers`);
    return res.json();
  },

  async getCloudstreamStream(type, id, season = 1, episode = 1) {
    const res = await fetch(`${API_BASE}/cloudstream/stream/${type}/${id}?s=${season}&e=${episode}`);
    if (!res.ok) throw new Error('Cloudstream resolution failed');
    return res.json();
  },

  getCloudstreamRepoUrl() {
    return `${window.location.origin}${API_BASE}/cloudstream/repo.json`;
  },

  // Embed Servers list
  async getEmbeds(type, id, season = 1, episode = 1) {
    const res = await fetch(`${API_BASE}/embeds/${type}/${id}?s=${season}&e=${episode}`);
    if (!res.ok) throw new Error('Failed to fetch embed servers');
    return res.json();
  },

  // Watch History
  async getHistory() {
    const res = await fetch(`${API_BASE}/history`);
    return res.json();
  },

  async saveHistory(historyItem) {
    const res = await fetch(`${API_BASE}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(historyItem)
    });
    return res.json();
  },

  async deleteHistory(id) {
    const res = await fetch(`${API_BASE}/history/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Watchlist
  async getWatchlist() {
    const res = await fetch(`${API_BASE}/watchlist`);
    return res.json();
  },

  async toggleWatchlist(item) {
    const res = await fetch(`${API_BASE}/watchlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return res.json();
  },

  async deleteWatchlist(id) {
    const res = await fetch(`${API_BASE}/watchlist/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Downloads Queue
  async getDownloads() {
    const res = await fetch(`${API_BASE}/downloads`);
    return res.json();
  },

  async saveDownload(downloadItem) {
    const res = await fetch(`${API_BASE}/downloads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(downloadItem)
    });
    return res.json();
  },

  async deleteDownload(id) {
    const res = await fetch(`${API_BASE}/downloads/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // User Settings
  async getSettings() {
    const res = await fetch(`${API_BASE}/settings`);
    return res.json();
  },

  async saveSettings(settings) {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return res.json();
  },

  // Stats
  async getStats() {
    const res = await fetch(`${API_BASE}/stats`);
    return res.json();
  }
};

