/**
 * Estimate total catalogue PDF storage. Run: npx tsx scripts/estimate-catalogue-size.ts
 */
import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDb } from '../src/db.js'
import { Product } from '../src/models/Product.js'
import { isLocalCatalogueUrl } from '../src/services/catalogueStorage.js'

async function headBytes(url: string): Promise<number | null> {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' })
    const len = res.headers.get('content-length')
    if (len) return Number(len)
    return null
  } catch {
    return null
  }
}

async function main() {
  await connectDb()
  const rows = await Product.find({ catalogueUrl: { $exists: true, $nin: [null, ''] } }).lean()
  const pdfs = rows.filter(
    (p) =>
      p.catalogueUrl &&
      (p.catalogueUrl.toLowerCase().includes('.pdf') || isLocalCatalogueUrl(p.catalogueUrl)),
  )
  const local = pdfs.filter((p) => isLocalCatalogueUrl(p.catalogueUrl))
  const remote = pdfs.filter((p) => !isLocalCatalogueUrl(p.catalogueUrl))

  let sampled = 0
  let sampleBytes = 0
  const sampleSize = Math.min(25, remote.length)
  for (let i = 0; i < sampleSize; i++) {
    const url = remote[i]!.catalogueUrl!
    const b = await headBytes(url)
    if (b != null && b > 0) {
      sampled += 1
      sampleBytes += b
    }
  }

  const avg = sampled > 0 ? sampleBytes / sampled : null
  const estTotal = avg != null ? Math.round(avg * pdfs.length) : null

  console.log(JSON.stringify({
    totalProducts: rows.length,
    withCataloguePdf: pdfs.length,
    alreadyLocal: local.length,
    stillRemote: remote.length,
    sampledHeadRequests: sampled,
    avgPdfBytes: avg ? Math.round(avg) : null,
    avgPdfMb: avg ? (avg / (1024 * 1024)).toFixed(2) : null,
    estimatedTotalBytes: estTotal,
    estimatedTotalMb: estTotal ? (estTotal / (1024 * 1024)).toFixed(1) : null,
    estimatedTotalGb: estTotal ? (estTotal / (1024 * 1024 * 1024)).toFixed(2) : null,
  }, null, 2))

  await mongoose.disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
