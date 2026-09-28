import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth.ts'
import { BookCover } from '../components/BookCover.tsx'
import { useBook, useProgress } from '../useBooks.ts'

export function BookDetailPage(): React.JSX.Element {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const { user } = useAuth()
  const book = useBook(id)
  const progress = useProgress(id, Boolean(user))

  if (book.isError) return <p className="p-6 text-sm text-zinc-500">{t('detail.notFound')}</p>
  if (!book.data) return <div className="p-6" aria-busy />

  const b = book.data
  const lastPage = progress.data?.page

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6">
      <Link
        to="/"
        className="text-sm text-zinc-500 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 dark:hover:text-zinc-100"
      >
        ← {t('detail.back')}
      </Link>

      <div className="mt-5 grid gap-6 sm:grid-cols-[13rem_1fr]">
        <BookCover book={b} className="w-52 max-w-full" />

        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{b.title}</h1>
            <p className="text-zinc-500">{b.author}</p>
          </div>

          <p className="text-xs text-zinc-500">
            {t(`genres.${b.genre}`, b.genre)} · {t(`languages.${b.language}`, b.language)} · {b.year} ·{' '}
            {t('detail.pages', { count: b.pages })}
          </p>

          <p className="max-w-prose text-sm leading-relaxed">{b.description}</p>

          {lastPage && <p className="text-sm text-amber-700 dark:text-amber-500">{t('detail.lastRead', { page: lastPage })}</p>}

          <div className="mt-2 flex flex-wrap items-center gap-3">
            {b.pdfUrl ? (
              <Link
                to={`/books/${b.id}/read`}
                className="inline-flex h-9 items-center rounded-md bg-amber-600 px-4 text-sm font-medium text-white hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
              >
                {lastPage && lastPage > 1 ? t('detail.continue', { page: lastPage }) : t('detail.read')}
              </Link>
            ) : (
              <span className="text-sm text-zinc-500">{t('detail.unavailable')}</span>
            )}
            {b.pdfUrl && !user && <span className="text-xs text-zinc-500">{t('detail.signInToRead')}</span>}
          </div>
        </div>
      </div>
    </main>
  )
}
