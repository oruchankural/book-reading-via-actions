import { useCallback, useState } from 'react'

export interface ElementSize {
  width: number
  height: number
}

export interface UseElementSize {
  ref: (el: HTMLElement | null) => void
  size: ElementSize
}

export function useElementSize(): UseElementSize {
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 })

  const ref = useCallback((el: HTMLElement | null) => {
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ width, height })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, size }
}
