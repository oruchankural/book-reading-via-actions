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

export type BookSort = 'title' | 'author' | 'year'

export interface BookFilters {
  q: string
  genre: string
  language: string
  sort: BookSort
}

export interface BookList {
  items: Book[]
  total: number
}

export interface BookFacets {
  genres: string[]
  languages: string[]
}

export interface Progress {
  bookId: string
  page: number
  updatedAt: string
}
