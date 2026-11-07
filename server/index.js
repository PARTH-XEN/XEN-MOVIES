import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dns from 'dns/promises';
import { fileURLToPath } from 'url';
import db from './db.js';
import { hashPassword, verifyPassword, generateToken, verifyToken } from './auth.js';
import { fetchTrending, fetchCatalog, searchCinemeta, fetchMeta, fetchRecommendations } from './services/cinemeta.js';
import { fetchStreams } from './services/torrentio.js';
import { getEmbedServers } from './services/embedSources.js';
import { createSeasonBatchZip } from './services/zipBuilder.js';
import { getCloudstreamProviders, resolveCloudstreamSources, getCloudstreamRepo, getCloudstreamPlugins } from './services/cloudstream.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: true, // Allow all origins for seamless local streaming on TV, Android, iOS & localhost
  credentials: true
}));
app.use(express.json());

// Auth & User Extraction Middleware
app.use((req, res, next) => {
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }
  if (token) {
    const decoded = verifyToken(token);
    if (decoded && decoded.userId) {
      req.userId = decoded.userId;
      req.userEmail = decoded.email;
    }
  }
  // Default to 'guest' if unauthenticated
  if (!req.userId) {
    req.userId = 'guest';
  }
  next();
});

// Authentication Guard: strictly protects private user data, watchlist writes, and download features
const requireAuth = (req, res, next) => {
  if (!req.userId || req.userId === 'guest') {
    return res.status(401).json({
      error: 'Authentication Required',
      message: 'Please sign in or create a free account to save to your personal Watchlist or access direct downloads.'
    });
  }
  next();
};

// --- User Authentication Endpoints ---
async function verifyEmailAddress(email) {
  const parts = email.split('@');
  if (parts.length !== 2) {
    return { valid: false, error: 'Please enter a valid email address (e.g., user@gmail.com).' };
  }

  const [localPart, domain] = parts;

  // 1. Length checks
  if (!localPart || !domain || localPart.length > 64 || domain.length > 255) {
    return { valid: false, error: 'Email address length is invalid.' };
  }

  // 2. Standard RFC regex check
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address (e.g., user@gmail.com).' };
  }

  // 3. Reject temporary / throwaway / disposable fake email domains
  const disposableDomains = new Set([
    'mailinator.com', '10minutemail.com', 'tempmail.com', 'guerrillamail.com',
    'throwawaymail.com', 'yopmail.com', 'sharklasers.com', 'trashmail.com',
    'getairmail.com', 'dispostable.com', 'fakeinbox.com', 'temp-mail.org',
    'generator.email', 'dropmail.me', 'crazymailing.com'
  ]);
  if (disposableDomains.has(domain)) {
    return { valid: false, error: 'Disposable or temporary email addresses are not permitted.' };
  }

  // 4. Special Gmail verification (@gmail.com or @googlemail.com)
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    // Gmail usernames are 6 to 30 characters
    if (localPart.length < 6 || localPart.length > 30) {
      return { valid: false, error: 'Gmail username must be between 6 and 30 characters long.' };
    }
    // Letters, numbers, and single dots only; cannot start or end with a period; no consecutive periods
    if (!/^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*$/.test(localPart)) {
      return { valid: false, error: 'Invalid Gmail username. Only letters, numbers, and single dots are allowed.' };
    }
  }

  // 5. Real DNS MX Record Lookup: verifies that the domain actually exists on the internet and has mail servers
  try {
    const mxRecords = await dns.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return { valid: false, error: `The email domain "${domain}" has no mail servers and cannot receive email.` };
    }
  } catch (dnsErr) {
    if (dnsErr.code === 'ENOTFOUND' || dnsErr.code === 'ENODATA') {
      return { valid: false, error: `The email domain "${domain}" does not exist. Please check your spelling.` };
    }
    console.warn(`DNS MX check warning for ${domain}:`, dnsErr.message);
  }

  return { valid: true };
}

app.post('/api/auth/signup', async (req, res) => {
  try {
    let name = (req.body.name || '').trim();
    let email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    // Auto-detect swapped fields (e.g. if name contains an email address and email is a name)
    if (name.includes('@') && !email.includes('@')) {
      const temp = name;
      name = email;
      email = temp.toLowerCase();
    }

    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Please enter your full name, email, and password.' });
    }

    // Verify email format, Gmail rules, and real DNS MX record
    const emailCheck = await verifyEmailAddress(email);
    if (!emailCheck.valid) {
      return res.status(400).json({ error: emailCheck.error });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match. Please verify.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const existing = await db.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
    }

    const { hash, salt } = hashPassword(password);
    const password_hash = `${salt}:${hash}`;
    const avatar = req.body.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name.trim())}`;
    
    const user = await db.createUser({
      email,
      name,
      password_hash,
      avatar
    });

    const token = generateToken({ userId: user.id, email: user.email, name: user.name });
    res.json({
      message: 'Account created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar || avatar
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to create account', details: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const user = await db.getUserByEmail(cleanEmail);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const [salt, hash] = (user.password_hash || '').split(':');
    if (!salt || !hash || !verifyPassword(password, hash, salt)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken({ userId: user.id, email: user.email, name: user.name });
    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}`
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to sign in', details: err.message });
  }
});

app.get('/api/auth/me', async (req, res) => {
  if (req.userId === 'guest') {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  try {
    const user = await db.getUserById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}`
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user profile', details: err.message });
  }
});

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
app.get('/api/streams/:type/:id', requireAuth, async (req, res) => {
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

// Batch Season Download as .ZIP archive (Requires authentication)
app.get('/api/batch/zip', requireAuth, async (req, res) => {
  try {
    const { id, season = 1 } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'Missing series id' });
    }

    const { buffer, filename } = await createSeasonBatchZip(id, season);

    // Record in local downloads database
    try {
      await db.saveDownload({
        media_id: id,
        title: filename.replace('.zip', ''),
        release_title: `Complete Season ${season} Batch ZIP Archive`,
        quality: 'BATCH ZIP',
        size: `${Math.round((buffer.length / (1024 * 1024)) * 10) / 10} MB`,
        seeders: 100,
        magnet: `/api/batch/zip?id=${id}&season=${season}`,
        info_hash: 'batch_zip',
        status: 'downloaded_zip'
      }, req.userId);
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

// Cloudstream 3 Repository Manifest & Plugins (Add as repository in Cloudstream app)
app.get([
  '/repo.json',
  '/cloudstream/repo.json',
  '/api/cloudstream/repo.json',
  '/api/cloudstream/manifest.json',
  '/cloudstream-repo.json',
  '/api/cloudstream/repo'
], (req, res) => {
  const host = req.get('host') || 'xenmovies.antideploy.app';
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.json(getCloudstreamRepo(`${protocol}://${host}`));
});

app.get([
  '/plugins.json',
  '/cloudstream/plugins.json',
  '/api/cloudstream/plugins.json'
], (req, res) => {
  const host = req.get('host') || 'xenmovies.antideploy.app';
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.json(getCloudstreamPlugins(`${protocol}://${host}`));
});

// Recommendations & "More Like This"
app.get('/api/recommendations/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const items = await fetchRecommendations(type, id);
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recommendations', items: [] });
  }
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

// --- Database API Endpoints (Postgres on Cloud / SQLite fallback) ---
app.get('/api/history', async (req, res) => {
  try {
    const rows = await db.getHistory(req.userId);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/history', async (req, res) => {
  try {
    const result = await db.saveHistory(req.body, req.userId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/history/:id', async (req, res) => {
  try {
    await db.deleteHistory(req.params.id, req.userId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/watchlist', async (req, res) => {
  try {
    if (!req.userId || req.userId === 'guest') {
      return res.json([]);
    }
    const rows = await db.getWatchlist(req.userId);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/watchlist', requireAuth, async (req, res) => {
  try {
    const result = await db.toggleWatchlist(req.body, req.userId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/watchlist/:id', requireAuth, async (req, res) => {
  try {
    await db.deleteWatchlist(req.params.id, req.userId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/downloads', requireAuth, async (req, res) => {
  try {
    const rows = await db.getDownloads(req.userId);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/downloads', requireAuth, async (req, res) => {
  try {
    const result = await db.saveDownload(req.body, req.userId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/downloads/:id', requireAuth, async (req, res) => {
  try {
    await db.deleteDownload(req.params.id, req.userId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/settings', async (req, res) => {
  try {
    const settings = await db.getSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const result = await db.saveSettings(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const stats = await db.getStats(req.userId);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend static build if available
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, {
    maxAge: '1d',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    }
  }));
  app.use((req, res, next) => {
    // If request does not start with /api, serve index.html
    if (!req.path.startsWith('/api')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 XENMOVIES Core Server active at http://0.0.0.0:${PORT}`);
    console.log(`📡 Database mode: ${db.mode}`);
  });
}

export default app;
