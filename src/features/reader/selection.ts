import type { TextSelection } from './components/SelectionToolbar.tsx'

const MIN_RECT_PX = 2
const MAX_RECT_HEIGHT_PCT = 12
const PAGE_ATTR = 'data-page'

/** Walks up from a selection endpoint to the PageSheet element that owns it. */
function findPageElement(node: Node | null): HTMLElement | null {
  let el: Node | null = node
  while (el) {
    if (el instanceof HTMLElement && el.hasAttribute(PAGE_ATTR)) return el
    el = el.parentNode
  }
  return null
}

/**
 * Reads the current window selection and, if it's real text inside a page,
 * returns it relative to that page. Anchored on the selection's start point
 * rather than requiring the whole range to sit inside one element, so a
 * drag that overshoots slightly into the facing page (easy to do with two
 * pages side by side) still resolves instead of silently returning nothing.
 */
export function readPageSelection(): TextSelection | null {
  const sel = window.getSelection()
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null
  const range = sel.getRangeAt(0)

  const host = findPageElement(range.startContainer)
  const pageAttr = host?.getAttribute(PAGE_ATTR)
  if (!host || !pageAttr) return null
  const page = Number(pageAttr)

  const box = host.getBoundingClientRect()
  const rects = [...range.getClientRects()]
    .filter((r) => r.width > MIN_RECT_PX && r.height > MIN_RECT_PX && (r.height / box.height) * 100 < MAX_RECT_HEIGHT_PCT)
    .map((r) => {
      const x = Math.max(0, ((r.left - box.left) / box.width) * 100)
      const y = Math.max(0, ((r.top - box.top) / box.height) * 100)
      return {
        x,
        y,
        w: Math.min((r.width / box.width) * 100, 100 - x),
        h: Math.min((r.height / box.height) * 100, 100 - y),
      }
    })
    // A drag that spilled onto the facing page produces rects outside this
    // page's box (negative/zero after clamping); drop those, keep the rest.
    .filter((r) => r.w > 0 && r.h > 0)
  const quote = sel.toString().replace(/\s+/g, ' ').trim()
  if (rects.length === 0 || !quote) return null

  // Keep the toolbar on-screen: it's centered on this point and anchored by
  // its bottom edge, so a selection near an edge (very common on a phone)
  // would otherwise push it half off the viewport.
  const TOOLBAR_HALF_WIDTH = 130
  const TOOLBAR_HEIGHT = 56
  const bounds = range.getBoundingClientRect()
  const left = Math.min(Math.max(bounds.left + bounds.width / 2, TOOLBAR_HALF_WIDTH), window.innerWidth - TOOLBAR_HALF_WIDTH)
  const top = Math.max(bounds.top - 8, TOOLBAR_HEIGHT)
  return { page, quote, rects, left, top }
}
