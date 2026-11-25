import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config.js'

export type AdminTokenPayload = { sub: string; role: string }

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const headerKey = req.header('x-admin-key')
  if (config.adminApiKey && headerKey === config.adminApiKey) {
    return next()
  }

  const auth = req.header('authorization')
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret) as AdminTokenPayload
    ;(req as Request & { admin?: AdminTokenPayload }).admin = payload
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
