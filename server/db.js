import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'xenmovies.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(media_id, season, episode)
  );

  CREATE TABLE IF NOT EXISTS watchlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    media_id TEXT UNIQUE NOT NULL,
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
    media_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    rating REAL DEFAULT 0,
    notes TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Insert default settings if not exists
const defaultSettings = [
  ['theme', 'cyberpunk'],
  ['preferred_server', 'vidlink'],
  ['preferred_quality', '1080p'],
  ['preferred_audio', 'dual_audio'],
  ['auto_play_next', 'true'],
  ['torrent_client_action', 'open_magnet']
];

const insertSetting = db.prepare(`
  INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)
`);

for (const [key, val] of defaultSettings) {
  insertSetting.run(key, val);
}

export default db;

