import cookieParser from 'cookie-parser'
import express from 'express'
import { authRouter } from './auth.ts'
import { libraryRouter } from './library.ts'

/**
 * The Express app itself, with no `listen()` call. Kept separate from
 * `index.ts` so the exact same app can run two ways: as a normal long-lived
 * process locally (or on any VPS/PaaS host), and as a Vercel serverless
 * function (`api/[...path].ts`), which imports this file directly and never
 * starts a server of its own — Vercel invokes the app as a request handler.
 */
export const app = express()
app.use(express.json({ limit: '16kb' }))
app.use(cookieParser())
app.use('/api/auth', authRouter)
app.use('/api', libraryRouter)
