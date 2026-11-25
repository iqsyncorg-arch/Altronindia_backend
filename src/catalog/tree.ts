import type { Types } from 'mongoose'

export type CategoryRow = {
  _id: Types.ObjectId
  slug: string
  label: string
  parent: Types.ObjectId | null
  sortOrder: number
  legacyWcCategoryId?: number
}

/** Shape returned to the React app (matches ProductLink). */
export type CatalogCategoryNode = {
  id: string
  label: string
  slug: string
  /** @deprecated use `id` — kept for WordPress fallback */
  categoryId?: number
  children?: CatalogCategoryNode[]
}

export function buildCategoryTree(rows: CategoryRow[]): CatalogCategoryNode[] {
  const byParent = new Map<string, CategoryRow[]>()
  for (const row of rows) {
    const key = row.parent ? String(row.parent) : '__root__'
    const list = byParent.get(key) || []
    list.push(row)
    byParent.set(key, list)
  }
  for (const list of byParent.values()) {
    list.sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label))
  }

  function mapNode(row: CategoryRow): CatalogCategoryNode {
    const kids = byParent.get(String(row._id)) || []
    const node: CatalogCategoryNode = {
      id: String(row._id),
      label: row.label,
      slug: row.slug,
      categoryId: row.legacyWcCategoryId,
    }
    if (kids.length) {
      node.children = kids.map(mapNode)
    }
    return node
  }

  const roots = byParent.get('__root__') || []
  return roots.map(mapNode)
}

export type ResolvedCategory = {
  node: CatalogCategoryNode
  path: string
  crumbs: Array<{ label: string; path: string }>
  parentPath: string | null
}

/** Resolve slug segments against an in-memory tree. */
export function resolveCategoryPath(tree: CatalogCategoryNode[], segments: string[]): ResolvedCategory | null {
  if (!segments.length) return null

  let nodes = tree
  let node: CatalogCategoryNode | undefined
  const crumbs: Array<{ label: string; path: string }> = []
  const parts: string[] = []

  for (const slug of segments) {
    node = nodes.find((n) => n.slug === slug)
    if (!node) return null
    parts.push(node.slug)
    crumbs.push({ label: node.label, path: `/products/${parts.join('/')}` })
    nodes = node.children || []
  }

  if (!node) return null

  return {
    node,
    path: `/products/${parts.join('/')}`,
    crumbs,
    parentPath: parts.length > 1 ? `/products/${parts.slice(0, -1).join('/')}` : '/products',
  }
}
