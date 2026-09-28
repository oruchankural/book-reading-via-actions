import { useTranslation } from 'react-i18next'
import type { BookFacets, BookFilters, BookSort } from '../types.ts'

interface BookFilterBarProps {
  values: BookFilters
  facets: BookFacets | undefined
  onChange: (patch: Partial<BookFilters>) => void
}

const control =
  'h-9 rounded-md border border-zinc-200 bg-white px-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600'

export function BookFilterBar({ values, facets, onChange }: BookFilterBarProps): React.JSX.Element {
  const { t } = useTranslation()
  return (
    <div className="flex flex-wrap gap-2" role="search">
      <input
        type="search"
        value={values.q}
        onChange={(e) => onChange({ q: e.target.value })}
        placeholder={t('library.search')}
        aria-label={t('library.search')}
        className={`${control} min-w-48 flex-1`}
      />
      <select
        value={values.genre}
        onChange={(e) => onChange({ genre: e.target.value })}
        aria-label={t('library.genre')}
        className={control}
      >
        <option value="">{t('library.genre')}: {t('library.all')}</option>
        {facets?.genres.map((g) => (
          <option key={g} value={g}>
            {t(`genres.${g}`, g)}
          </option>
        ))}
      </select>
      <select
        value={values.language}
        onChange={(e) => onChange({ language: e.target.value })}
        aria-label={t('library.language')}
        className={control}
      >
        <option value="">{t('library.language')}: {t('library.all')}</option>
        {facets?.languages.map((l) => (
          <option key={l} value={l}>
            {t(`languages.${l}`, l)}
          </option>
        ))}
      </select>
      <select
        value={values.sort}
        onChange={(e) => onChange({ sort: e.target.value as BookSort })}
        aria-label={t('library.sort')}
        className={control}
      >
        <option value="title">{t('library.sortTitle')}</option>
        <option value="author">{t('library.sortAuthor')}</option>
        <option value="year">{t('library.sortYear')}</option>
      </select>
    </div>
  )
}
