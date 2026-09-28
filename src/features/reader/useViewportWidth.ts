import { useSyncExternalStore } from 'react'

const subscribe = (onChange: () => void): (() => void) => {
  window.addEventListener('resize', onChange)
  window.addEventListener('orientationchange', onChange)
  return () => {
    window.removeEventListener('resize', onChange)
    window.removeEventListener('orientationchange', onChange)
  }
}

/** Tracks window width, including across an orientation change on a tablet or phone. */
export function useViewportWidth(): number {
  return useSyncExternalStore(subscribe, () => window.innerWidth)
}
