import { useTranslation } from 'react-i18next'
import { useLamp } from '../useLamp.ts'

const slider = 'h-1.5 w-full cursor-pointer accent-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600'

export function LightPanel(): React.JSX.Element {
  const { t } = useTranslation()
  const { lightOn, brightness, warmth, toggle, setBrightness, setWarmth } = useLamp()

  return (
    <div className="absolute right-3 top-3 z-20 flex w-64 flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <span id="lamp-label">{lightOn ? t('reader.lightOn') : t('reader.lightOff')}</span>
        <button
          type="button"
          role="switch"
          aria-checked={lightOn}
          aria-labelledby="lamp-label"
          onClick={toggle}
          className={`relative h-5 w-9 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 ${lightOn ? 'bg-amber-600' : 'bg-zinc-300 dark:bg-zinc-700'}`}
        >
          <span
            className={`absolute left-0.5 top-0.5 size-4 rounded-full bg-white transition-transform ${lightOn ? 'translate-x-4' : ''}`}
          />
        </button>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="flex justify-between text-xs text-zinc-500">
          {t('reader.brightness')}
          <span>{brightness}%</span>
        </span>
        <input
          type="range"
          min={30}
          max={100}
          value={brightness}
          disabled={!lightOn}
          onChange={(e) => setBrightness(Number(e.target.value))}
          className={`${slider} disabled:opacity-40`}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="flex justify-between text-xs text-zinc-500">
          {t('reader.warmth')}
          <span>{warmth < 0 ? t('reader.cool') : warmth > 0 ? t('reader.warm') : '—'}</span>
        </span>
        <input
          type="range"
          min={-100}
          max={100}
          value={warmth}
          disabled={!lightOn}
          onChange={(e) => setWarmth(Number(e.target.value))}
          className={`${slider} disabled:opacity-40`}
        />
      </label>
    </div>
  )
}
