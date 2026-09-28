import { build } from 'esbuild'

// Bundles the whole Express app (server/app.ts, everything it imports, and
// its node_modules dependencies) into one self-contained plain-JS file at
// the exact path Vercel's catch-all convention expects. See server/vercel.ts
// for why bundling is necessary, and why this file is committed rather than
// generated on Vercel: Vercel discovers /api Serverless Functions straight
// from the git-checked-out source before (not after) it runs our own build
// command, so a gitignored, build-time-only output is never seen — it has
// to already exist in the repo. Run this (and commit the result) whenever
// files under server/ change.
await build({
  entryPoints: ['server/vercel.ts'],
  outfile: 'api/[...path].js',
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
})
