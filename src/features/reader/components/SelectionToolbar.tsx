import { MessageSquarePlus, Underline, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SWATCH_BG } from '../../notes/colors.ts'
import { ANNOTATION_COLORS } from '../../notes/useNotes.ts'
import type { AnnotationColor } from '../../notes/useNotes.ts'

export interface TextSelection {
  page: number
  quote: string
  rects: { x: number; y: number; w: number; h: number }[]
  /** Viewport position to anchor the toolbar. */
  left: number
  top: number
}

interface SelectionToolbarProps {
  selection: TextSelection
  onHighlight: (color: AnnotationColor) => void
  onUnderline: () => void
  onNote: () => void
  onDismiss: () => void
}

const btn =
  'inline-flex size-7 items-center justify-center rounded-md hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 dark:hover:bg-zinc-800'

export function SelectionToolbar({
  selection,
  onHighlight,
  onUnderline,
  onNote,
  onDismiss,
}: SelectionToolbarProps): React.JSX.Element {
  const { t } = useTranslation()
  return (
    <div
      role="toolbar"
      aria-label={t('reader.annotate')}
      // Keep the text selection alive while clicking toolbar buttons.
      onMouseDown={(e) => e.preventDefault()}
      ref={(el) => {
        el?.style.setProperty('--left', `${selection.left}px`)
        el?.style.setProperty('--top', `${selection.top}px`)
      }}
      className="fixed left-[var(--left)] top-[var(--top)] z-30 flex -translate-x-1/2 -translate-y-full items-center gap-0.5 rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900"
    >
      {ANNOTATION_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          aria-label={`${t('reader.highlight')} — ${t(`colors.${c}`)}`}
          title={t('reader.highlight')}
          onClick={() => onHighlight(c)}
          className={btn}
        >
          <span className={`size-4 rounded-full ${SWATCH_BG[c]}`} />
        </button>
      ))}
      <span className="mx-0.5 h-5 w-px bg-zinc-200 dark:bg-zinc-800" aria-hidden />
      <button type="button" aria-label={t('reader.underline')} title={t('reader.underline')} onClick={onUnderline} className={btn}>
        <Underline className="size-4" aria-hidden />
      </button>
      <button type="button" aria-label={t('reader.addNote')} title={t('reader.addNote')} onClick={onNote} className={btn}>
        <MessageSquarePlus className="size-4" aria-hidden />
      </button>
      <button type="button" aria-label={t('notes.close')} onClick={onDismiss} className={btn}>
        <X className="size-4" aria-hidden />
      </button>
    </div>
  )
}
