import { Router } from 'express'
import { Category } from '../models/Category.js'
import { buildCategoryTree, resolveCategoryPath } from '../catalog/tree.js'

export const catalogRouter = Router()

catalogRouter.get('/health', (_req, res) => {
  res.json({ ok: true, source: 'mongodb' })
})

catalogRouter.get('/tree', async (_req, res, next) => {
  try {
    const rows = await Category.find({ published: true }).lean()
    res.json(buildCategoryTree(rows))
  } catch (err) {
    next(err)
  }
})

catalogRouter.get('/resolve/*', async (req, res, next) => {
  try {
    const wild = req.params['']
    const segments = Array.isArray(wild)
      ? wild.filter(Boolean)
      : (typeof wild === 'string' ? wild : '').split('/').filter(Boolean)
    const rows = await Category.find({ published: true }).lean()
    const tree = buildCategoryTree(rows)
    const resolved = resolveCategoryPath(tree, segments)
    if (!resolved) {
      return res.status(404).json({ error: 'Category not found' })
    }
    res.json(resolved)
  } catch (err) {
    next(err)
  }
})
