import cookieParser from 'cookie-parser'
import express from 'express'
import { authRouter } from './auth.ts'
import { config } from './config.ts'
import { libraryRouter } from './library.ts'

const app = express()
app.use(express.json({ limit: '16kb' }))
app.use(cookieParser())
app.use('/api/auth', authRouter)
app.use('/api', libraryRouter)

app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`)
})
