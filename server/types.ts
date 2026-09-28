export interface Book {
  id: string
  title: string
  author: string
  description: string
  genre: string
  language: string
  year: number
  pages: number
  coverColor: string
  pdfUrl: string | null
}

export interface User {
  id: string
  email: string
  name: string
  picture: string | null
}

export type AnnotationKind = 'note' | 'highlight' | 'underline'
export type AnnotationColor = 'yellow' | 'green' | 'pink' | 'blue'

/** Rectangle in percent of the page's width/height. */
export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface Note {
  id: string
  userId: string
  bookId: string
  page: number
  kind: AnnotationKind
  color: AnnotationColor
  /** Selected PDF text this annotation is attached to. */
  quote: string
  rects: Rect[]
  /** Bubble anchor: top-left of the first rect. */
  x: number
  y: number
  text: string
  createdAt: string
  updatedAt: string
}

export interface Progress {
  userId: string
  bookId: string
  page: number
  updatedAt: string
}
