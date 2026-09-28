// Vercel's native catch-all: any request to /api/* is routed to this one
// function, and Express does its own internal routing from there (see
// server/app.ts) exactly as it does for a normal `/api/...` request locally.
// This file has no other code on purpose — Express apps are already valid
// (req, res) request handlers, so re-exporting it is all Vercel needs.
export { app as default } from '../server/app.ts'
