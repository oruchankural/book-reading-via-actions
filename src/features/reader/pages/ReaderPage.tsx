import { BookOpen, ChevronLeft, ChevronRight, File, Highlighter, Lightbulb, StickyNote, X, ZoomIn, ZoomOut } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { useBook, useProgress, useSaveProgress } from '../../books/useBooks.ts'
import { NoteEditor } from '../../notes/NoteEditor.tsx'
import { useNoteActions, useNotes } from '../../notes/useNotes.ts'
import type { AnnotationColor, Note } from '../../notes/useNotes.ts'
import { FlipBook } from '../components/FlipBook.tsx'
import type { FlipBookHandle } from '../components/FlipBook.tsx'
import { LightOverlay } from '../components/LightOverlay.tsx'
import { LightPanel } from '../components/LightPanel.tsx'
import { NotesPanel } from '../components/NotesPanel.tsx'
import { SelectionToolbar } from '../components/SelectionToolbar.tsx'
import type { TextSelection } from '../components/SelectionToolbar.tsx'
import { resolveView, useReaderPrefs, ZOOM_MAX, ZOOM_MIN, ZOOM_STEP } from '../useReaderPrefs.ts'
import { useViewportWidth } from '../useViewportWidth.ts'

type Panel = 'light' | 'notes' | null
type Editor = { kind: 'new'; selection: TextSelection } | { kind: 'edit'; note: Note } | null

const SAVE_DELAY_MS = 600

const iconBtn =
  'inline-flex size-8 shrink-0 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 disabled:opacity-40 dark:text-zinc-300 dark:hover:bg-zinc-800'

const activeBtn = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'

export function ReaderPage(): React.JSX.Element {
  const { t } = useTranslation()
  const { id = '' } = useParams()
  const book = useBook(id)
  const progress = useProgress(id, true)
  const notes = useNotes(id)
  const saveProgress = useSaveProgress(id)
  const noteActions = useNoteActions(id)

  const flipRef = useRef<FlipBookHandle>(null)
  const { view, zoom, setView, zoomBy, resetZoom } = useReaderPrefs()
  const effectiveView = resolveView(view, useViewportWidth())
  const saveTimer = useRef<number>(undefined)
  const [page, setPage] = useState({ current: 1, total: 0 })
  const [panel, setPanel] = useState<Panel>(null)
  const [annotate, setAnnotate] = useState(false)
  const [selection, setSelection] = useState<TextSelection | null>(null)
  const [editor, setEditor] = useState<Editor>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowRight') flipRef.current?.next()
      if (e.key === 'ArrowLeft') flipRef.current?.prev()
      if (e.key === '+' || e.key === '=') zoomBy(ZOOM_STEP)
      if (e.key === '-') zoomBy(-ZOOM_STEP)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(saveTimer.current)
    }
  }, [zoomBy])

  const handlePageChange = useCallback(
    (current: number, total: number): void => {
      setPage({ current, total })
      window.clearTimeout(saveTimer.current)
      saveTimer.current = window.setTimeout(() => saveProgress(current), SAVE_DELAY_MS)
    },
    [saveProgress],
  )

  const togglePanel = (next: Exclude<Panel, null>): void => setPanel((p) => (p === next ? null : next))

  const closeEditor = (): void => setEditor(null)

  const clearSelection = (): void => {
    window.getSelection()?.removeAllRanges()
    setSelection(null)
  }

  const annotateSelection = (kind: 'highlight' | 'underline', color: AnnotationColor): void => {
    if (!selection) return
    noteActions.create({ page: selection.page, kind, color, quote: selection.quote, rects: selection.rects, text: '' })
    clearSelection()
  }

  const handleSave = (text: string): void => {
    if (editor?.kind === 'new') {
      const { page: p, quote, rects } = editor.selection
      noteActions.create({ page: p, kind: 'note', color: 'yellow', quote, rects, text })
    }
    if (editor?.kind === 'edit') noteActions.update(editor.note.id, { text })
    closeEditor()
  }

  const allNotes = notes.data ?? []
  const pdfUrl = book.data?.pdfUrl
  const ready = Boolean(pdfUrl) && progress.isSuccess && notes.isSuccess

  const onOpenNote = useCallback(
    (noteId: string): void => {
      const note = notes.data?.find((n) => n.id === noteId)
      if (note) setEditor({ kind: 'edit', note })
    },
    [notes.data],
  )

  return (
    <div className="flex h-full flex-col bg-zinc-100 dark:bg-zinc-900">
      <header className="flex h-12 shrink-0 items-center gap-1 overflow-x-auto border-b border-zinc-200 bg-white px-2 dark:border-zinc-800 dark:bg-zinc-950">
        <Link to={`/books/${id}`} aria-label={t('reader.close')} title={t('reader.close')} className={iconBtn}>
          <X className="size-4" aria-hidden />
        </Link>
        <h1 className="min-w-16 flex-1 truncate px-1 text-sm font-medium">{book.data?.title}</h1>

        <div role="group" aria-label={t('reader.view')} className="flex shrink-0">
          <button
            type="button"
            aria-label={t('reader.singlePage')}
            title={t('reader.singlePage')}
            aria-pressed={effectiveView === 'single'}
            onClick={() => setView('single')}
            className={`${iconBtn} ${effectiveView === 'single' ? activeBtn : ''}`}
          >
            <File className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label={t('reader.doublePage')}
            title={t('reader.doublePage')}
            aria-pressed={effectiveView === 'double'}
            onClick={() => setView('double')}
            className={`${iconBtn} ${effectiveView === 'double' ? activeBtn : ''}`}
          >
            <BookOpen className="size-4" aria-hidden />
          </button>
        </div>

        <div role="group" aria-label={t('reader.zoom')} className="flex shrink-0 items-center">
          <button
            type="button"
            aria-label={t('reader.zoomOut')}
            disabled={zoom <= ZOOM_MIN}
            onClick={() => zoomBy(-ZOOM_STEP)}
            className={iconBtn}
          >
            <ZoomOut className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label={t('reader.zoomReset')}
            onClick={resetZoom}
            className="h-8 w-12 shrink-0 rounded-md text-xs tabular-nums text-zinc-600 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            aria-label={t('reader.zoomIn')}
            disabled={zoom >= ZOOM_MAX}
            onClick={() => zoomBy(ZOOM_STEP)}
            className={iconBtn}
          >
            <ZoomIn className="size-4" aria-hidden />
          </button>
        </div>

        <span className="mx-1 h-5 w-px shrink-0 bg-zinc-200 dark:bg-zinc-800" aria-hidden />

        <button
          type="button"
          aria-pressed={annotate}
          onClick={() => {
            clearSelection()
            setAnnotate((v) => !v)
          }}
          className={`${iconBtn} w-auto gap-1.5 px-2 text-xs ${annotate ? activeBtn : ''}`}
        >
          <Highlighter className="size-4" aria-hidden />
          <span className="hidden sm:inline">{t('reader.annotate')}</span>
        </button>
        <button
          type="button"
          aria-label={t('reader.notes')}
          aria-expanded={panel === 'notes'}
          onClick={() => togglePanel('notes')}
          className={iconBtn}
        >
          <StickyNote className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          aria-label={t('reader.light')}
          aria-expanded={panel === 'light'}
          onClick={() => togglePanel('light')}
          className={iconBtn}
        >
          <Lightbulb className="size-4" aria-hidden />
        </button>
      </header>

      <p className="hidden shrink-0 border-b border-zinc-200 bg-white px-3 py-1 text-center text-xs text-zinc-500 sm:block dark:border-zinc-800 dark:bg-zinc-950">
        {annotate ? t('reader.annotateOn') : t('reader.flipHint')}
      </p>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {ready && pdfUrl ? (
          <FlipBook
            ref={flipRef}
            url={pdfUrl}
            startPage={progress.data?.page ?? 1}
            notes={allNotes}
            annotate={annotate}
            onPageChange={handlePageChange}
            onSelect={setSelection}
            onOpenNote={onOpenNote}
          />
        ) : (
          <p className="p-6 text-sm text-zinc-500">{t('reader.loading')}</p>
        )}

        <LightOverlay />

        {panel === 'light' && <LightPanel />}
        {panel === 'notes' && (
          <NotesPanel
            notes={allNotes}
            onSelect={(note) => {
              flipRef.current?.goTo(note.page)
              setEditor({ kind: 'edit', note })
            }}
          />
        )}
      </div>

      {/* A normal-flow bar, never floating over the page, so it can't land
          on top of the book's text the way edge-anchored buttons used to
          on narrow screens. */}
      <div className="flex h-11 shrink-0 items-center justify-center gap-3 border-t border-zinc-200 bg-white px-2 dark:border-zinc-800 dark:bg-zinc-950">
        <button
          type="button"
          aria-label={t('reader.prev')}
          onClick={() => flipRef.current?.prev()}
          className={iconBtn}
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        <span className="min-w-20 text-center text-xs tabular-nums text-zinc-500">
          {page.total > 0 && t('reader.page', { page: page.current, total: page.total })}
        </span>
        <button
          type="button"
          aria-label={t('reader.next')}
          onClick={() => flipRef.current?.next()}
          className={iconBtn}
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>

      {selection && !editor && (
        <SelectionToolbar
          selection={selection}
          onHighlight={(color) => annotateSelection('highlight', color)}
          onUnderline={() => annotateSelection('underline', 'pink')}
          onNote={() => {
            setEditor({ kind: 'new', selection })
            clearSelection()
          }}
          onDismiss={clearSelection}
        />
      )}

      {editor && (
        <NoteEditor
          key={editor.kind === 'edit' ? editor.note.id : 'new'}
          page={editor.kind === 'edit' ? editor.note.page : editor.selection.page}
          quote={editor.kind === 'edit' ? editor.note.quote : editor.selection.quote}
          requireText={editor.kind === 'new' || editor.note.kind === 'note'}
          initialText={editor.kind === 'edit' ? editor.note.text : ''}
          onSave={handleSave}
          onDelete={
            editor.kind === 'edit'
              ? () => {
                  noteActions.remove(editor.note.id)
                  closeEditor()
                }
              : undefined
          }
          onClose={closeEditor}
        />
      )}
    </div>
  )
}
