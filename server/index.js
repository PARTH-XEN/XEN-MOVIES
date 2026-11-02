import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from './db.js';
import { fetchTrending, fetchCatalog, searchCinemeta, fetchMeta } from './services/cinemeta.js';
import { fetchStreams } from './services/torrentio.js';
import { getEmbedServers } from './services/embedSources.js';
import { createSeasonBatchZip } from './services/zipBuilder.js';
import { getCloudstreamProviders, resolveCloudstreamSources, getCloudstreamRepo } from './services/cloudstream.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'XENMOVIES Hub',
    timestamp: new Date().toISOString()
  });
});

// Trending movies & series
app.get('/api/trending', async (req, res) => {
  try {
    const data = await fetchTrending();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trending', details: err.message });
  }
});

// Catalog with genre filtering
app.get('/api/catalog', async (req, res) => {
  try {
    const { type = 'movie', genre = 'all', page = 1 } = req.query;
    const items = await fetchCatalog(type, genre, page);
    res.json({ type, genre, items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch catalog', details: err.message });
  }
});

// Search
app.get('/api/search', async (req, res) => {
  try {
    const { q = '', type = 'all' } = req.query;
    const results = await searchCinemeta(q, type);
    res.json({ query: q, results });
  } catch (err) {
    res.status(500).json({ error: 'Failed to execute search', details: err.message });
  }
});

// Full Metadata
app.get('/api/meta/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const meta = await fetchMeta(type, id);
    if (!meta) {
      return res.status(404).json({ error: 'Metadata not found' });
    }
    res.json(meta);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch metadata', details: err.message });
  }
});

// Streaming & Download links (Torrentio + Scrapers)
app.get('/api/streams/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const { s = 1, e = 1 } = req.query;
    
    // Look up TMDB ID if series so providers like VidLink don't fail
    let tmdbId = req.query.tmdb || null;
    if (!tmdbId && type === 'series') {
      try {
        const meta = await fetchMeta(type, id);
        tmdbId = meta?.moviedb_id || null;
      } catch (e) {}
    }

    // Fetch torrent & download streams
    const streamData = await fetchStreams(type, id, parseInt(s, 10), parseInt(e, 10));

    // Also get free embed streaming servers
    const embedServers = getEmbedServers(type, id, parseInt(s, 10), parseInt(e, 10), tmdbId);

    res.json({
      type,
      id,
      season: parseInt(s, 10),
      episode: parseInt(e, 10),
      tmdbId,
      embedServers,
      ...streamData
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch streams', details: err.message });
  }
});

// Batch Season Download as .ZIP archive
app.get('/api/batch/zip', async (req, res) => {
  try {
    const { id, season = 1 } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'Missing series id' });
    }

    const { buffer, filename } = await createSeasonBatchZip(id, season);

    // Record in local downloads database
    try {
      db.prepare(`
        INSERT INTO downloads (media_id, title, release_title, quality, size, seeders, magnet, info_hash, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        filename.replace('.zip', ''),
        `Complete Season ${season} Batch ZIP Archive`,
        'BATCH ZIP',
        `${Math.round((buffer.length / (1024 * 1024)) * 10) / 10} MB`,
        100,
        `/api/batch/zip?id=${id}&season=${season}`,
        'batch_zip',
        'downloaded_zip'
      );
    } catch (dbErr) {
      console.error('Failed to log batch zip download to db:', dbErr.message);
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  } catch (err) {
    console.error('Error generating season batch zip:', err.message);
    res.status(500).json({ error: 'Failed to generate season batch zip', details: err.message });
  }
});

// --- Cloudstream API Endpoints ---
app.get('/api/cloudstream/providers', (req, res) => {
  res.json({
    engine: 'Cloudstream 3 Aggregator',
    providers: getCloudstreamProviders()
  });
});

app.get('/api/cloudstream/stream/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const { s = 1, e = 1 } = req.query;
    const result = await resolveCloudstreamSources(type, id, parseInt(s, 10), parseInt(e, 10));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to resolve Cloudstream sources', details: err.message });
  }
});

// Cloudstream 3 Repository Manifest (Add as repository in Cloudstream app)
app.get(['/api/cloudstream/repo.json', '/api/cloudstream/manifest.json'], (req, res) => {
  const host = req.get('host') || 'localhost:5000';
  const protocol = req.protocol || 'http';
  res.json(getCloudstreamRepo(`${protocol}://${host}`));
});

// Embed servers list
app.get('/api/embeds/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  const { s = 1, e = 1 } = req.query;
  
  let tmdbId = req.query.tmdb || null;
  if (!tmdbId && type === 'series') {
    try {
      const meta = await fetchMeta(type, id);
      tmdbId = meta?.moviedb_id || null;
    } catch (e) {}
  }

  const servers = getEmbedServers(type, id, parseInt(s, 10), parseInt(e, 10), tmdbId);
  res.json({ servers, tmdbId });
});

// --- Local Database: History ---
app.get('/api/history', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT * FROM history ORDER BY updated_at DESC LIMIT 50
    `).all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/history', (req, res) => {
  try {
    const {
      media_id,
      title,
      type,
      poster,
      backdrop,
      season = null,
      episode = null,
      progress_percent = 0,
      progress_seconds = 0,
      duration_seconds = 0
    } = req.body;

    if (!media_id || !title || !type) {
      return res.status(400).json({ error: 'Missing required media info' });
    }

    const stmt = db.prepare(`
      INSERT INTO history (
        media_id, title, type, poster, backdrop, season, episode,
        progress_percent, progress_seconds, duration_seconds, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(media_id, season, episode) DO UPDATE SET
        progress_percent = excluded.progress_percent,
        progress_seconds = excluded.progress_seconds,
        duration_seconds = excluded.duration_seconds,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(
      media_id, title, type, poster, backdrop, season, episode,
      progress_percent, progress_seconds, duration_seconds
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/history/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM history WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Local Database: Watchlist ---
app.get('/api/watchlist', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT * FROM watchlist ORDER BY created_at DESC
    `).all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/watchlist', (req, res) => {
  try {
    const {
      media_id,
      title,
      type,
      poster,
      year,
      genres,
      imdb_rating,
      category = 'watchlist'
    } = req.body;

    if (!media_id || !title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if already in watchlist
    const existing = db.prepare('SELECT id FROM watchlist WHERE media_id = ?').get(media_id);
    if (existing) {
      // Toggle / remove if already in watchlist
      db.prepare('DELETE FROM watchlist WHERE media_id = ?').run(media_id);
      return res.json({ success: true, action: 'removed', media_id });
    }

    const stmt = db.prepare(`
      INSERT INTO watchlist (media_id, title, type, poster, year, genres, imdb_rating, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      media_id,
      title,
      type || 'movie',
      poster || '',
      year ? String(year) : '',
      Array.isArray(genres) ? genres.join(', ') : (genres || ''),
      imdb_rating ? String(imdb_rating) : '',
      category
    );

    res.json({ success: true, action: 'added', media_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/watchlist/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM watchlist WHERE id = ? OR media_id = ?').run(req.params.id, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Local Database: Downloads Queue ---
app.get('/api/downloads', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT * FROM downloads ORDER BY created_at DESC
    `).all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/downloads', (req, res) => {
  try {
    const {
      media_id,
      title,
      release_title,
      quality,
      size,
      seeders = 0,
      magnet,
      info_hash,
      status = 'ready'
    } = req.body;

    const stmt = db.prepare(`
      INSERT INTO downloads (media_id, title, release_title, quality, size, seeders, magnet, info_hash, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      media_id,
      title,
      release_title,
      quality,
      size,
      seeders,
      magnet,
      info_hash,
      status
    );

    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/downloads/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM downloads WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Local Database: User Settings ---
app.get('/api/settings', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM settings').all();
    const settings = {};
    for (const r of rows) {
      settings[r.key] = r.value;
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings', (req, res) => {
  try {
    const updates = req.body;
    const stmt = db.prepare(`
      INSERT INTO settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);

    for (const [key, value] of Object.entries(updates)) {
      stmt.run(key, String(value));
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Local Database: Stats ---
app.get('/api/stats', (req, res) => {
  try {
    const historyCount = db.prepare('SELECT COUNT(*) as count FROM history').get().count;
    const watchlistCount = db.prepare('SELECT COUNT(*) as count FROM watchlist').get().count;
    const downloadsCount = db.prepare('SELECT COUNT(*) as count FROM downloads').get().count;
    const totalSeconds = db.prepare('SELECT SUM(progress_seconds) as total FROM history').get().total || 0;

    res.json({
      historyCount,
      watchlistCount,
      downloadsCount,
      totalHoursWatched: Math.round((totalSeconds / 3600) * 10) / 10
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend static build if available
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    // If request does not start with /api, serve index.html
    if (!req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

app.listen(PORT, () => {
  console.log(`\n🚀 XENMOVIES Core Server active at http://localhost:${PORT}`);
  console.log(`📡 Local SQLite Database: ${path.join(__dirname, '..', 'xenmovies.db')}`);
});
