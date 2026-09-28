import seedData from './data/books.json' with { type: 'json' }
import type { Book, Note, Progress, User } from './types.ts'

// A static import (not readFileSync) so the Vercel build can bundle this
// data straight into the function: that build produces one standalone JS
// file, and a runtime file read resolved relative to it would miss —
// server/data/books.json isn't deployed alongside the bundle.
const seed = seedData as Book[]

/** In-memory "database". Resets on server restart. */
export const db = {
  books: seed,
  users: new Map<string, User>(),
  notes: new Map<string, Note>(),
  progress: new Map<string, Progress>(),
}

export const progressKey = (userId: string, bookId: string): string => `${userId}:${bookId}`
