import { useDeferredValue } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { BookFilters, BookSort } from './types.ts'

export interface UseBookFilters {
  /** Raw values for controlled inputs. */
  inputs: BookFilters
  /** Search value deferred so typing stays responsive. */
  filters: BookFilters
  set: (patch: Partial<BookFilters>) => void
  reset: () => void
  isActive: boolean
}

const SORTS: readonly BookSort[] = ['title', 'author', 'year']

export function useBookFilters(): UseBookFilters {
  const [params, setParams] = useSearchParams()
  const sort = params.get('sort') as BookSort | null

  const inputs: BookFilters = {
    q: params.get('q') ?? '',
    genre: params.get('genre') ?? '',
    language: params.get('language') ?? '',
    sort: sort && SORTS.includes(sort) ? sort : 'title',
  }
  const deferredQ = useDeferredValue(inputs.q)

  const set = (patch: Partial<BookFilters>): void => {
    const next = { ...inputs, ...patch }
    setParams(
      Object.fromEntries(Object.entries(next).filter(([k, v]) => v && !(k === 'sort' && v === 'title'))),
      { replace: true },
    )
  }

  return {
    inputs,
    filters: { ...inputs, q: deferredQ.trim() },
    set,
    reset: () => setParams({}, { replace: true }),
    isActive: Boolean(inputs.q || inputs.genre || inputs.language),
  }
}
