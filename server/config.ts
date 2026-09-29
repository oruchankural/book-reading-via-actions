export const config = {
  port: Number(process.env.PORT ?? 3001),
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
  jwtSecret: new TextEncoder().encode(process.env.JWT_SECRET ?? 'dev-only-secret-change-me'),
  isProd: process.env.NODE_ENV === 'production',
} as const

export const devLoginEnabled = !config.isProd && config.googleClientId === ''
