import { Product } from '../models/Product.js'
import {
  downloadRemoteCatalogue,
  isLocalCatalogueUrl,
  remoteCatalogueLooksDownloadable,
} from './catalogueStorage.js'

export type CatalogueSyncResult = {
  downloaded: number
  skipped: number
  failed: number
}

/** Download remote catalogue PDFs for all products and point catalogueUrl at local files. */
export async function syncAllProductCatalogues(): Promise<CatalogueSyncResult> {
  const products = await Product.find({
    catalogueUrl: { $exists: true, $nin: [null, ''] },
  }).lean()

  let downloaded = 0
  let skipped = 0
  let failed = 0

  for (const p of products) {
    const url = p.catalogueUrl
    if (!url) continue

    if (isLocalCatalogueUrl(url)) {
      skipped += 1
      continue
    }

    if (!remoteCatalogueLooksDownloadable(url)) {
      skipped += 1
      continue
    }

    const localUrl = await downloadRemoteCatalogue(p.slug, url)
    if (localUrl) {
      await Product.updateOne({ _id: p._id }, { $set: { catalogueUrl: localUrl } })
      downloaded += 1
    } else {
      failed += 1
    }
  }

  return { downloaded, skipped, failed }
}
