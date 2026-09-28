import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { Book } from '../types.ts'
import { BookCover } from './BookCover.tsx'

interface BookCardProps {
  book: Book
}

export function BookCard({ book }: BookCardProps): React.JSX.Element {
  const { t } = useTranslation()
  return (
    <Link
      to={`/books/${book.id}`}
      className="group flex flex-col gap-2 rounded-lg p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
    >
      <BookCover book={book} className="transition-transform group-hover:-translate-y-0.5" />
      <div className="min-w-0 px-0.5">
        <p className="truncate text-sm font-medium">{book.title}</p>
        <p className="truncate text-xs text-zinc-500">{book.author}</p>
        <p className="mt-0.5 text-[11px] text-zinc-400">
          {t(`genres.${book.genre}`, book.genre)} · {book.year}
          {!book.pdfUrl && ` · ${t('library.comingSoon')}`}
        </p>
      </div>
    </Link>
  )
}
