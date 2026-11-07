const BASE_URL = 'https://v3-cinemeta.strem.io';

// In-memory cache for speed and zero unnecessary external calls
const cache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

function getCached(key) {
  const item = cache.get(key);
  if (item && (Date.now() - item.time < CACHE_TTL_MS)) {
    return item.data;
  }
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, time: Date.now() });
}

export async function fetchTrending() {
  const cacheKey = 'trending';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const [moviesRes, seriesRes] = await Promise.all([
      fetch(`${BASE_URL}/catalog/movie/top.json`, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(6000) }),
      fetch(`${BASE_URL}/catalog/series/top.json`, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(6000) })
    ]);

    const moviesData = await moviesRes.json();
    const seriesData = await seriesRes.json();

    const movies = (moviesData.metas || []).slice(0, 16).map(m => ({ ...m, type: 'movie' }));
    const series = (seriesData.metas || []).slice(0, 16).map(s => ({ ...s, type: 'series' }));

    const result = {
      hero: movies.slice(0, 5),
      trendingMovies: movies,
      trendingSeries: series
    };

    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.error('Error fetching trending:', err.message);
    return { hero: [], trendingMovies: [], trendingSeries: [] };
  }
}

export async function fetchCatalog(type = 'movie', genre = 'all', page = 1) {
  const cacheKey = `catalog_${type}_${genre}_${page}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    let metas = [];

    if (genre === 'bollywood') {
      // For Bollywood & Dual Audio Hindi cinema
      try {
        const [resHindi, resBolly, resSeries] = await Promise.all([
          fetch(`${BASE_URL}/catalog/movie/top/search=hindi.json`, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(6000) }).then(r => r.json()).catch(() => ({ metas: [] })),
          fetch(`${BASE_URL}/catalog/movie/top/search=bollywood.json`, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(6000) }).then(r => r.json()).catch(() => ({ metas: [] })),
          fetch(`${BASE_URL}/catalog/series/top/search=hindi.json`, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(6000) }).then(r => r.json()).catch(() => ({ metas: [] }))
        ]);

        const combined = [
          ...(resHindi.metas || []).map(m => ({ ...m, type: 'movie' })),
          ...(resBolly.metas || []).map(m => ({ ...m, type: 'movie' })),
          ...(resSeries.metas || []).map(m => ({ ...m, type: 'series' }))
        ];

        const seen = new Set();
        for (const item of combined) {
          if (!seen.has(item.id)) {
            seen.add(item.id);
            metas.push(item);
          }
        }
      } catch (e) {
        console.error('Error fetching bollywood items:', e.message);
      }
    } else {
      let url = `${BASE_URL}/catalog/${type}/top.json`;
      if (genre && genre !== 'all') {
        url = `${BASE_URL}/catalog/${type}/top/genre=${encodeURIComponent(genre)}.json`;
      }
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(6000) });
      const data = await res.json();
      metas = (data.metas || []).map(m => ({
        ...m,
        type: m.type || type
      }));
    }

    setCache(cacheKey, metas);
    return metas;
  } catch (err) {
    console.error('Error fetching catalog:', err.message);
    return [];
  }
}

export async function searchCinemeta(query, type = 'all') {
  if (!query || query.trim().length === 0) return [];
  const cleanQuery = encodeURIComponent(query.trim());
  const cacheKey = `search_${cleanQuery}_${type}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const promises = [];
    if (type === 'all' || type === 'movie') {
      promises.push(
        fetch(`${BASE_URL}/catalog/movie/top/search=${cleanQuery}.json`, { signal: AbortSignal.timeout(6000) })
          .then(r => r.json())
          .then(d => (d.metas || []).map(m => ({ ...m, type: 'movie' })))
          .catch(() => [])
      );
    }
    if (type === 'all' || type === 'series') {
      promises.push(
        fetch(`${BASE_URL}/catalog/series/top/search=${cleanQuery}.json`, { signal: AbortSignal.timeout(6000) })
          .then(r => r.json())
          .then(d => (d.metas || []).map(m => ({ ...m, type: 'series' })))
          .catch(() => [])
      );
    }

    const results = await Promise.all(promises);
    const flattened = results.flat();
    
    // De-duplicate by id
    const unique = [];
    const seen = new Set();
    for (const item of flattened) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        unique.push(item);
      }
    }

    setCache(cacheKey, unique);
    return unique;
  } catch (err) {
    console.error('Error searching cinemeta:', err.message);
    return [];
  }
}

export async function fetchMeta(type, id) {
  const cacheKey = `meta_${type}_${id}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`${BASE_URL}/meta/${type}/${id}.json`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(7000)
    });

    if (!res.ok) return null;
    const data = await res.json();
    const meta = data.meta;
    if (!meta) return null;

    // Structure seasons and episodes if it's a series
    if (type === 'series' && meta.videos) {
      const seasonsMap = {};
      for (const vid of meta.videos) {
        const s = vid.season !== undefined ? vid.season : 1;
        if (!seasonsMap[s]) {
          seasonsMap[s] = [];
        }
        seasonsMap[s].push({
          id: vid.id,
          name: vid.name || `Episode ${vid.episode || vid.number}`,
          episode: vid.episode || vid.number,
          season: s,
          overview: vid.overview || vid.description || '',
          thumbnail: vid.thumbnail || meta.background || meta.poster,
          rating: vid.rating,
          released: vid.released || vid.firstAired
        });
      }

      // Sort episodes inside each season
      for (const s of Object.keys(seasonsMap)) {
        seasonsMap[s].sort((a, b) => a.episode - b.episode);
      }

      meta.seasonsList = Object.keys(seasonsMap)
        .map(Number)
        .sort((a, b) => a - b)
        .filter(s => s > 0); // Exclude specials season 0 from main list if preferred, or keep
      
      // If no seasons > 0, include season 0
      if (meta.seasonsList.length === 0 && seasonsMap[0]) {
        meta.seasonsList = [0];
      }

      meta.seasonsData = seasonsMap;
    }

    setCache(cacheKey, meta);
    return meta;
  } catch (err) {
    console.error('Error fetching meta:', err.message);
    return null;
  }
}

export async function fetchRecommendations(type = 'movie', id) {
  const cacheKey = `recommendations_${type}_${id}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const meta = await fetchMeta(type, id);
    const genre = (meta?.genres && meta.genres.length > 0) ? meta.genres[0] : 'all';
    const catalog = await fetchCatalog(type, genre, 1);
    const list = Array.isArray(catalog) ? catalog : (catalog?.items || []);
    const items = list.filter(item => item.id !== id).slice(0, 10);
    setCache(cacheKey, items);
    return items;
  } catch (err) {
    console.error('Error fetching recommendations:', err.message);
    return [];
  }
}


