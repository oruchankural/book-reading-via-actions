import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface LampSettings {
  lightOn: boolean
  /** 30–100 */
  brightness: number
  /** -100 (cool) … 100 (warm) */
  warmth: number
}

export interface LampState extends LampSettings {
  toggle: () => void
  setBrightness: (value: number) => void
  setWarmth: (value: number) => void
}

export interface LampColors {
  tint: string
  dim: number
}

const WHITE = [255, 255, 255] as const
const WARM = [255, 176, 96] as const
const COOL = [150, 195, 255] as const
const OFF_DIM = 0.82

const mix = (to: readonly number[], t: number): string =>
  WHITE.map((c, i) => Math.round(c + (to[i] - c) * t)).join(' ')

export function lampColors({ lightOn, brightness, warmth }: LampSettings): LampColors {
  if (!lightOn) return { tint: 'rgb(255 255 255)', dim: OFF_DIM }
  const tint = warmth >= 0 ? mix(WARM, warmth / 100) : mix(COOL, -warmth / 100)
  return { tint: `rgb(${tint})`, dim: 1 - brightness / 100 }
}

export const useLamp = create<LampState>()(
  persist(
    (set) => ({
      lightOn: true,
      brightness: 100,
      warmth: 0,
      toggle: () => set((s) => ({ lightOn: !s.lightOn })),
      setBrightness: (brightness) => set({ brightness }),
      setWarmth: (warmth) => set({ warmth }),
    }),
    { name: 'reading-lamp' },
  ),
)
