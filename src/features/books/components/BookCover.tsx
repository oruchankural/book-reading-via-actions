import type { Book } from '../types.ts'

interface BookCoverProps {
  book: Pick<Book, 'title' | 'author' | 'coverColor'>
  className?: string
}

/** Cover art is generated from the book's accent color (no image assets needed). */
export function BookCover({ book, className = '' }: BookCoverProps): React.JSX.Element {
  return (
    <div
      role="img"
      aria-label={`${book.title} — ${book.author}`}
      ref={(el) => el?.style.setProperty('--cover', book.coverColor)}
      className={`relative flex aspect-[2/3] flex-col justify-between overflow-hidden rounded-md border border-zinc-200 bg-[var(--cover)] p-3 text-white dark:border-zinc-800 ${className}`}
    >
      <span className="absolute inset-y-0 left-0 w-1.5 bg-black/25" aria-hidden />
      <span className="line-clamp-4 pl-1.5 text-sm font-semibold leading-tight">{book.title}</span>
      <span className="line-clamp-1 pl-1.5 text-[11px] uppercase tracking-wide text-white/70">{book.author}</span>
    </div>
  )
}
