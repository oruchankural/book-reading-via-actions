export const config = {
  port: Number(process.env.PORT ?? 3001),
  googleClientId: process.env.VITE_GOOGLE_CLIENT_ID ?? '',
  jwtSecret: new TextEncoder().encode(process.env.JWT_SECRET ?? 'dev-only-secret-change-me'),
  isProd: process.env.NODE_ENV === 'production',
} as const

export const devLoginEnabled = !config.isProd && config.googleClientId === ''
