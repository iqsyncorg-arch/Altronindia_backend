import mongoose, { Schema, type Types } from 'mongoose'

export type ProductDocument = {
  slug: string
  title: string
  excerptHtml: string
  contentHtml: string
  imageUrl: string | null
  catalogueUrl: string | null
  catalogueLabel: string
  categoryId: Types.ObjectId
  published: boolean
  legacyWcProductId?: number
}

const productSchema = new Schema<ProductDocument>(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true },
    excerptHtml: { type: String, default: '' },
    contentHtml: { type: String, default: '' },
    imageUrl: { type: String, default: null },
    catalogueUrl: { type: String, default: null },
    catalogueLabel: { type: String, default: 'Download Catalogue' },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    published: { type: Boolean, default: true },
    legacyWcProductId: { type: Number },
  },
  { timestamps: true }
)

productSchema.index({ categoryId: 1, published: 1 })

export const Product = mongoose.model<ProductDocument>('Product', productSchema)
