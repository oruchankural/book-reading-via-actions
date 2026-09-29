import { Router } from 'express'
import type { NextFunction, Request, Response } from 'express'
import { OAuth2Client } from 'google-auth-library'
import { jwtVerify, SignJWT } from 'jose'
import { z } from 'zod'
import { config, devLoginEnabled } from './config.js'
import { db } from './db.js'
import type { User } from './types.ts'

const COOKIE = 'session'
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000
const google = new OAuth2Client(config.googleClientId)

async function startSession(res: Response, user: User): Promise<void> {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setExpirationTime('7d')
    .sign(config.jwtSecret)
  res.cookie(COOKIE, token, {
    httpOnly: true,
    // The client is a separate origin in production, so the cookie must be
    // sent on cross-site requests — SameSite=None, which browsers only
    // honor when Secure is also set (i.e. real HTTPS in prod).
    sameSite: config.isProd ? 'none' : 'lax',
    secure: config.isProd,
    maxAge: MAX_AGE_MS,
  })
}

async function readUser(req: Request): Promise<User | null> {
  const token = (req.cookies as Record<string, string | undefined>)[COOKIE]
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, config.jwtSecret)
    return (payload.sub && db.users.get(payload.sub)) || null
  } catch {
    return null
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const user = await readUser(req)
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  res.locals.user = user
  next()
}

export const currentUser = (res: Response): User => res.locals.user as User

export const authRouter = Router()

authRouter.get('/config', (_req, res) => {
  res.json({ devLogin: devLoginEnabled })
})

authRouter.get('/me', async (req, res) => {
  res.json({ user: await readUser(req) })
})

authRouter.post('/google', async (req, res) => {
  const body = z.object({ credential: z.string().min(1) }).safeParse(req.body)
  if (!body.success || !config.googleClientId) {
    res.status(400).json({ error: 'Invalid request' })
    return
  }
  try {
    const ticket = await google.verifyIdToken({
      idToken: body.data.credential,
      audience: config.googleClientId,
    })
    const p = ticket.getPayload();

    if(p === undefined || p === null){
      res.status(500).setHeader('Cache-Control', 'no-store').json({ message: 'Google verification failed' });
      return;
    }

    if (!p?.sub || !p.email){
      res.status(500).setHeader('Cache-Control', 'no-store').json({ message: 'Google verification failed' });
      return;
    }

    const user: User = {
      id: `g_${p.sub}`,
      email: p.email,
      name: p.name ?? p.email,
      picture: p.picture ?? null,
    }
    db.users.set(user.id, user)
    await startSession(res, user)
    res.json({ user })
  } catch {
    res.status(401).json({ error: 'Google verification failed' })
  }
})

authRouter.post('/dev', async (_req, res) => {
  if (!devLoginEnabled) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  const user: User = { id: 'dev_user', email: 'dev@local.test', name: 'Dev Reader', picture: null }
  db.users.set(user.id, user)
  await startSession(res, user)
  res.json({ user })
})

authRouter.post('/logout', (_req, res) => {
  // clearCookie must be called with the same attributes the cookie was set
  // with, or some browsers won't match it and it never actually clears.
  res.clearCookie(COOKIE, { sameSite: config.isProd ? 'none' : 'lax', secure: config.isProd })
  res.status(204).end()
})
