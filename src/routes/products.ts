import { Router } from 'express'
import mongoose from 'mongoose'
import { Product } from '../models/Product.js'

export const productsRouter = Router()

function mapProduct(p: {
  _id: mongoose.Types.ObjectId
  slug: string
  title: string
  excerptHtml: string
  contentHtml: string
  imageUrl: string | null
  catalogueUrl: string | null
  catalogueLabel: string
}) {
  return {
    id: String(p._id),
    slug: p.slug,
    title: p.title,
    excerptHtml: p.excerptHtml,
    contentHtml: p.contentHtml,
    imageUrl: p.imageUrl,
    catalogueUrl: p.catalogueUrl,
    catalogueLabel: p.catalogueLabel,
  }
}

productsRouter.get('/', async (req, res, next) => {
  try {
    const categoryId = String(req.query.categoryId || '')
    if (!mongoose.isValidObjectId(categoryId)) {
      return res.status(400).json({ error: 'Invalid categoryId' })
    }
    const rows = await Product.find({ categoryId, published: true })
      .sort({ title: 1 })
      .lean()
    res.json(rows.map(mapProduct))
  } catch (err) {
    next(err)
  }
})

productsRouter.get('/:slug', async (req, res, next) => {
  try {
    const row = await Product.findOne({ slug: req.params.slug, published: true }).lean()
    if (!row) return res.status(404).json({ error: 'Product not found' })
    res.json(mapProduct(row))
  } catch (err) {
    next(err)
  }
})
