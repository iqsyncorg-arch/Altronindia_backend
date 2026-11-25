/**
 * Seeds category tree from the static React catalog (one-time / refresh).
 * Run from repo root: npm run seed --prefix server
 * Requires MONGODB_URI in server/.env
 */
import 'dotenv/config'
import mongoose from 'mongoose'
import { productCategories } from '../src/data/productCategories.ts'
import { Category } from '../src/models/Category.js'

type StaticNode = (typeof productCategories)[number]

type FlatRow = {
  slug: string
  label: string
  parentSlug: string | null
  sortOrder: number
  legacyWcCategoryId: number
}

function flatten(nodes: StaticNode[], parentSlug: string | null, out: FlatRow[], sortBase = 0): void {
  nodes.forEach((node, index) => {
    out.push({
      slug: node.slug,
      label: node.label,
      parentSlug,
      sortOrder: sortBase + index,
      legacyWcCategoryId: node.categoryId,
    })
    if (node.children?.length) {
      flatten(node.children, node.slug, out, 0)
    }
  })
}

async function run() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('Set MONGODB_URI in server/.env')

  await mongoose.connect(uri)
  const flat: FlatRow[] = []
  flatten(productCategories, null, flat)

  const slugToId = new Map<string, mongoose.Types.ObjectId>()

  for (const row of flat) {
    const parentId = row.parentSlug ? slugToId.get(row.parentSlug) ?? null : null
    const doc = await Category.findOneAndUpdate(
      { slug: row.slug },
      {
        slug: row.slug,
        label: row.label,
        parent: parentId,
        sortOrder: row.sortOrder,
        published: true,
        legacyWcCategoryId: row.legacyWcCategoryId,
      },
      { upsert: true, new: true }
    )
    slugToId.set(row.slug, doc._id as mongoose.Types.ObjectId)
  }

  console.log(`Seeded ${flat.length} categories`)
  await mongoose.disconnect()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
