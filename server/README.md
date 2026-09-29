# Folio API

Standalone Express API — a separate deployment from the client app in the
repo root. In-memory data only (see `db.ts`): everything resets whenever
this process restarts, which is expected on most host's free tiers whenever
the app goes idle.

## Local development

```
cp .env.example .env   # fill in GOOGLE_CLIENT_ID and JWT_SECRET
npm install
npm run dev
```

Runs on `http://localhost:3001` by default. The client's own `npm run dev`
(in the repo root) proxies `/api` to this port automatically — no
`VITE_API_URL` needed for local dev.

## Deploying

This needs a host that runs a normal long-lived Node process (Railway,
Fly.io, Render, a VPS with PM2 — anything like that). It is **not**
compatible with a serverless/edge platform such as Vercel or Netlify
Functions as-is, because the in-memory data (users, notes, reading
progress) would reset on every cold start and could be inconsistent across
concurrent invocations.

1. Deploy this `server/` directory as its own project (point the host's
   "root directory" at `server` if it's deploying from this same repo).
2. Set these environment variables on the host:
   - `CLIENT_ORIGIN` — the deployed frontend's exact origin, e.g.
     `https://folio.vercel.app` (no trailing slash). Required: the API
     only accepts cookies from this exact origin.
   - `GOOGLE_CLIENT_ID` — same Google Cloud Web Client ID the client uses
     as `VITE_GOOGLE_CLIENT_ID`.
   - `JWT_SECRET` — a long random string (`openssl rand -hex 32`).
   - `PORT` — most hosts set this for you; only set it yourself if the
     platform expects the app to read a specific one.
3. Start command: `npm start`.
4. In the client's own deployment, set `VITE_API_URL` to this API's public
   URL (e.g. `https://folio-api.up.railway.app`) and redeploy the client —
   it's a build-time value, so it has to be set before building, not after.
5. In Google Cloud Console, add the client's deployed origin to that OAuth
   Client ID's **Authorized JavaScript origins**.

The API must be served over HTTPS in production — the session cookie is
sent cross-site (`SameSite=None; Secure`), which browsers refuse over
plain HTTP. Every host listed above provides HTTPS by default.
