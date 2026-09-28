import { copyFileSync, mkdirSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

// fs.cpSync crashes on some Windows/Node builds, so copy manually.
function copyDir(from, to) {
  mkdirSync(to, { recursive: true })
  for (const entry of readdirSync(from, { withFileTypes: true })) {
    const src = join(from, entry.name)
    const dest = join(to, entry.name)
    if (entry.isDirectory()) copyDir(src, dest)
    else copyFileSync(src, dest)
  }
}

for (const dir of ['wasm', 'cmaps', 'standard_fonts', 'iccs']) {
  copyDir(join('node_modules', 'pdfjs-dist', dir), join('public', 'pdfjs', dir))
}
