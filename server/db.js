import dotenv from 'dotenv';
import crypto from 'crypto';
dotenv.config();

let dbAdapter = null;

if (process.env.DATABASE_URL && process.env.USE_SQLITE !== 'true') {
  try {
    // --- Postgres Adapter (Neon / Antideploy) ---
    console.log('Connecting to Postgres Database via DATABASE_URL...');
    const { default: pg } = await import('pg');
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

  // Initialize schema with users table and user_id partition
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      avatar TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS history (
      id SERIAL PRIMARY KEY,
      user_id TEXT DEFAULT 'guest',
      media_id TEXT NOT NULL,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      poster TEXT,
      backdrop TEXT,
      season INTEGER,
      episode INTEGER,
      progress_percent INTEGER DEFAULT 0,
      progress_seconds INTEGER DEFAULT 0,
      duration_seconds INTEGER DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS watchlist (
      id SERIAL PRIMARY KEY,
      user_id TEXT DEFAULT 'guest',
      media_id TEXT NOT NULL,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      poster TEXT,
      year TEXT,
      genres TEXT,
      imdb_rating TEXT,
      category TEXT DEFAULT 'watchlist',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS downloads (
      id SERIAL PRIMARY KEY,
      user_id TEXT DEFAULT 'guest',
      media_id TEXT NOT NULL,
      title TEXT NOT NULL,
      release_title TEXT,
      quality TEXT,
      size TEXT,
      seeders INTEGER DEFAULT 0,
      magnet TEXT NOT NULL,
      info_hash TEXT,
      status TEXT DEFAULT 'ready',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      user_id TEXT DEFAULT 'guest',
      media_id TEXT NOT NULL,
      title TEXT NOT NULL,
      rating REAL DEFAULT 0,
      notes TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Ensure user_id column exists on pre-existing tables
    ALTER TABLE history ADD COLUMN IF NOT EXISTS user_id TEXT DEFAULT 'guest';
    ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS user_id TEXT DEFAULT 'guest';
    ALTER TABLE downloads ADD COLUMN IF NOT EXISTS user_id TEXT DEFAULT 'guest';

    -- Drop legacy single media_id unique constraints so multiple users can watch same title
    DO $$ 
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'watchlist_media_id_key') THEN
        ALTER TABLE watchlist DROP CONSTRAINT watchlist_media_id_key;
      END IF;
      IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'history_media_id_key') THEN
        ALTER TABLE history DROP CONSTRAINT history_media_id_key;
      END IF;
    END $$;
  `);

  // Default settings
  const defaultSettings = [
    ['theme', 'cyberpunk'],
    ['ui_mode', 'vision-spatial'],
    ['sound_pack', 'cyber-glass'],
    ['preferred_server', '2embed'],
    ['preferred_quality', '1080p'],
    ['preferred_audio', 'dual_audio'],
    ['auto_play_next', 'true'],
    ['torrent_client_action', 'open_magnet']
  ];

  for (const [key, val] of defaultSettings) {
    await pool.query(
      `INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`,
      [key, val]
    );
  }

  dbAdapter = {
    mode: 'postgres',

    // --- Users & Auth ---
    async createUser({ id, email, name, password_hash, avatar }) {
      const uid = id || crypto.randomUUID();
      const res = await pool.query(
        `INSERT INTO users (id, email, name, password_hash, avatar) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, avatar, created_at`,
        [uid, email.toLowerCase().trim(), name.trim(), password_hash, avatar || '']
      );
      return res.rows[0];
    },

    async getUserByEmail(email) {
      const res = await pool.query(`SELECT * FROM users WHERE LOWER(email) = LOWER($1)`, [email.trim()]);
      return res.rows[0] || null;
    },

    async getUserById(id) {
      const res = await pool.query(`SELECT id, email, name, avatar, created_at FROM users WHERE id = $1`, [id]);
      return res.rows[0] || null;
    },

    // --- User-partitioned History ---
    async getHistory(userId = 'guest') {
      const uid = userId || 'guest';
      const res = await pool.query(
        `SELECT * FROM history WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 60`,
        [uid]
      );
      return res.rows;
    },

    async saveHistory(item, userId = 'guest') {
      const uid = userId || 'guest';
      const {
        media_id, title, type, poster, backdrop,
        season = null, episode = null,
        progress_percent = 0, progress_seconds = 0, duration_seconds = 0
      } = item;

      const existing = await pool.query(
        `SELECT id FROM history WHERE user_id = $1 AND media_id = $2 AND (season = $3 OR (season IS NULL AND $3 IS NULL)) AND (episode = $4 OR (episode IS NULL AND $4 IS NULL))`,
        [uid, media_id, season, episode]
      );

      if (existing.rows.length > 0) {
        await pool.query(
          `UPDATE history SET progress_percent = $1, progress_seconds = $2, duration_seconds = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4`,
          [progress_percent, progress_seconds, duration_seconds, existing.rows[0].id]
        );
      } else {
        await pool.query(
          `INSERT INTO history (user_id, media_id, title, type, poster, backdrop, season, episode, progress_percent, progress_seconds, duration_seconds)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [uid, media_id, title, type, poster, backdrop, season, episode, progress_percent, progress_seconds, duration_seconds]
        );
      }
      return { success: true };
    },

    async deleteHistory(id, userId = 'guest') {
      const uid = userId || 'guest';
      await pool.query(`DELETE FROM history WHERE user_id = $2 AND (id::text = $1::text OR media_id = $1::text)`, [String(id), uid]);
      return { success: true };
    },

    // --- User-partitioned Watchlist ---
    async getWatchlist(userId = 'guest') {
      const uid = userId || 'guest';
      const res = await pool.query(
        `SELECT * FROM watchlist WHERE user_id = $1 ORDER BY created_at DESC`,
        [uid]
      );
      return res.rows;
    },

    async toggleWatchlist(item, userId = 'guest') {
      const uid = userId || 'guest';
      const { media_id, title, type, poster, year, genres, imdb_rating, category = 'watchlist' } = item;
      const existing = await pool.query(
        `SELECT id FROM watchlist WHERE user_id = $1 AND media_id = $2`,
        [uid, media_id]
      );

      if (existing.rows.length > 0) {
        await pool.query(`DELETE FROM watchlist WHERE user_id = $1 AND media_id = $2`, [uid, media_id]);
        return { success: true, action: 'removed', media_id };
      }

      await pool.query(
        `INSERT INTO watchlist (user_id, media_id, title, type, poster, year, genres, imdb_rating, category)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [uid, media_id, title, type || 'movie', poster || '', year ? String(year) : '', Array.isArray(genres) ? genres.join(', ') : (genres || ''), imdb_rating ? String(imdb_rating) : '', category]
      );
      return { success: true, action: 'added', media_id };
    },

    async deleteWatchlist(id, userId = 'guest') {
      const uid = userId || 'guest';
      await pool.query(
        `DELETE FROM watchlist WHERE user_id = $1 AND (id::text = $2::text OR media_id = $2::text)`,
        [uid, String(id)]
      );
      return { success: true };
    },

    // --- User-partitioned Downloads ---
    async getDownloads(userId = 'guest') {
      const uid = userId || 'guest';
      const res = await pool.query(
        `SELECT * FROM downloads WHERE user_id = $1 ORDER BY created_at DESC`,
        [uid]
      );
      return res.rows;
    },

    async saveDownload(item, userId = 'guest') {
      const uid = userId || 'guest';
      const { media_id, title, release_title, quality, size, seeders = 0, magnet, info_hash, status = 'ready' } = item;
      const res = await pool.query(
        `INSERT INTO downloads (user_id, media_id, title, release_title, quality, size, seeders, magnet, info_hash, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
        [uid, media_id, title, release_title, quality, size, seeders, magnet, info_hash, status]
      );
      return { success: true, id: res.rows[0]?.id };
    },

    async deleteDownload(id, userId = 'guest') {
      const uid = userId || 'guest';
      await pool.query(`DELETE FROM downloads WHERE user_id = $2 AND (id::text = $1::text OR media_id = $1::text)`, [String(id), uid]);
      return { success: true };
    },

    // --- Settings & Stats ---
    async getSettings() {
      const res = await pool.query(`SELECT * FROM settings`);
      const map = {};
      for (const r of res.rows) map[r.key] = r.value;
      return map;
    },

    async saveSettings(updates) {
      for (const [k, v] of Object.entries(updates)) {
        await pool.query(
          `INSERT INTO settings (key, value) VALUES ($1, $2)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
          [k, String(v)]
        );
      }
      return { success: true };
    },

    async getStats(userId = 'guest') {
      const uid = userId || 'guest';
      const hCount = (await pool.query(`SELECT COUNT(*) as count FROM history WHERE user_id = $1`, [uid])).rows[0].count;
      const wCount = (await pool.query(`SELECT COUNT(*) as count FROM watchlist WHERE user_id = $1`, [uid])).rows[0].count;
      const dCount = (await pool.query(`SELECT COUNT(*) as count FROM downloads WHERE user_id = $1`, [uid])).rows[0].count;
      const totalSec = (await pool.query(`SELECT COALESCE(SUM(progress_seconds), 0) as total FROM history WHERE user_id = $1`, [uid])).rows[0].total;
      return {
        historyCount: parseInt(hCount, 10),
        watchlistCount: parseInt(wCount, 10),
        downloadsCount: parseInt(dCount, 10),
        totalHoursWatched: Math.round((parseInt(totalSec, 10) / 3600) * 10) / 10
      };
    }
  };
  } catch (pgError) {
    console.warn('Postgres connection failed. Falling back to local SQLite:', pgError.message);
    dbAdapter = null;
  }
}

if (!dbAdapter && !process.env.VERCEL) {
  try {
    // --- SQLite Fallback (Local Offline PC) ---
    console.log('Connecting to Local SQLite Database...');
  const { default: Database } = await import('better-sqlite3');
  const { default: path } = await import('path');
  const { fileURLToPath } = await import('url');

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const dbPath = path.join(__dirname, '..', 'xenmovies.db');

  const sqlite = new Database(dbPath);
  sqlite.pragma('journal_mode = WAL');

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT DEFAULT 'guest',
      media_id TEXT NOT NULL,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      poster TEXT,
      backdrop TEXT,
      season INTEGER,
      episode INTEGER,
      progress_percent INTEGER DEFAULT 0,
      progress_seconds INTEGER DEFAULT 0,
      duration_seconds INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS watchlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT DEFAULT 'guest',
      media_id TEXT NOT NULL,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      poster TEXT,
      year TEXT,
      genres TEXT,
      imdb_rating TEXT,
      category TEXT DEFAULT 'watchlist',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS downloads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT DEFAULT 'guest',
      media_id TEXT NOT NULL,
      title TEXT NOT NULL,
      release_title TEXT,
      quality TEXT,
      size TEXT,
      seeders INTEGER DEFAULT 0,
      magnet TEXT NOT NULL,
      info_hash TEXT,
      status TEXT DEFAULT 'ready',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT DEFAULT 'guest',
      media_id TEXT NOT NULL,
      title TEXT NOT NULL,
      rating REAL DEFAULT 0,
      notes TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Ensure user_id column exists on pre-existing SQLite tables
  const addColIfMissing = (table, col, def) => {
    try {
      const cols = sqlite.pragma(`table_info(${table})`);
      if (!cols.some(c => c.name === col)) {
        sqlite.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
      }
    } catch (e) {}
  };
  addColIfMissing('history', 'user_id', "TEXT DEFAULT 'guest'");
  addColIfMissing('watchlist', 'user_id', "TEXT DEFAULT 'guest'");
  addColIfMissing('downloads', 'user_id', "TEXT DEFAULT 'guest'");

  const defaultSettings = [
    ['theme', 'cyberpunk'],
    ['ui_mode', 'vision-spatial'],
    ['sound_pack', 'cyber-glass'],
    ['preferred_server', '2embed'],
    ['preferred_quality', '1080p'],
    ['preferred_audio', 'dual_audio'],
    ['auto_play_next', 'true'],
    ['torrent_client_action', 'open_magnet']
  ];

  const insertSetting = sqlite.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`);
  for (const [k, v] of defaultSettings) insertSetting.run(k, v);

  dbAdapter = {
    mode: 'sqlite',

    // --- Users & Auth ---
    async createUser({ id, email, name, password_hash, avatar }) {
      const uid = id || crypto.randomUUID();
      const userAvatar = avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name.trim())}`;
      const stmt = sqlite.prepare(`INSERT INTO users (id, email, name, password_hash, avatar) VALUES (?, ?, ?, ?, ?)`);
      stmt.run(uid, email.toLowerCase().trim(), name.trim(), password_hash, userAvatar);
      return { id: uid, email: email.toLowerCase().trim(), name: name.trim(), avatar: userAvatar };
    },

    async getUserByEmail(email) {
      return sqlite.prepare(`SELECT * FROM users WHERE LOWER(email) = LOWER(?)`).get(email.trim()) || null;
    },

    async getUserById(id) {
      return sqlite.prepare(`SELECT id, email, name, avatar, created_at FROM users WHERE id = ?`).get(id) || null;
    },

    // --- User-partitioned History ---
    async getHistory(userId = 'guest') {
      const uid = userId || 'guest';
      return sqlite.prepare(`SELECT * FROM history WHERE user_id = ? ORDER BY updated_at DESC LIMIT 60`).all(uid);
    },

    async saveHistory(item, userId = 'guest') {
      const uid = userId || 'guest';
      const {
        media_id, title, type, poster, backdrop,
        season = null, episode = null,
        progress_percent = 0, progress_seconds = 0, duration_seconds = 0
      } = item;

      const existing = sqlite.prepare(
        `SELECT id FROM history WHERE user_id = ? AND media_id = ? AND (season = ? OR (season IS NULL AND ? IS NULL)) AND (episode = ? OR (episode IS NULL AND ? IS NULL))`
      ).get(uid, media_id, season, season, episode, episode);

      if (existing) {
        sqlite.prepare(`
          UPDATE history SET progress_percent = ?, progress_seconds = ?, duration_seconds = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
        `).run(progress_percent, progress_seconds, duration_seconds, existing.id);
      } else {
        sqlite.prepare(`
          INSERT INTO history (user_id, media_id, title, type, poster, backdrop, season, episode, progress_percent, progress_seconds, duration_seconds, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).run(uid, media_id, title, type, poster, backdrop, season, episode, progress_percent, progress_seconds, duration_seconds);
      }
      return { success: true };
    },

    async deleteHistory(id, userId = 'guest') {
      const uid = userId || 'guest';
      sqlite.prepare('DELETE FROM history WHERE user_id = ? AND (id = ? OR media_id = ?)').run(uid, id, id);
      return { success: true };
    },

    // --- User-partitioned Watchlist ---
    async getWatchlist(userId = 'guest') {
      const uid = userId || 'guest';
      return sqlite.prepare(`SELECT * FROM watchlist WHERE user_id = ? ORDER BY created_at DESC`).all(uid);
    },

    async toggleWatchlist(item, userId = 'guest') {
      const uid = userId || 'guest';
      const { media_id, title, type, poster, year, genres, imdb_rating, category = 'watchlist' } = item;
      const existing = sqlite.prepare('SELECT id FROM watchlist WHERE user_id = ? AND media_id = ?').get(uid, media_id);
      if (existing) {
        sqlite.prepare('DELETE FROM watchlist WHERE user_id = ? AND media_id = ?').run(uid, media_id);
        return { success: true, action: 'removed', media_id };
      }
      sqlite.prepare(`
        INSERT INTO watchlist (user_id, media_id, title, type, poster, year, genres, imdb_rating, category)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(uid, media_id, title, type || 'movie', poster || '', year ? String(year) : '', Array.isArray(genres) ? genres.join(', ') : (genres || ''), imdb_rating ? String(imdb_rating) : '', category);
      return { success: true, action: 'added', media_id };
    },

    async deleteWatchlist(id, userId = 'guest') {
      const uid = userId || 'guest';
      sqlite.prepare('DELETE FROM watchlist WHERE user_id = ? AND (id = ? OR media_id = ?)').run(uid, id, id);
      return { success: true };
    },

    // --- User-partitioned Downloads ---
    async getDownloads(userId = 'guest') {
      const uid = userId || 'guest';
      return sqlite.prepare(`SELECT * FROM downloads WHERE user_id = ? ORDER BY created_at DESC`).all(uid);
    },

    async saveDownload(item, userId = 'guest') {
      const uid = userId || 'guest';
      const { media_id, title, release_title, quality, size, seeders = 0, magnet, info_hash, status = 'ready' } = item;
      const res = sqlite.prepare(`
        INSERT INTO downloads (user_id, media_id, title, release_title, quality, size, seeders, magnet, info_hash, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(uid, media_id, title, release_title, quality, size, seeders, magnet, info_hash, status);
      return { success: true, id: res.lastInsertRowid };
    },

    async deleteDownload(id, userId = 'guest') {
      const uid = userId || 'guest';
      sqlite.prepare('DELETE FROM downloads WHERE user_id = ? AND (id = ? OR media_id = ?)').run(uid, id, id);
      return { success: true };
    },

    // --- Settings & Stats ---
    async getSettings() {
      const rows = sqlite.prepare('SELECT * FROM settings').all();
      const map = {};
      for (const r of rows) map[r.key] = r.value;
      return map;
    },

    async saveSettings(updates) {
      const stmt = sqlite.prepare(`
        INSERT INTO settings (key, value) VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `);
      for (const [k, v] of Object.entries(updates)) stmt.run(k, String(v));
      return { success: true };
    },

    async getStats(userId = 'guest') {
      const uid = userId || 'guest';
      const historyCount = sqlite.prepare('SELECT COUNT(*) as count FROM history WHERE user_id = ?').get(uid).count;
      const watchlistCount = sqlite.prepare('SELECT COUNT(*) as count FROM watchlist WHERE user_id = ?').get(uid).count;
      const downloadsCount = sqlite.prepare('SELECT COUNT(*) as count FROM downloads WHERE user_id = ?').get(uid).count;
      const totalSeconds = sqlite.prepare('SELECT SUM(progress_seconds) as total FROM history WHERE user_id = ?').get(uid).total || 0;
      return {
        historyCount,
        watchlistCount,
        downloadsCount,
        totalHoursWatched: Math.round((totalSeconds / 3600) * 10) / 10
      };
    }
  };
  } catch (sqliteErr) {
    console.warn('SQLite unavailable:', sqliteErr.message);
  }
}

if (!dbAdapter) {
  console.log('Running in-memory store fallback for serverless environment...');
  const memStore = {
    users: [],
    history: [],
    watchlist: [],
    downloads: [],
    settings: {
      theme: 'visionos',
      ui_mode: 'vision-spatial',
      sound_pack: 'cyber-glass',
      preferred_server: '2embed',
      preferred_quality: '1080p',
      preferred_audio: 'dual_audio',
      auto_play_next: 'true',
      torrent_client_action: 'open_magnet'
    }
  };
  dbAdapter = {
    mode: 'memory',
    async createUser(u) {
      const nu = { ...u, id: u.id || crypto.randomUUID() };
      memStore.users.push(nu);
      return nu;
    },
    async getUserByEmail(e) {
      return memStore.users.find(u => u.email.toLowerCase() === e.toLowerCase()) || null;
    },
    async getUserById(id) {
      return memStore.users.find(u => u.id === id) || null;
    },
    async getHistory(uid = 'guest') {
      return memStore.history.filter(h => h.user_id === uid);
    },
    async saveHistory(item, uid = 'guest') {
      memStore.history.unshift({ ...item, user_id: uid, id: Date.now() });
      return { success: true };
    },
    async deleteHistory(id, uid = 'guest') {
      memStore.history = memStore.history.filter(h => !(h.user_id === uid && (h.id == id || h.media_id == id)));
      return { success: true };
    },
    async getWatchlist(uid = 'guest') {
      return memStore.watchlist.filter(w => w.user_id === uid);
    },
    async toggleWatchlist(item, uid = 'guest') {
      const idx = memStore.watchlist.findIndex(w => w.user_id === uid && w.media_id === item.media_id);
      if (idx >= 0) {
        memStore.watchlist.splice(idx, 1);
        return { success: true, action: 'removed' };
      }
      memStore.watchlist.push({ ...item, user_id: uid, id: Date.now() });
      return { success: true, action: 'added' };
    },
    async deleteWatchlist(id, uid = 'guest') {
      memStore.watchlist = memStore.watchlist.filter(w => !(w.user_id === uid && (w.id == id || w.media_id == id)));
      return { success: true };
    },
    async getDownloads(uid = 'guest') {
      return memStore.downloads.filter(d => d.user_id === uid);
    },
    async saveDownload(item, uid = 'guest') {
      memStore.downloads.unshift({ ...item, user_id: uid, id: Date.now() });
      return { success: true };
    },
    async deleteDownload(id, uid = 'guest') {
      memStore.downloads = memStore.downloads.filter(d => !(d.user_id === uid && d.id == id));
      return { success: true };
    },
    async getSettings() {
      return memStore.settings;
    },
    async saveSettings(s) {
      Object.assign(memStore.settings, s);
      return { success: true };
    },
    async getStats(uid = 'guest') {
      return {
        historyCount: memStore.history.filter(h => h.user_id === uid).length,
        watchlistCount: memStore.watchlist.filter(w => w.user_id === uid).length,
        downloadsCount: memStore.downloads.filter(d => d.user_id === uid).length,
        totalHoursWatched: 0
      };
    }
  };
}

export default dbAdapter;
