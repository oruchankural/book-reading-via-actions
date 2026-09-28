import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import { api } from '../../shared/api/client.ts'
import type { Book, BookFacets, BookFilters, BookList, Progress } from './types.ts'

export function useBookList(filters: BookFilters): UseQueryResult<BookList> {
  const params = new URLSearchParams()
  if (filters.q) params.set('q', filters.q)
  if (filters.genre) params.set('genre', filters.genre)
  if (filters.language) params.set('language', filters.language)
  params.set('sort', filters.sort)

  return useQuery({
    queryKey: ['books', filters],
    queryFn: () => api<BookList>(`/books?${params}`),
    placeholderData: keepPreviousData,
  })
}

export function useBookFacets(): UseQueryResult<BookFacets> {
  return useQuery({
    queryKey: ['book-facets'],
    queryFn: () => api<BookFacets>('/books/facets'),
    staleTime: Infinity,
  })
}

export function useBook(id: string): UseQueryResult<Book> {
  return useQuery({ queryKey: ['book', id], queryFn: () => api<Book>(`/books/${id}`) })
}

export function useProgress(bookId: string, enabled: boolean): UseQueryResult<Progress | null> {
  return useQuery({
    queryKey: ['progress', bookId],
    queryFn: () => api<Progress | null>(`/books/${bookId}/progress`),
    enabled,
  })
}

export function useSaveProgress(bookId: string): (page: number) => void {
  const qc = useQueryClient()
  const { mutate } = useMutation({
    mutationFn: (page: number) =>
      api<Progress>(`/books/${bookId}/progress`, { method: 'PUT', body: JSON.stringify({ page }) }),
    onSuccess: (data) => qc.setQueryData(['progress', bookId], data),
  })
  return mutate
}
