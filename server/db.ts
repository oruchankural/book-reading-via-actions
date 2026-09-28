import { readFileSync } from 'node:fs'
import type { Book, Note, Progress, User } from './types.ts'

const seed = JSON.parse(
  readFileSync(new URL('./data/books.json', import.meta.url), 'utf-8'),
) as Book[]

/** In-memory "database". Resets on server restart. */
export const db = {
  books: seed,
  users: new Map<string, User>(),
  notes: new Map<string, Note>(),
  progress: new Map<string, Progress>(),
}

export const progressKey = (userId: string, bookId: string): string => `${userId}:${bookId}`
