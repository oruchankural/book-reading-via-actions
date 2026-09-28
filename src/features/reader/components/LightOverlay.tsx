import { lampColors, useLamp } from '../useLamp.ts'

/**
 * Tints (multiply) and dims everything beneath it inside the reading stage.
 * The two layers are siblings: a blended element inside its own stacking
 * context would multiply against nothing and paint solid white.
 */
export function LightOverlay(): React.JSX.Element {
  const lightOn = useLamp((s) => s.lightOn)
  const brightness = useLamp((s) => s.brightness)
  const warmth = useLamp((s) => s.warmth)
  const { tint, dim } = lampColors({ lightOn, brightness, warmth })

  return (
    <>
      <div
        aria-hidden
        ref={(el) => el?.style.setProperty('--lamp-tint', tint)}
        className="lamp-tint pointer-events-none absolute inset-0 z-10 transition-colors duration-300"
      />
      <div
        aria-hidden
        ref={(el) => el?.style.setProperty('--lamp-dim', String(dim))}
        className="lamp-dim pointer-events-none absolute inset-0 z-10 transition-colors duration-300"
      />
    </>
  )
}
