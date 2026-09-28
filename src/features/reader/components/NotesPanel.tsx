import { useTranslation } from 'react-i18next'
import type { Note } from '../../notes/useNotes.ts'

interface NotesPanelProps {
  notes: Note[]
  onSelect: (note: Note) => void
}

export function NotesPanel({ notes, onSelect }: NotesPanelProps): React.JSX.Element {
  const { t } = useTranslation()
  return (
    <aside
      aria-label={t('notes.title')}
      className="absolute right-3 top-3 z-20 flex max-h-[70%] w-72 flex-col gap-2 overflow-y-auto rounded-lg border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-500">{t('notes.title')}</h2>
      {notes.length === 0 ? (
        <p className="text-zinc-500">{t('notes.empty')}</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {notes.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => onSelect(n)}
                className="flex w-full flex-col gap-0.5 rounded-md p-2 text-left hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 dark:hover:bg-zinc-800"
              >
                <span className="text-[11px] text-amber-700 dark:text-amber-500">
                  {t('notes.page', { page: n.page })} · {t(`notes.kind.${n.kind}`)}
                </span>
                {n.quote && <span className="line-clamp-2 text-xs italic text-zinc-500">“{n.quote}”</span>}
                {n.text && <span className="line-clamp-2">{n.text}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
