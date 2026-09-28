import { app } from './app.ts'
import { config } from './config.ts'

app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`)
})
