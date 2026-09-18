# API server authentication configuration

The management portal uses Google OAuth and an opaque, in-memory application
session. Configure these environment variables for the API server:

- `GOOGLE_CLIENT_ID` — OAuth 2.0 client ID from Google Cloud.
- `GOOGLE_CLIENT_SECRET` — OAuth 2.0 client secret.
- `GOOGLE_REDIRECT_URI` — optional. If omitted, the API derives
  `https://<public-host>/api/auth/google/callback` from the incoming request.
- `SESSION_SECRET` — required in production and used to hash session tokens.

Register the exact redirect URI in the Google OAuth client. Sessions are
intentionally not persisted in the demonstration data store; restarting the
API invalidates active sessions.