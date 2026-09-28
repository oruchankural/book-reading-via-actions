import { build } from 'esbuild'

// Bundles the whole Express app (server/app.ts and everything it imports)
// into one plain-JS file at the exact path Vercel's catch-all convention
// expects. See server/vercel.ts for why this is necessary.
await build({
  entryPoints: ['server/vercel.ts'],
  outfile: 'api/[...path].js',
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  packages: 'external',
})
