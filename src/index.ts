import cors from 'cors'
import express from 'express'
import { config } from './config.js'
import { connectDb } from './db.js'
import { adminRouter } from './routes/admin.js'
import { catalogRouter } from './routes/catalog.js'
import { productsRouter } from './routes/products.js'
import { CATALOGUE_DIR, CATALOGUE_URL_PREFIX } from './services/catalogueStorage.js'

async function main() {
  await connectDb()

  const app = express()
  app.use(cors({ origin: config.corsOrigin }))
  app.use(express.json({ limit: '2mb' }))

  app.use(
    CATALOGUE_URL_PREFIX,
    express.static(CATALOGUE_DIR, {
      maxAge: '7d',
      setHeaders(res) {
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', 'inline')
      },
    }),
  )

  app.use('/api/catalog', catalogRouter)
  app.use('/api/products', productsRouter)
  app.use('/api/admin', adminRouter)

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err)
    const message = err instanceof Error ? err.message : 'Server error'
    res.status(500).json({ error: message })
  })

  app.listen(config.port, () => {
    console.log(`API listening on http://localhost:${config.port}`)
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
