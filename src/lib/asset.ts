/** Prefix public assets with Vite `base` so GitHub Pages (/pope/) resolves correctly. */
export function asset(path: string): string {
  const cleaned = path.replace(/^\//, '')
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${cleaned}`
}
