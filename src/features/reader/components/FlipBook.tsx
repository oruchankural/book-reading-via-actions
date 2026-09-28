import { memo, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import type { Ref } from 'react'
import { Document, pdfjs } from 'react-pdf'
import { useTranslation } from 'react-i18next'
import type { Note } from '../../notes/useNotes.ts'
import { readPageSelection } from '../selection.ts'
import { useElementSize } from '../useElementSize.ts'
import { resolveView, useReaderPrefs } from '../useReaderPrefs.ts'
import { PageSheet } from './PageSheet.tsx'
import type { TextSelection } from './SelectionToolbar.tsx'

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()

export interface FlipBookHandle {
  prev: () => void
  next: () => void
  goTo: (page: number) => void
}

interface FlipBookProps {
  ref?: Ref<FlipBookHandle>
  url: string
  /** 1-based page to open on. */
  startPage: number
  notes: Note[]
  annotate: boolean
  onPageChange: (page: number, total: number) => void
  onSelect: (selection: TextSelection | null) => void
  onOpenNote: (id: string) => void
}

interface PdfMeta {
  total: number
  /** width / height of the first page */
  ratio: number
}

/** One page position in a spread; null renders as a blank facing page. */
type Slot = number | null

interface Transition {
  /** +1 turning forward, -1 turning back. */
  direction: 1 | -1
  targetPage: number
}

const STAGE_PADDING = 32
const SNAP = 8
const COVER_MS = 180
const REVEAL_MS = 220

const PDF_OPTIONS = {
  wasmUrl: '/pdfjs/wasm/',
  cMapUrl: '/pdfjs/cmaps/',
  standardFontDataUrl: '/pdfjs/standard_fonts/',
  iccUrl: '/pdfjs/iccs/',
}

/** Page 1 opens alone (as a cover); pairs follow, e.g. [null,1] [2,3] [4,5]. */
function buildSpreads(total: number, pagesAcross: number): Slot[][] {
  if (pagesAcross === 1) return Array.from({ length: total }, (_, i) => [i + 1])
  const spreads: Slot[][] = total > 0 ? [[null, 1]] : []
  for (let left = 2; left <= total; left += 2) {
    spreads.push(left === total ? [left, null] : [left, left + 1])
  }
  return spreads
}

/**
 * Wrapped in memo: it hosts a real PDF render, and a sibling UI change in
 * ReaderPage (opening the notes panel, say) shouldn't make it do any work.
 */
export const FlipBook = memo(function FlipBook({
  ref,
  url,
  startPage,
  notes,
  annotate,
  onPageChange,
  onSelect,
  onOpenNote,
}: FlipBookProps): React.JSX.Element {
  const { t } = useTranslation()
  const { ref: stageRef, size } = useElementSize()
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const { view, zoom } = useReaderPrefs()
  const [meta, setMeta] = useState<PdfMeta | null>(null)
  const [failed, setFailed] = useState(false)
  const [currentPage, setCurrentPage] = useState(startPage)
  // A page turn plays as an opaque curtain wiping across and back, never a
  // transform on the PDF canvases themselves: animating those directly was
  // dropping a fully black frame part-way through (a pdf.js/canvas
  // compositing quirk), which a plain-color layer can't reproduce.
  const [transition, setTransition] = useState<Transition | null>(null)
  const curtainRef = useRef<HTMLDivElement | null>(null)

  const latestOnPageChange = useRef(onPageChange)
  useEffect(() => {
    latestOnPageChange.current = onPageChange
  })

  const effectiveView = resolveView(view, size.width)
  const pagesAcross = effectiveView === 'double' ? 2 : 1
  const ratio = meta?.ratio ?? 0.7

  const fitHeight = Math.min(size.height - STAGE_PADDING, (size.width - STAGE_PADDING) / pagesAcross / ratio)
  const pageHeight = Math.max(0, Math.floor((fitHeight * zoom) / SNAP) * SNAP)
  const pageWidth = Math.floor((pageHeight * ratio) / SNAP) * SNAP
  const spreadWidth = pageWidth * pagesAcross

  const spreads = useMemo(() => (meta ? buildSpreads(meta.total, pagesAcross) : []), [meta, pagesAcross])
  const currentSlots = spreads.find((s) => s.includes(currentPage)) ?? []

  useEffect(() => {
    if (meta) latestOnPageChange.current(currentPage, meta.total)
  }, [currentPage, meta])

  // Every page turn (and every resize/zoom that changes the book's size)
  // starts the new page at the top, centered — otherwise a scroll position
  // left over from reading a zoomed-in page carries onto the next one.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = 0
    el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2
  }, [currentPage, pageWidth, pageHeight, pagesAcross])

  const turn = (delta: 1 | -1): void => {
    if (transition || spreads.length === 0) return
    const idx = spreads.findIndex((s) => s.includes(currentPage))
    const targetIdx = Math.min(Math.max(idx + delta, 0), spreads.length - 1)
    if (targetIdx === idx) return
    const targetPage = spreads[targetIdx].find((p): p is number => p != null)
    if (targetPage != null) setTransition({ direction: delta, targetPage })
  }

  useEffect(() => {
    const el = curtainRef.current
    if (!transition || !el) return
    let cancelled = false
    const cover = el.animate(
      [{ transform: `translateX(${transition.direction * 100}%)` }, { transform: 'translateX(0%)' }],
      { duration: COVER_MS, easing: 'ease-in', fill: 'forwards' },
    )
    cover.onfinish = () => {
      if (cancelled) return
      setCurrentPage(transition.targetPage)
      const reveal = el.animate(
        [{ transform: 'translateX(0%)' }, { transform: `translateX(${-transition.direction * 100}%)` }],
        { duration: REVEAL_MS, easing: 'ease-out', fill: 'forwards' },
      )
      reveal.onfinish = () => {
        if (!cancelled) setTransition(null)
      }
    }
    return () => {
      cancelled = true
      cover.cancel()
    }
  }, [transition])

  useImperativeHandle(ref, () => ({
    prev: () => turn(-1),
    next: () => turn(1),
    goTo: (page) => setCurrentPage((p) => (meta ? Math.min(Math.max(page, 1), meta.total) : p)),
  }))

  return (
    <div ref={stageRef} className="relative size-full">
      <div ref={scrollRef} className="absolute inset-0 overflow-auto overscroll-contain">
        <div
          className="flex min-h-full min-w-full p-4"
          style={{ justifyContent: 'safe center', alignItems: 'safe center' }}
        >
          {failed && <p className="text-sm text-zinc-500">{t('reader.error')}</p>}
          <Document
            file={url}
            options={PDF_OPTIONS}
            loading={<p className="text-sm text-zinc-500">{t('reader.loading')}</p>}
            error={null}
            onLoadError={() => setFailed(true)}
            onLoadSuccess={async (pdf) => {
              const first = await pdf.getPage(1)
              const v = first.getViewport({ scale: 1 })
              setMeta({ total: pdf.numPages, ratio: v.width / v.height })
            }}
          >
            {meta && pageWidth > 0 && (
              <div
                className="relative flex"
                style={{ width: spreadWidth, height: pageHeight }}
                onMouseUp={() => {
                  if (annotate) onSelect(readPageSelection())
                }}
              >
                {currentSlots.map((num, i) =>
                  num == null ? (
                    <div key={i} className="bg-white" style={{ width: pageWidth, height: pageHeight }} />
                  ) : (
                    <PageSheet
                      key={num}
                      number={num}
                      width={pageWidth}
                      notes={notes}
                      annotate={annotate}
                      onOpenNote={onOpenNote}
                    />
                  ),
                )}

                {transition && (
                  <div
                    ref={curtainRef}
                    className="absolute inset-0 z-20 bg-white"
                    // Rendered already off-screen (matching the animation's
                    // first keyframe) so there's no in-between frame where
                    // it sits at its default, untransformed — fully
                    // covering — position before the animation takes over;
                    // that jump was the visible "blink" on every page turn.
                    style={{ transform: `translateX(${transition.direction * 100}%)`, willChange: 'transform' }}
                  />
                )}
              </div>
            )}
          </Document>
        </div>
      </div>
    </div>
  )
})
