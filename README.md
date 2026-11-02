# 🎬 XENMOVIES — Aesthetic Free Streaming & Download Hub

A sleek, cyberpunk-glassmorphic personal movie and TV show streaming & downloading web application built to run **100% locally on your PC**. Inspired by sites like **HDHub4u** and **Vegamovies**, but redesigned with a modern, high-tech, ad-free cinema experience.

---

## ✨ Features at a Glance

### 1. 🔀 Dual Experience: "Stream It" or "Download It"
- **▶ Instant Stream**:
  - Embedded cinema player with **6 High-Speed Servers**:
    1. **VidLink Pro** (Ultra HD 4K, Subtitle Controls)
    2. **2Embed VIP** (Multi-Language Subtitles)
    3. **VidSrc ICU** (Dual Audio & High Bandwidth)
    4. **AutoEmbed Cloud** (Auto-Switching Mirror)
    5. **SmashyStream** (Fast Buffering)
    6. **MultiEmbed Global** (Backup Mirror)
  - Full TV Series Season & Episode Selector with episode thumbnails, titles, and air dates.
  - Theater Mode / Cinema Lights Dimmer.
  - Automatic progress tracking to local SQLite database so you can resume where you left off.

- **📥 Vegamovies / HDHub4u Download Engine**:
  - **📦 Whole Season Batch Download (.ZIP)**: Download an entire TV show season in one packaged `.zip` file! Includes a 1-click Windows batch downloader script (`.bat`), season batch magnets, individual episode shortcuts, offline player portal, and full episode guides.
  - **🧲 Complete Season Torrent Packs**: Download all episodes into a single organized folder directly in qBittorrent, FDM, or uTorrent.
  - Direct categorized downloads parsed from high-speed DHT & P2P trackers (1337x, YTS, TorrentGalaxy, Rutracker):
    - 🌟 **4K Ultra HD (2160p HDR/DV - AV1 & HEVC)**
    - 💎 **1080p Full HD (Dual Audio Hindi - English / 10-Bit)**
    - ⚡ **720p HD (High Speed Compact ~1GB)**
    - 📱 **480p SD (Mobile Friendly ~400MB)**
    - 🇮🇳 **Hindi Dubbed & Dual Audio Specials**
  - Displays seeders count, file size, codec badges (`AV1`, `HEVC`, `HDR10`, `Atmos`), and language flags.
  - **1-Click Launch**: Automatically opens magnets in **qBittorrent**, **uTorrent**, or **Free Download Manager (FDM)**.
  - One-click copy magnet button with instant clipboard feedback.
  - Save to local Download Queue.

### 2. 🌐 Integrated Free APIs (Zero Paid Keys Required)
- **Cinemeta API**: Millions of movies and TV series catalog, metadata, genres, search, cast, posters, and YouTube trailers.
- **Torrentio API**: Real-time stream and torrent resolver querying top global trackers.
- **Cloudstream 3 API Engine**: Built-in Cloudstream multi-provider resolver (SoraStream, SuperStream, Vegamovies Mirror) with `cloudstream://` deep linking and custom repository manifest.
- **TVMaze & OpenSubtitles**: TV episode structuring and subtitle feeds.
- **6 Free Streaming Embed Providers**: VidLink, 2Embed, VidSrc, AutoEmbed, SmashyStream, MultiEmbed.

### 3. 💾 Local Data Persistence (SQLite `xenmovies.db`)
- **Continue Watching / History**: Automatically records your last played media, season, episode, and progress.
- **My Watchlist**: Bookmark movies & shows into your personal local vault.
- **Download Queue**: Log of all downloaded/magnet links generated.
- **Settings & Preferences**: Saved server preference, theme preference, audio priority.
- **Cinema Stats**: Analytics dashboard showing total stream hours and watched breakdown.

### 4. 🎨 5 Unique Aesthetic Themes
- 🟣 **Cyberpunk Neon**: Electric Violet, Neon Cyan, Obsidian
- 🟢 **Matrix Emerald**: Hacker Green, Mint, Deep Pitch
- 🔴 **Crimson OLED**: Cinematic Red, Rose Glow, Velvet
- 🟡 **Solar Amber**: Warm Amber, Luxury Gold, Carbon
- 🔵 **Glacier Blue**: Deep Ocean Blue, Electric Sky, Slate

---

## 🚀 How to Run Locally

### Option A: 1-Click Launch (Recommended)
Simply double-click:
```bat
start.bat
```
*(Or right-click `run.ps1` and select "Run with PowerShell")*

This will automatically launch the server and open your browser at:
👉 **`http://localhost:5000`**

---

### Option B: Command Line (Development Mode)
```bash
# Install dependencies (already installed)
npm install

# Start both Express backend and Vite hot-reload frontend
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend API & DB: `http://localhost:5000`

---

## 🧲 Recommended Windows Torrent Clients
To make the 1-click **"Start Download"** button open seamlessly:
- **qBittorrent** (Free, open source, no ads — Recommended): [https://www.qbittorrent.org/](https://www.qbittorrent.org/)
- **Free Download Manager (FDM)**: [https://www.freedownloadmanager.org/](https://www.freedownloadmanager.org/)
- **uTorrent / BitTorrent**

---

## 📁 Project Architecture
```
D:\XENMOVIES\
├── package.json           # Scripts & modern dependencies
├── vite.config.js         # Vite + Tailwind v4 + API proxy
├── xenmovies.db           # Local SQLite database (auto-created)
├── start.bat              # 1-Click Windows launcher
├── run.ps1                # PowerShell launcher
├── dist/                  # Production-ready client build
├── src/                   # React frontend
│   ├── App.jsx            # Main app router & tabs
│   ├── index.css          # Cyberpunk glassmorphism styles & themes
│   ├── context/
│   │   └── AppContext.jsx # Global state & SQLite data sync
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── HeroBanner.jsx
│   │   ├── MovieCard.jsx
│   │   ├── StreamPlayerModal.jsx  # 6-server embedded player
│   │   ├── DownloadModal.jsx      # Vegamovies 4K/1080p/Dual Audio engine
│   │   ├── MediaDetailsModal.jsx  # Trailer, cast, storyline, episodes
│   │   ├── FilterBar.jsx
│   │   ├── WatchlistTab.jsx
│   │   ├── HistoryTab.jsx
│   │   ├── DownloadsTab.jsx
│   │   ├── SettingsTab.jsx
│   │   └── StatsTab.jsx
│   └── services/
│       └── api.js
└── server/                # Node.js Express backend
    ├── index.js           # API routes & static file server
    ├── db.js              # SQLite schema & tables
    └── services/
        ├── cinemeta.js     # Metadata & catalog search
        ├── torrentio.js    # Magnet links & quality categorizer
        └── embedSources.js # Streaming server resolvers
```

