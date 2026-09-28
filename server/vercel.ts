// Source for the Vercel serverless entry point. Built (see package.json's
// `build:api` script) into `api/[...path].js` as a single self-contained
// bundle — Vercel's default Node builder only transpiles a function's own
// entry file, not the local .ts files it imports, so shipping this file
// as-is under /api fails at runtime with "Cannot find module
// '.../server/app.ts'". Bundling it ourselves sidesteps that entirely.
export { app as default } from './app.ts'
