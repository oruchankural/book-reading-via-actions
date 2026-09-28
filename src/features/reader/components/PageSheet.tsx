import { MessageSquare } from 'lucide-react'
import { memo, useMemo } from 'react'
import { Page } from 'react-pdf'
import 'react-pdf/dist/Page/TextLayer.css'
import { HIGHLIGHT_BG, UNDERLINE_BORDER } from '../../notes/colors.ts'
import type { Note } from '../../notes/useNotes.ts'

interface PageSheetProps {
  number: number
  width: number
  notes: Note[]
  annotate: boolean
  onOpenNote: (id: string) => void
}

/**
 * Only the open spread's pages ever mount, so each renders unconditionally.
 * Memoized because it wraps a real PDF canvas render, which isn't free: a
 * page shouldn't redo that work when an unrelated ancestor re-renders.
 */
export const PageSheet = memo(function PageSheet({
  number,
  width,
  notes,
  annotate,
  onOpenNote,
}: PageSheetProps): React.JSX.Element {
  const pageNotes = useMemo(() => notes.filter((n) => n.page === number), [notes, number])

  return (
    <div
      data-page={number}
      className={`relative shrink-0 overflow-hidden bg-white ${annotate ? '' : '[&_.react-pdf__Page__textContent]:pointer-events-none'}`}
      style={{ width }}
    >
      <Page pageNumber={number} width={width} loading={null} renderAnnotationLayer={false} />

      {pageNotes.flatMap((n) =>
        n.rects.map((r, i) => (
          <span
            key={`${n.id}-${i}`}
            aria-hidden
            ref={(el) => {
              el?.style.setProperty('--x', `${r.x}%`)
              el?.style.setProperty('--y', `${r.y}%`)
              el?.style.setProperty('--w', `${r.w}%`)
              el?.style.setProperty('--h', `${r.h}%`)
            }}
            className={`pointer-events-none absolute left-[var(--x)] top-[var(--y)] h-[var(--h)] w-[var(--w)] ${
              n.kind === 'underline'
                ? `border-b-2 ${UNDERLINE_BORDER[n.color]}`
                : `${HIGHLIGHT_BG[n.color]} mix-blend-multiply`
            }`}
          />
        )),
      )}

      {pageNotes
        .filter((n) => n.text)
        .map((n) => (
          <button
            key={n.id}
            type="button"
            aria-label={n.text}
            title={n.text}
            onClick={(e) => {
              e.stopPropagation()
              onOpenNote(n.id)
            }}
            ref={(el) => {
              el?.style.setProperty('--x', `${n.x}%`)
              el?.style.setProperty('--y', `${n.y}%`)
            }}
            className="absolute left-[var(--x)] top-[var(--y)] z-[5] flex size-6 -translate-x-1/2 -translate-y-full items-center justify-center rounded-full rounded-bl-none bg-amber-600 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
          >
            <MessageSquare className="size-3" aria-hidden />
          </button>
        ))}
    </div>
  )
})
