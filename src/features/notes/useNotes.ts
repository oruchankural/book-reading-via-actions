import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import { api } from '../../shared/api/client.ts'

export type AnnotationKind = 'note' | 'highlight' | 'underline'
export type AnnotationColor = 'yellow' | 'green' | 'pink' | 'blue'

export const ANNOTATION_COLORS: readonly AnnotationColor[] = ['yellow', 'green', 'pink', 'blue']

/** Rectangle in percent of the page's width/height. */
export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface Note {
  id: string
  bookId: string
  page: number
  kind: AnnotationKind
  color: AnnotationColor
  quote: string
  rects: Rect[]
  x: number
  y: number
  text: string
  createdAt: string
  updatedAt: string
}

export interface NewNote {
  page: number
  kind: AnnotationKind
  color: AnnotationColor
  quote: string
  rects: Rect[]
  text: string
}

export interface NotePatch {
  text?: string
  color?: AnnotationColor
}

export interface NoteActions {
  create: (note: NewNote) => void
  update: (id: string, patch: NotePatch) => void
  remove: (id: string) => void
}

export function useNotes(bookId: string): UseQueryResult<Note[]> {
  return useQuery({ queryKey: ['notes', bookId], queryFn: () => api<Note[]>(`/books/${bookId}/notes`) })
}

export function useNoteActions(bookId: string): NoteActions {
  const qc = useQueryClient()
  const invalidate = (): Promise<void> => qc.invalidateQueries({ queryKey: ['notes', bookId] })

  const create = useMutation({
    mutationFn: (note: NewNote) =>
      api<Note>(`/books/${bookId}/notes`, { method: 'POST', body: JSON.stringify(note) }),
    onSuccess: invalidate,
  })
  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: NotePatch }) =>
      api<Note>(`/notes/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
    onSuccess: invalidate,
  })
  const remove = useMutation({
    mutationFn: (id: string) => api<void>(`/notes/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  })

  return {
    create: create.mutate,
    update: (id, patch) => update.mutate({ id, patch }),
    remove: remove.mutate,
  }
}
