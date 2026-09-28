import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import { z } from 'zod'
import { currentUser, requireAuth } from './auth.js'
import { db, progressKey } from './db.js'
import type { Note, Progress } from './types.ts'

export const libraryRouter = Router()

const listQuery = z.object({
  q: z.string().trim().optional(),
  genre: z.string().optional(),
  language: z.string().optional(),
  sort: z.enum(['title', 'author', 'year']).default('title'),
})

libraryRouter.get('/books', (req, res) => {
  const parsed = listQuery.safeParse(req.query)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid query' })
    return
  }
  const { q, genre, language, sort } = parsed.data
  const needle = q?.toLocaleLowerCase()
  const items = db.books
    .filter((b) => !genre || b.genre === genre)
    .filter((b) => !language || b.language === language)
    .filter(
      (b) =>
        !needle ||
        `${b.title} ${b.author} ${b.description}`.toLocaleLowerCase().includes(needle),
    )
    .toSorted((a, b) =>
      sort === 'year' ? b.year - a.year : a[sort].localeCompare(b[sort]),
    )
  res.json({ items, total: items.length })
})

libraryRouter.get('/books/facets', (_req, res) => {
  res.json({
    genres: [...new Set(db.books.map((b) => b.genre))].sort(),
    languages: [...new Set(db.books.map((b) => b.language))].sort(),
  })
})

libraryRouter.get('/books/:id', (req, res) => {
  const book = db.books.find((b) => b.id === req.params.id)
  if (!book) {
    res.status(404).json({ error: 'Book not found' })
    return
  }
  res.json(book)
})

// ---- Progress (last page read)

libraryRouter.get('/books/:id/progress', requireAuth, (req, res) => {
  const p = db.progress.get(progressKey(currentUser(res).id, String(req.params.id)))
  res.json(p ?? null)
})

libraryRouter.put('/books/:id/progress', requireAuth, (req, res) => {
  const body = z.object({ page: z.number().int().min(1) }).safeParse(req.body)
  const bookId = String(req.params.id)
  if (!body.success || !db.books.some((b) => b.id === bookId)) {
    res.status(400).json({ error: 'Invalid request' })
    return
  }
  const userId = currentUser(res).id
  const progress: Progress = { userId, bookId, page: body.data.page, updatedAt: new Date().toISOString() }
  db.progress.set(progressKey(userId, bookId), progress)
  res.json(progress)
})

// ---- Notes

const pct = z.number().min(0).max(100)

const noteBody = z
  .object({
    page: z.number().int().min(1),
    kind: z.enum(['note', 'highlight', 'underline']),
    color: z.enum(['yellow', 'green', 'pink', 'blue']).default('yellow'),
    quote: z.string().max(3000).default(''),
    rects: z.array(z.object({ x: pct, y: pct, w: pct, h: pct })).min(1).max(60),
    text: z.string().trim().max(1000).default(''),
  })
  .refine((n) => n.kind !== 'note' || n.text.length > 0, { path: ['text'], message: 'Note text required' })

libraryRouter.get('/books/:id/notes', requireAuth, (req, res) => {
  const userId = currentUser(res).id
  const items = [...db.notes.values()]
    .filter((n) => n.userId === userId && n.bookId === req.params.id)
    .sort((a, b) => a.page - b.page || a.createdAt.localeCompare(b.createdAt))
  res.json(items)
})

libraryRouter.post('/books/:id/notes', requireAuth, (req, res) => {
  const body = noteBody.safeParse(req.body)
  const bookId = String(req.params.id)
  if (!body.success || !db.books.some((b) => b.id === bookId)) {
    res.status(400).json({ error: 'Invalid request' })
    return
  }
  const now = new Date().toISOString()
  const note: Note = {
    id: randomUUID(),
    userId: currentUser(res).id,
    bookId,
    ...body.data,
    x: body.data.rects[0].x,
    y: body.data.rects[0].y,
    createdAt: now,
    updatedAt: now,
  }
  db.notes.set(note.id, note)
  res.status(201).json(note)
})

libraryRouter.patch('/notes/:id', requireAuth, (req, res) => {
  const body = z
    .object({
      text: z.string().trim().max(1000).optional(),
      color: z.enum(['yellow', 'green', 'pink', 'blue']).optional(),
    })
    .safeParse(req.body)
  const note = db.notes.get(String(req.params.id))
  if (!body.success || !note || note.userId !== currentUser(res).id) {
    res.status(404).json({ error: 'Note not found' })
    return
  }
  const text = body.data.text ?? note.text
  if (note.kind === 'note' && text.length === 0) {
    res.status(400).json({ error: 'Note text required' })
    return
  }
  const updated: Note = {
    ...note,
    text,
    color: body.data.color ?? note.color,
    updatedAt: new Date().toISOString(),
  }
  db.notes.set(updated.id, updated)
  res.json(updated)
})

libraryRouter.delete('/notes/:id', requireAuth, (req, res) => {
  const note = db.notes.get(String(req.params.id))
  if (!note || note.userId !== currentUser(res).id) {
    res.status(404).json({ error: 'Note not found' })
    return
  }
  db.notes.delete(note.id)
  res.status(204).end()
})
