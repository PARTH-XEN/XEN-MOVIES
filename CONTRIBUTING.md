# Contributing

Thanks for your interest in improving XEN-MOVIES.

## Before making changes

1. Open an issue to discuss substantial changes.
2. Keep pull requests focused on one concern.
3. Avoid unrelated formatting or generated-file changes.

## Development

```bash
npm ci
cp .env.example .env
npm run dev
```

On Windows PowerShell, copy the environment template with:

```powershell
Copy-Item .env.example .env
```

Before submitting a pull request, run:

```bash
npm run build
```

## Pull requests

Please include:

- A concise description of the change
- The reason for the change
- Screenshots for visible UI changes
- Steps used to test the change
- Any environment or database migration notes

## Repository hygiene

Do not commit:

- `node_modules/`
- Generated `dist/` output
- `.env` files or credentials
- Local SQLite database files
- Personal data, logs, caches, or temporary archives

Please ensure that any third-party assets and services you introduce are used in accordance with their licenses and terms.
