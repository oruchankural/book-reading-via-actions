import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import { authRouter } from './auth.ts'
import { config } from './config.ts'
import { libraryRouter } from './library.ts'

/**
 * The Express app itself, with no `listen()` call — see index.ts for that.
 * This API is a separate deployment from the client (its own project, own
 * .env), so requests arrive cross-origin: `cors` with `credentials: true`
 * plus an exact `CLIENT_ORIGIN` allowlist is what lets the browser accept
 * the session cookie from a different domain than the site itself.
 */
export const app = express()
app.use(cors({ origin: config.clientOrigin, credentials: true }))
app.use(express.json({ limit: '16kb' }))
app.use(cookieParser())
app.use('/api/auth', authRouter)
app.use('/api', libraryRouter)
