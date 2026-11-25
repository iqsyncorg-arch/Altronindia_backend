/**
 * Import products from live WooCommerce (altronindia.com) into MongoDB.
 * Requires categories seeded with legacyWcCategoryId. Run: npm run seed-products --prefix server
 */
import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDb } from '../src/db.js'
import { syncProductsFromWooCommerce } from '../src/services/wooProductSync.js'

async function run() {
  await connectDb()
  const result = await syncProductsFromWooCommerce()
  console.log(
    `Product sync done — imported: ${result.imported}, updated: ${result.updated}, skipped: ${result.skipped}, categories: ${result.categoriesProcessed}`,
  )
  await mongoose.disconnect()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
