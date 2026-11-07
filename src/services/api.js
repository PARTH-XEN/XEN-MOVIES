const API_BASE = '/api';

const getAuthHeaders = () => {
  try {
    const token = localStorage.getItem('xen_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch (e) {
    return {};
  }
};

export const api = {
  // Authentication
  async signup(nameOrObj, email, password, confirmPassword, avatar) {
    let payload;
    if (typeof nameOrObj === 'object' && nameOrObj !== null) {
      payload = nameOrObj;
    } else if (typeof nameOrObj === 'string' && nameOrObj.includes('@')) {
      // Handles flipped arguments (email, password, name, avatar)
      payload = { email: nameOrObj, password: email, name: password, avatar: confirmPassword };
    } else {
      payload = { name: nameOrObj, email, password, confirmPassword, avatar };
    }

    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Signup failed');
    return data;
  },

  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async getMe() {
    const token = localStorage.getItem('xen_token');
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { ...getAuthHeaders() }
      });
      if (!res.ok) return null;
      return res.json();
    } catch (e) {
      return null;
    }
  },

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
    const res = await fetch(`${API_BASE}/streams/${type}/${id}?s=${season}&e=${episode}`, {
      headers: { ...getAuthHeaders() }
    });
    if (!res.ok) throw new Error('Failed to fetch streams');
    return res.json();
  },

  // Batch Season Download URL (auth handled via Authorization header server-side)
  async getSeasonBatchZipUrl(id, season = 1) {
    // Token will be sent via Authorization header automatically by browser
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

  async getRecommendations(type, id) {
    try {
      const res = await fetch(`${API_BASE}/recommendations/${type}/${id}`);
      if (!res.ok) return { items: [] };
      return res.json();
    } catch (e) {
      return { items: [] };
    }
  },

  // Embed Servers list
  async getEmbeds(type, id, season = 1, episode = 1) {
    const res = await fetch(`${API_BASE}/embeds/${type}/${id}?s=${season}&e=${episode}`, {
      headers: { ...getAuthHeaders() }
    });
    if (!res.ok) throw new Error('Failed to fetch embed servers');
    return res.json();
  },

  // Watch History
  async getHistory() {
    const res = await fetch(`${API_BASE}/history`, {
      headers: { ...getAuthHeaders() }
    });
    return res.json();
  },

  async saveHistory(historyItem) {
    const res = await fetch(`${API_BASE}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(historyItem)
    });
    return res.json();
  },

  async deleteHistory(id) {
    const res = await fetch(`${API_BASE}/history/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() }
    });
    return res.json();
  },

  // Watchlist
  async getWatchlist() {
    const res = await fetch(`${API_BASE}/watchlist`, {
      headers: { ...getAuthHeaders() }
    });
    return res.json();
  },

  async toggleWatchlist(item) {
    const res = await fetch(`${API_BASE}/watchlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(item)
    });
    return res.json();
  },

  async deleteWatchlist(id) {
    const res = await fetch(`${API_BASE}/watchlist/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() }
    });
    return res.json();
  },

  // Downloads Queue
  async getDownloads() {
    const res = await fetch(`${API_BASE}/downloads`, {
      headers: { ...getAuthHeaders() }
    });
    return res.json();
  },

  async saveDownload(downloadItem) {
    const res = await fetch(`${API_BASE}/downloads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(downloadItem)
    });
    return res.json();
  },

  async deleteDownload(id) {
    const res = await fetch(`${API_BASE}/downloads/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() }
    });
    return res.json();
  },

  // User Settings
  async getSettings() {
    const res = await fetch(`${API_BASE}/settings`, {
      headers: { ...getAuthHeaders() }
    });
    return res.json();
  },

  async saveSettings(settings) {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(settings)
    });
    return res.json();
  },

  // Stats
  async getStats() {
    const res = await fetch(`${API_BASE}/stats`, {
      headers: { ...getAuthHeaders() }
    });
    return res.json();
  }
};

