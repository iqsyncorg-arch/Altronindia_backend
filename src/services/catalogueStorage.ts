import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
export const CATALOGUE_DIR = path.join(serverRoot, 'uploads', 'catalogues')
export const CATALOGUE_URL_PREFIX = '/api/uploads/catalogues'

function safeSlug(slug: string) {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120)
}

export function isLocalCatalogueUrl(url: string | null | undefined) {
  if (!url?.trim()) return false
  return url.startsWith(CATALOGUE_URL_PREFIX)
}

export function catalogueFilenameForSlug(slug: string) {
  return `${safeSlug(slug)}.pdf`
}

export function cataloguePublicUrl(filename: string) {
  return `${CATALOGUE_URL_PREFIX}/${encodeURIComponent(filename)}`
}

async function ensureDir() {
  await fs.mkdir(CATALOGUE_DIR, { recursive: true })
}

function isPdfBuffer(buf: Buffer) {
  return buf.length >= 4 && buf.subarray(0, 4).toString('ascii') === '%PDF'
}

export async function writeCataloguePdf(slug: string, data: Buffer): Promise<string> {
  if (!isPdfBuffer(data)) throw new Error('File is not a valid PDF')
  await ensureDir()
  const filename = catalogueFilenameForSlug(slug)
  const filePath = path.join(CATALOGUE_DIR, filename)
  await fs.writeFile(filePath, data)
  return cataloguePublicUrl(filename)
}

export async function downloadRemoteCatalogue(slug: string, remoteUrl: string): Promise<string | null> {
  const url = remoteUrl.trim()
  if (!url.startsWith('http')) return null

  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: { 'User-Agent': 'AltronCatalogueSync/1.0' },
    })
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    if (!isPdfBuffer(buf)) return null
    return await writeCataloguePdf(slug, buf)
  } catch {
    return null
  }
}

export function remoteCatalogueLooksDownloadable(url: string | null | undefined) {
  if (!url?.trim()) return false
  if (isLocalCatalogueUrl(url)) return false
  try {
    const parsed = new URL(url)
    return parsed.pathname.toLowerCase().endsWith('.pdf') || url.toLowerCase().includes('.pdf')
  } catch {
    return url.toLowerCase().includes('.pdf')
  }
}
