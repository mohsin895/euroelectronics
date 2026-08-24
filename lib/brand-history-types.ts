export interface BrandHistoryEntry {
  id: string
  brand: string
  heading?: string // defaults to `History of {brand} Home Appliance`
  paragraphs: string[]
  image: string
  imageAlt?: string
  linkLabel?: string
  linkHref?: string
}
