import { Category } from '../models/Category.js'
import { Product } from '../models/Product.js'
import {
  downloadRemoteCatalogue,
  remoteCatalogueLooksDownloadable,
} from './catalogueStorage.js'

const WP_STORE = 'https://altronindia.com/wp-json/wc/store/v1'

type StoreProduct = {
  id: number
  name?: string
  slug: string
  short_description?: string
  description?: string
  images?: Array<{ src?: string; thumbnail?: string }>
  add_to_cart?: { text?: string; url?: string }
}

function normalizeCatalogueUrl(url?: string | null) {
  if (!url?.trim()) return null
  return url.replace('/demo/wp-content/', '/wp-content/')
}

function imageUrl(p: StoreProduct): string | null {
  const image = p.images?.[0]
  return image?.src || image?.thumbnail || null
}

export type SyncResult = {
  imported: number
  updated: number
  skipped: number
  categoriesProcessed: number
  cataloguesDownloaded: number
}

/** Import published WooCommerce products into MongoDB by category legacy IDs. */
export async function syncProductsFromWooCommerce(): Promise<SyncResult> {
  const categories = await Category.find({
    legacyWcCategoryId: { $exists: true, $ne: null },
    published: true,
  }).lean()

  let imported = 0
  let updated = 0
  let skipped = 0
  let categoriesProcessed = 0
  let cataloguesDownloaded = 0

  for (const cat of categories) {
    const wcId = cat.legacyWcCategoryId
    if (wcId == null) continue

    categoriesProcessed += 1
    let page = 1

    for (;;) {
      const url = `${WP_STORE}/products?category=${wcId}&per_page=100&page=${page}`
      const res = await fetch(url)
      if (!res.ok) break
      const batch = (await res.json()) as StoreProduct[]
      if (!batch.length) break

      for (const row of batch) {
        if (!row.slug?.trim()) {
          skipped += 1
          continue
        }
        const remoteCatalogue = normalizeCatalogueUrl(row.add_to_cart?.url)
        let catalogueUrl = remoteCatalogue
        if (remoteCatalogue && remoteCatalogueLooksDownloadable(remoteCatalogue)) {
          const local = await downloadRemoteCatalogue(row.slug.trim(), remoteCatalogue)
          if (local) {
            catalogueUrl = local
            cataloguesDownloaded += 1
          }
        }

        const payload = {
          slug: row.slug.trim(),
          title: row.name?.trim() || row.slug,
          excerptHtml: row.short_description || '',
          contentHtml: row.description || row.short_description || '',
          imageUrl: imageUrl(row),
          catalogueUrl,
          catalogueLabel: row.add_to_cart?.text?.trim() || 'Download Catalogue',
          categoryId: cat._id,
          published: true,
          legacyWcProductId: row.id,
        }

        const existing = await Product.findOne({ slug: payload.slug })
        if (existing) {
          await Product.updateOne({ _id: existing._id }, { $set: payload })
          updated += 1
        } else {
          await Product.create(payload)
          imported += 1
        }
      }

      if (batch.length < 100) break
      page += 1
    }
  }

  return { imported, updated, skipped, categoriesProcessed, cataloguesDownloaded }
}
