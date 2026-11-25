/**
 * Download remote product catalogue PDFs into server/uploads/catalogues.
 * Run: npm run sync-catalogues --prefix server
 */
import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDb } from '../src/db.js'
import { syncAllProductCatalogues } from '../src/services/catalogueSync.js'

async function run() {
  await connectDb()
  const result = await syncAllProductCatalogues()
  console.log(
    `Catalogue sync — downloaded: ${result.downloaded}, skipped: ${result.skipped}, failed: ${result.failed}`,
  )
  await mongoose.disconnect()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
