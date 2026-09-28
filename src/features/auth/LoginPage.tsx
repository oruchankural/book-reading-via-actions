import { GoogleLogin } from '@react-oauth/google'
import { useTranslation } from 'react-i18next'
import { Navigate, useLocation } from 'react-router-dom'
import { GOOGLE_CLIENT_ID } from './google.ts'
import { useAuth } from './useAuth.ts'

interface LocationState {
  from?: string
}

export function LoginPage(): React.JSX.Element {
  const { t } = useTranslation()
  const { user, devLogin, loginWithGoogle, loginAsDev } = useAuth()
  const from = (useLocation().state as LocationState | null)?.from ?? '/'

  if (user) return <Navigate to={from} replace />

  const failed = loginWithGoogle.isError || loginAsDev.isError

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center gap-4 px-4">
      <h1 className="text-xl font-semibold">{t('auth.title')}</h1>
      <p className="text-sm text-zinc-500">{t('auth.subtitle')}</p>

      {GOOGLE_CLIENT_ID ? (
        <GoogleLogin
          onSuccess={(res) => res.credential && loginWithGoogle.mutate(res.credential)}
          onError={() => loginWithGoogle.reset()}
        />
      ) : (
        <p className="rounded-md border border-zinc-200 p-3 text-sm text-zinc-500 dark:border-zinc-800">
          {t('auth.missingClient')}
        </p>
      )}

      {devLogin && (
        <button
          type="button"
          onClick={() => loginAsDev.mutate()}
          className="h-9 rounded-md border border-zinc-200 px-3 text-sm hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 dark:border-zinc-800 dark:hover:bg-zinc-900"
        >
          {t('auth.dev')}
        </button>
      )}

      {failed && (
        <p role="alert" className="text-sm text-red-600">
          {t('auth.failed')}
        </p>
      )}
    </main>
  )
}
