# XEN-MOVIES

A React + Vite frontend with an Express API for movie and TV-series discovery, metadata browsing, watchlists, viewing history, preferences, and personal statistics.

> **Content and third-party services:** This project does not host or store movie or TV media. The source includes integrations with third-party services, whose availability, terms, and content rights are outside this project's control. Only access content you are legally authorized to view, and follow the laws and terms that apply where you live.

## Features

- Movie and TV-series catalogue discovery and search
- Metadata, artwork, cast, and episode information from external metadata services
- Watchlist and viewing-history features
- Local preferences and theme options
- Personal viewing statistics
- React frontend, Express API, and SQLite/PostgreSQL database adapters
- Vite development server and production build

Feature availability depends on the configured third-party services.

## Technology

- React
- Vite
- Tailwind CSS
- Express
- SQLite (`better-sqlite3`) for local use
- PostgreSQL (`pg`) when `DATABASE_URL` is configured

## Requirements

- Node.js 22 (or a compatible supported version)
- npm
- Windows is required only for the included `.bat` and PowerShell launchers

## Getting started

1. Clone the repository:

   ```bash
   git clone https://github.com/PARTH-XEN/XEN-MOVIES.git
   cd XEN-MOVIES
   ```

2. Install dependencies:

   ```bash
   npm ci
   ```

3. Create your local environment file:

   ```bash
   cp .env.example .env
   ```

   On Windows PowerShell, use:

   ```powershell
   Copy-Item .env.example .env
   ```

4. Start the development frontend and API:

   ```bash
   npm run dev
   ```

   - Vite frontend: `http://localhost:5173`
   - Express API: `http://localhost:5000`

5. For a production-style local run:

   ```bash
   npm start
   ```

   The `prestart` script builds the frontend before starting the Express server.

## Environment configuration

See [`.env.example`](.env.example).

- `PORT` controls the Express server port (defaults to `5000`).
- `DATABASE_URL` is optional. If set, the server uses PostgreSQL. If omitted, the local SQLite fallback is used.

Never commit `.env`, database credentials, API tokens, or real user data.

## Database and deployment warning

The current API includes history, watchlist, downloads, and settings endpoints without user authentication or per-user access controls. If you deploy this application for multiple visitors with a shared PostgreSQL database, those records and settings may be shared across visitors.

**Do not store personal or sensitive user data in a public deployment until authentication, authorization, per-user data isolation, request validation, and appropriate rate limiting have been implemented and reviewed.** Use a disposable development database while evaluating the application.

For hosted deployments, verify that the database is persistent and backed up. The SQLite fallback writes a local database file; ephemeral hosting filesystems can lose that data after a restart or redeployment. PostgreSQL is generally more suitable for a hosted multi-instance deployment, but it does not replace authentication or access controls.

## Project structure

```text
.
├── LOGO/                  # Project logo assets
├── server/
│   ├── index.js           # Express API and static-file server
│   ├── db.js              # SQLite/PostgreSQL adapters
│   └── services/          # External metadata/service adapters
├── src/
│   ├── components/        # React UI components
│   ├── context/           # Application state
│   ├── hooks/             # UI hooks
│   ├── services/          # Frontend API client
│   └── utils/              # Shared frontend utilities
├── .env.example
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

## Available scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Run Vite and the Express API concurrently |
| `npm run dev:client` | Run the Vite development server |
| `npm run dev:server` | Run the Express API |
| `npm run build` | Build the frontend into `dist/` |
| `npm start` | Build the frontend, then start the Express server |

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Keep changes focused, avoid committing generated files, and never include secrets or real database contents.

## Security

Please read [SECURITY.md](SECURITY.md) before reporting a security issue. Do not post credentials, private data, or exploitable details in public issues.

## License

No license has been selected for redistribution of this project yet. The repository is public for inspection, but public visibility alone does not grant permission to copy, modify, or redistribute the code. Add a license only after the project owner has chosen the intended terms.
