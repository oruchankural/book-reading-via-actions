import { BookOpen, Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth.ts'
import { LANGUAGES } from '../shared/i18n/index.ts'
import { useTheme } from '../shared/theme/useTheme.ts'

const ctl =
  'inline-flex h-8 items-center rounded-md px-2 text-sm hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 dark:hover:bg-zinc-800'

export function AppLayout(): React.JSX.Element {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
        <nav className="mx-auto flex h-12 max-w-6xl items-center gap-2 px-4">
          <Link to="/" className="mr-auto flex items-center gap-2 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600">
            <BookOpen className="size-4 text-amber-600" aria-hidden />
            {t('app.name')}
          </Link>

          <select
            value={i18n.language}
            onChange={(e) => void i18n.changeLanguage(e.target.value)}
            aria-label={t('nav.language')}
            className={`${ctl} border border-zinc-200 bg-transparent dark:border-zinc-800`}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} className="text-zinc-900">
                {l.label}
              </option>
            ))}
          </select>

          <button type="button" onClick={toggle} aria-label={t('nav.theme')} className={ctl}>
            {theme === 'dark' ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
          </button>

          {user ? (
            <button type="button" onClick={() => logout.mutate()} className={ctl} title={user.email}>
              {user.picture && (
                <img src={user.picture} alt="" referrerPolicy="no-referrer" className="mr-2 size-5 rounded-full" />
              )}
              {t('nav.signOut')}
            </button>
          ) : (
            <Link to="/login" className={ctl}>
              {t('nav.signIn')}
            </Link>
          )}
        </nav>
      </header>
      <Outlet />
    </div>
  )
}
