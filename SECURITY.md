# Security Policy

## Reporting a vulnerability

Please do not publish credentials, private user data, or exploitable vulnerability details in a public issue.

Use GitHub's private vulnerability reporting feature if it is enabled for this repository. Otherwise, contact the repository maintainer privately through a verified contact method listed on the maintainer's GitHub profile.

## Important deployment note

The current API contains history, watchlist, downloads, and settings endpoints without authentication or per-user authorization. Do not use a shared production database for personal user data until authentication, authorization, per-user data isolation, input validation, and rate limiting have been implemented and reviewed.

## Secret handling

- Never commit `.env` files, database credentials, API tokens, or private database files.
- If a secret is exposed, revoke or rotate it immediately. Removing it from the latest commit does not remove it from Git history.
- Keep dependencies updated and review security alerts.
