import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type PageView = 'single' | 'double'

export const ZOOM_MIN = 0.5
export const ZOOM_MAX = 2.5
export const ZOOM_STEP = 0.25

const AUTO_DOUBLE_MIN_WIDTH = 720

/** Explicit choice wins; otherwise two pages only when there is room. */
export const resolveView = (view: PageView | null, width: number): PageView =>
  view ?? (width >= AUTO_DOUBLE_MIN_WIDTH ? 'double' : 'single')

export interface ReaderPrefs {
  /** null = choose automatically from the available width. */
  view: PageView | null
  zoom: number
  setView: (view: PageView) => void
  zoomBy: (delta: number) => void
  resetZoom: () => void
}

const clamp = (n: number): number => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(n * 100) / 100))

export const useReaderPrefs = create<ReaderPrefs>()(
  persist(
    (set) => ({
      view: null,
      zoom: 1,
      setView: (view) => set({ view }),
      zoomBy: (delta) => set((s) => ({ zoom: clamp(s.zoom + delta) })),
      resetZoom: () => set({ zoom: 1 }),
    }),
    { name: 'reader-prefs' },
  ),
)
