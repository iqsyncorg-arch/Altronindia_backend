import mongoose, { Schema, type Types } from 'mongoose'

export type CategoryDocument = {
  slug: string
  label: string
  parent: Types.ObjectId | null
  sortOrder: number
  published: boolean
  /** WooCommerce term id — used when importing from WordPress */
  legacyWcCategoryId?: number
}

const categorySchema = new Schema<CategoryDocument>(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    label: { type: String, required: true, trim: true },
    parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    sortOrder: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
    legacyWcCategoryId: { type: Number },
  },
  { timestamps: true }
)

categorySchema.index({ parent: 1, sortOrder: 1 })

export const Category = mongoose.model<CategoryDocument>('Category', categorySchema)
