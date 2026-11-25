import bcrypt from 'bcryptjs'
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import multer from 'multer'
import { config } from '../config.js'
import { Category } from '../models/Category.js'
import { Product } from '../models/Product.js'
import { User } from '../models/User.js'
import { requireAdmin } from '../middleware/auth.js'
import { syncAllProductCatalogues } from '../services/catalogueSync.js'
import { writeCataloguePdf } from '../services/catalogueStorage.js'
import { syncProductsFromWooCommerce } from '../services/wooProductSync.js'

const uploadCatalogue = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files are allowed'))
    }
  },
})

export const adminRouter = Router()

adminRouter.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').toLowerCase().trim()
    const password = String(req.body?.password || '')
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign({ sub: String(user._id), role: user.role }, config.jwtSecret, {
      expiresIn: '7d',
    })
    res.json({ token, role: user.role, email: user.email })
  } catch (err) {
    next(err)
  }
})

/** First admin only — must run before `requireAdmin`. */
adminRouter.post('/users/bootstrap', async (req, res, next) => {
  try {
    const count = await User.countDocuments()
    if (count > 0) return res.status(403).json({ error: 'Users already exist' })

    const email = String(req.body?.email || '').toLowerCase().trim()
    const password = String(req.body?.password || '')
    if (!email || password.length < 8) {
      return res.status(400).json({ error: 'Valid email and password (8+ chars) required' })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await User.create({ email, passwordHash, role: 'admin' })
    res.status(201).json({ id: user._id, email: user.email })
  } catch (err) {
    next(err)
  }
})

adminRouter.use(requireAdmin)

adminRouter.get('/stats', async (_req, res, next) => {
  try {
    const [products, categories, publishedProducts] = await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
      Product.countDocuments({ published: true }),
    ])
    res.json({ products, categories, publishedProducts })
  } catch (err) {
    next(err)
  }
})

adminRouter.get('/categories', async (_req, res, next) => {
  try {
    const rows = await Category.find().sort({ sortOrder: 1, label: 1 }).lean()
    res.json(rows)
  } catch (err) {
    next(err)
  }
})

adminRouter.post('/products/sync-woocommerce', async (_req, res, next) => {
  try {
    const result = await syncProductsFromWooCommerce()
    res.json(result)
  } catch (err) {
    next(err)
  }
})

adminRouter.post('/products/sync-catalogues', async (_req, res, next) => {
  try {
    const result = await syncAllProductCatalogues()
    res.json(result)
  } catch (err) {
    next(err)
  }
})

adminRouter.post(
  '/products/:id/catalogue',
  uploadCatalogue.single('catalogue'),
  async (req, res, next) => {
    try {
      const { id } = req.params
      if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' })
      if (!req.file?.buffer?.length) return res.status(400).json({ error: 'PDF file required' })

      const product = await Product.findById(id)
      if (!product) return res.status(404).json({ error: 'Not found' })

      const catalogueUrl = await writeCataloguePdf(product.slug, req.file.buffer)
      product.catalogueUrl = catalogueUrl
      await product.save()
      res.json({ catalogueUrl })
    } catch (err) {
      next(err)
    }
  },
)

adminRouter.get('/products', async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim()
    const categoryId = String(req.query.categoryId || '').trim()
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 25))
    const filter: Record<string, unknown> = {}
    if (categoryId && mongoose.isValidObjectId(categoryId)) {
      filter.categoryId = new mongoose.Types.ObjectId(categoryId)
    }
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { slug: { $regex: q, $options: 'i' } },
      ]
    }
    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('categoryId', 'label slug')
        .lean(),
      Product.countDocuments(filter),
    ])
    res.json({ items, total, page, limit })
  } catch (err) {
    next(err)
  }
})

adminRouter.get('/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' })
    const doc = await Product.findById(id).lean()
    if (!doc) return res.status(404).json({ error: 'Not found' })
    res.json(doc)
  } catch (err) {
    next(err)
  }
})

adminRouter.post('/categories', async (req, res, next) => {
  try {
    const { slug, label, parentId, sortOrder, legacyWcCategoryId } = req.body ?? {}
    if (!slug || !label) return res.status(400).json({ error: 'slug and label required' })
    const parent =
      parentId && mongoose.isValidObjectId(parentId) ? new mongoose.Types.ObjectId(parentId) : null
    const doc = await Category.create({
      slug: String(slug).trim(),
      label: String(label).trim(),
      parent,
      sortOrder: Number(sortOrder) || 0,
      legacyWcCategoryId: legacyWcCategoryId ? Number(legacyWcCategoryId) : undefined,
    })
    res.status(201).json(doc)
  } catch (err) {
    next(err)
  }
})

adminRouter.patch('/categories/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' })
    const updates: Record<string, unknown> = {}
    for (const key of ['slug', 'label', 'sortOrder', 'published'] as const) {
      if (req.body?.[key] !== undefined) updates[key] = req.body[key]
    }
    if (req.body?.parentId !== undefined) {
      updates.parent =
        req.body.parentId && mongoose.isValidObjectId(req.body.parentId)
          ? new mongoose.Types.ObjectId(req.body.parentId)
          : null
    }
    const doc = await Category.findByIdAndUpdate(id, updates, { new: true })
    if (!doc) return res.status(404).json({ error: 'Not found' })
    res.json(doc)
  } catch (err) {
    next(err)
  }
})

adminRouter.delete('/categories/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' })
    await Category.findByIdAndDelete(id)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

adminRouter.post('/products', async (req, res, next) => {
  try {
    const body = req.body ?? {}
    if (!body.slug || !body.title || !body.categoryId) {
      return res.status(400).json({ error: 'slug, title, categoryId required' })
    }
    if (!mongoose.isValidObjectId(body.categoryId)) {
      return res.status(400).json({ error: 'Invalid categoryId' })
    }
    const doc = await Product.create({
      slug: String(body.slug).trim(),
      title: String(body.title),
      excerptHtml: body.excerptHtml || '',
      contentHtml: body.contentHtml || '',
      imageUrl: body.imageUrl || null,
      catalogueUrl: body.catalogueUrl || null,
      catalogueLabel: body.catalogueLabel || 'Download Catalogue',
      categoryId: new mongoose.Types.ObjectId(body.categoryId),
      published: body.published !== false,
      legacyWcProductId: body.legacyWcProductId ? Number(body.legacyWcProductId) : undefined,
    })
    res.status(201).json(doc)
  } catch (err) {
    next(err)
  }
})

adminRouter.patch('/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' })
    const updates = { ...req.body }
    if (updates.categoryId && mongoose.isValidObjectId(updates.categoryId)) {
      updates.categoryId = new mongoose.Types.ObjectId(updates.categoryId)
    }
    const doc = await Product.findByIdAndUpdate(id, updates, { new: true })
    if (!doc) return res.status(404).json({ error: 'Not found' })
    res.json(doc)
  } catch (err) {
    next(err)
  }
})

adminRouter.delete('/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' })
    await Product.findByIdAndDelete(id)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})
