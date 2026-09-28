import type { AnnotationColor } from './useNotes.ts'

/** Static class names so Tailwind can see them. */
export const HIGHLIGHT_BG: Record<AnnotationColor, string> = {
  yellow: 'bg-yellow-300/50',
  green: 'bg-green-400/40',
  pink: 'bg-pink-400/40',
  blue: 'bg-sky-400/40',
}

export const UNDERLINE_BORDER: Record<AnnotationColor, string> = {
  yellow: 'border-yellow-500',
  green: 'border-green-600',
  pink: 'border-pink-500',
  blue: 'border-sky-500',
}

export const SWATCH_BG: Record<AnnotationColor, string> = {
  yellow: 'bg-yellow-300',
  green: 'bg-green-400',
  pink: 'bg-pink-400',
  blue: 'bg-sky-400',
}
