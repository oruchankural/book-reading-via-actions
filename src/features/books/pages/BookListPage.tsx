import { useTranslation } from 'react-i18next'
import { BookCard } from '../components/BookCard.tsx'
import { BookFilterBar } from '../components/BookFilterBar.tsx'
import { useBookFacets, useBookList } from '../useBooks.ts'
import { useBookFilters } from '../useBookFilters.ts'

export function BookListPage(): React.JSX.Element {
  const { t } = useTranslation()
  const { inputs, filters, set, reset, isActive } = useBookFilters()
  const list = useBookList(filters)
  const facets = useBookFacets()

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h1 className="text-lg font-semibold">{t('library.title')}</h1>
        {list.data && <span className="text-xs text-zinc-500">{t('library.results', { count: list.data.total })}</span>}
      </div>

      <BookFilterBar values={inputs} facets={facets.data} onChange={set} />

      {list.data?.items.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-sm text-zinc-500">
          <p>{t('library.empty')}</p>
          {isActive && (
            <button
              type="button"
              onClick={reset}
              className="rounded-md border border-zinc-200 px-3 py-1.5 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              {t('library.reset')}
            </button>
          )}
        </div>
      ) : (
        <ul className="mt-5 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {list.data?.items.map((book) => (
            <li key={book.id}>
              <BookCard book={book} />
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
