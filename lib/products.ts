// Types matching the actual Laravel API response shape
export interface ApiDiscount {
    enabled: boolean
    is_active: boolean
    type: 'percentage' | 'fixed' | null
    value: string | null
    start_date: string | null
    end_date: string | null
    final_price: number
}
interface ApiSearchProduct {
    id: number
    name: string
    slug: string
    productCode: string | null
    code: string | null
    barcode: string | null
    category_id: number | null
    brand_id: number | null
    unit_id: number | null
    box: number | null
    purchases_price: number
    sale_price: number
    discount_enabled: number | boolean
    discount_type: 'percentage' | 'fixed' | null
    discount_value: string | null
    discount_start_date: string | null
    discount_end_date: string | null
    image: string | null
    status: string
    warrenty: string | null
    guarantee: string | null
}

interface ApiSearchResponse {
    success: boolean
    current_page: number
    last_page: number
    per_page: number
    total: number
    products: ApiSearchProduct[]
}
export interface ApiProduct {
    id: number
    name: string
    slug:string
    code: string | null
    barcode: string | null
    category: string | null
    brand: string | null
    unit: string | null
    box: number | null
    purchases_price: number
    sale_price: number
    discount: ApiDiscount
    main_image: string | null
    images: string[]
    warrenty: string | null
    description: string | null
    guarantee: string | null
    is_new_arrival?: boolean
}

export interface ApiProductsResponse {
    success: boolean
    message: string
    data: ApiProduct[]
}

// Shape the UI components (ProductCard, etc.) actually expect
export interface UiProduct {
    id: number
    name: string
    slug:string
    price: number
    originalPrice: number
    image: string
    badge?: string
    rating: number
    reviews: number
    category: string | null
    brand: string | null          // NEW
    isNewArrival: boolean
}

const FALLBACK_IMAGE = '/placeholder-product.png'

export interface ApiRelatedProduct {
    id: number
    name: string
    slug:string
    purchases_price: number
    sale_price: number
}

export interface ApiProductDetail extends ApiProduct {
    related_products: ApiRelatedProduct[]
}

export interface ApiProductDetailResponse {
    success: boolean
    message: string
    data: ApiProductDetail
}

// Everything the discount UI needs, pre-computed so components don't
// have to re-derive percentages/savings/date math themselves.
export interface UiDiscountInfo {
    isActive: boolean
    type: 'percentage' | 'fixed' | null
    value: number | null
    startDate: string | null
    endDate: string | null
    originalPrice: number
    finalPrice: number
    savedAmount: number
    savedPercent: number

    daysRemaining: number | null
}

export interface UiProductDetail {
    id: number
    name: string
    slug:string
    code: string | null
    barcode: string | null
    category: string | null
    brand: string | null
    unit: string | null
    description: string | null
    box: number | null
    mainImage: string
    images: string[]
    discount: UiDiscountInfo
    warrenty: string | null
    guarantee: string | null
    relatedProducts: ApiRelatedProduct[]
}

/**
 * Builds the discount block a product page needs: whether it's currently
 * active, how much is saved (amount + percent), and days left before it ends.
 */
function buildDiscountInfo(product: ApiProduct): UiDiscountInfo {
    const originalPrice = product.sale_price
    const isActive = product.discount?.is_active ?? false
    const finalPrice = isActive ? product.discount.final_price : originalPrice
    const savedAmount = isActive ? Math.max(0, originalPrice - finalPrice) : 0
    const savedPercent = isActive && originalPrice > 0
        ? Math.round((savedAmount / originalPrice) * 100)
        : 0

    let daysRemaining: number | null = null
    if (isActive && product.discount.end_date) {
        const end = new Date(product.discount.end_date + 'T23:59:59')
        const now = new Date()
        daysRemaining = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    }

    return {
        isActive,
        type: product.discount?.type ?? null,
        value: product.discount?.value ? Number(product.discount.value) : null,
        startDate: product.discount?.start_date ?? null,
        endDate: product.discount?.end_date ?? null,
        originalPrice,
        finalPrice,
        savedAmount,
        savedPercent,
        daysRemaining,
    }
}

export function mapApiProductDetailToUi(product: ApiProductDetail): UiProductDetail {
    return {
        id: product.id,
        name: product.name.trim(),
        slug: product.slug,
        code: product.code,
        barcode: product.barcode,
        category: product.category,
        brand: product.brand,
        unit: product.unit,
        box: product.box,
        mainImage: product.main_image || FALLBACK_IMAGE,
        images: product.images ?? [],
        discount: buildDiscountInfo(product),
        warrenty: product.warrenty,
        guarantee: product.guarantee,
        description: product.description,
        relatedProducts: product.related_products ?? [],
    }
}

/**
 * Fetches a single product's full details (for a product detail page)
 * by id (or slug, once you add that column on the backend).
 */
export async function fetchProductDetails(slug: string | number): Promise<UiProductDetail> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

    if (!baseUrl) {
        throw new Error(
            'NEXT_PUBLIC_API_BASE_URL is not set. Add it to your .env.local file, e.g. ' +
            'NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1'
        )
    }

    const res = await fetch(`${baseUrl}/products/${slug}`)

    if (res.status === 404) {
        throw new Error('NOT_FOUND')
    }

    if (!res.ok) {
        throw new Error(`Failed to fetch product: ${res.status} ${res.statusText}`)
    }

    const json: ApiProductDetailResponse = await res.json()

    if (!json.success) {
        throw new Error(json.message || 'Failed to fetch product')
    }

    return mapApiProductDetailToUi(json.data)
}

/**
 * Converts one API product into the shape ProductCard expects.
 * - price: the discounted price if a discount is currently active, else the sale price
 * - originalPrice: the regular sale price (only shown as struck-through if it differs from price)
 * - rating/reviews: the API doesn't provide these yet, so they default to 0
 *   until a reviews feature exists on the backend.
 */
export function mapApiProductToUiProduct(product: ApiProduct): UiProduct {
    const hasActiveDiscount = product.discount?.is_active ?? false
    const price = hasActiveDiscount ? product.discount.final_price : product.sale_price
    const originalPrice = product.sale_price

    return {
        id: product.id,
        name: product.name.trim(),
        slug: product.slug,
        price,
        originalPrice,
        image: product.main_image || FALLBACK_IMAGE,
        badge: hasActiveDiscount ? 'Sale' : undefined,
        rating: 0,
        reviews: 0,
        category: product.category,
        brand: product.brand,
        isNewArrival: product.is_new_arrival ?? false,
    }
}

// --- NEW: sub-categories (used for the "Filter by Category" checkboxes) ---
export interface ApiSubCategory {
    id: number
    name: string
    slug: string
    image: string | null
    parent_id: number | null
    status: string
}

export interface ApiSubCategoriesResponse {
    success: boolean
    message: string
    data: ApiSubCategory[]
}

// --- NEW: brand details ---
export interface ApiBrand {
    id: number
    name: string
    slug: string
    image: string | null   // logo
    description: string | null
    status: string
}

export interface ApiBrandResponse {
    success: boolean
    message: string
    data: ApiBrand
}

export async function fetchBrandDetails(brandSlug: string): Promise<ApiBrand | null> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    if (!baseUrl) {
        throw new Error('NEXT_PUBLIC_API_BASE_URL is not set.')
    }

    const res = await fetch(`${baseUrl}/brand/${brandSlug}`)

    // Brand-details endpoint might not exist yet — fail soft, not hard.
    if (!res.ok) return null

    const json: ApiBrandResponse = await res.json()
    if (!json.success) return null

    return json.data
}

export async function fetchTopSellingProducts(limit?: number): Promise<UiProduct[]> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    if (!baseUrl) {
        throw new Error('NEXT_PUBLIC_API_BASE_URL is not set.')
    }

    const res = await fetch(`${baseUrl}/top-selling-products`)

    if (!res.ok) {
        throw new Error(`Failed to fetch top selling products: ${res.status} ${res.statusText}`)
    }

    const json: ApiProductsResponse = await res.json()

    if (!json.success) {
        throw new Error(json.message || 'Failed to fetch top selling products')
    }

    let products = json.data.map(mapApiProductToUiProduct)

    if (limit) {
        products = products.slice(0, limit)
    }

    return products
}
/**
 * Fetches products for a specific brand slug,
 * e.g. /brand/product/natural
 */
export async function fetchProductsByBrand(brandSlug: string): Promise<UiProduct[]> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    if (!baseUrl) {
        throw new Error('NEXT_PUBLIC_API_BASE_URL is not set.')
    }

    const res = await fetch(`${baseUrl}/brand/product/${brandSlug}`)

    if (res.status === 404) {
        throw new Error('NOT_FOUND')
    }

    if (!res.ok) {
        throw new Error(`Failed to fetch brand products: ${res.status} ${res.statusText}`)
    }

    const json: ApiProductsResponse = await res.json()

    if (!json.success) {
        throw new Error(json.message || 'Failed to fetch brand products')
    }

    return json.data.map(mapApiProductToUiProduct)
}
export async function fetchSubCategories(categorySlug: string): Promise<ApiSubCategory[]> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    if (!baseUrl) {
        throw new Error('NEXT_PUBLIC_API_BASE_URL is not set.')
    }

    const res = await fetch(`${baseUrl}/sub-category/${categorySlug}`)

    if (!res.ok) {
        throw new Error(`Failed to fetch sub-categories: ${res.status} ${res.statusText}`)
    }

    const json: ApiSubCategoriesResponse = await res.json()

    if (!json.success) {
        throw new Error(json.message || 'Failed to fetch sub-categories')
    }

    return json.data
}

// --- NEW: products for a specific category slug ---
export async function fetchProductsByCategory(categorySlug: string): Promise<UiProduct[]> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    if (!baseUrl) {
        throw new Error('NEXT_PUBLIC_API_BASE_URL is not set.')
    }

    const res = await fetch(`${baseUrl}/category/product/${categorySlug}`)

    if (res.status === 404) {
        throw new Error('NOT_FOUND')
    }

    if (!res.ok) {
        throw new Error(`Failed to fetch category products: ${res.status} ${res.statusText}`)
    }

    const json: ApiProductsResponse = await res.json()

    if (!json.success) {
        throw new Error(json.message || 'Failed to fetch category products')
    }

    return json.data.map(mapApiProductToUiProduct)
}

export async function fetchProductsBySubCategory(subCategorySlug: string): Promise<UiProduct[]> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    if (!baseUrl) {
        throw new Error('NEXT_PUBLIC_API_BASE_URL is not set.')
    }

    const res = await fetch(`${baseUrl}/subcategory/product/${subCategorySlug}`)

    if (res.status === 404) {
        throw new Error('NOT_FOUND')
    }

    if (!res.ok) {
        throw new Error(`Failed to fetch sub-category products: ${res.status} ${res.statusText}`)
    }

    const json: ApiProductsResponse = await res.json()

    if (!json.success) {
        throw new Error(json.message || 'Failed to fetch sub-category products')
    }

    return json.data.map(mapApiProductToUiProduct)
}



/**
 * Fetches products from the Laravel API and returns them already
 * mapped into the UI-friendly shape.
 *
 * Requires NEXT_PUBLIC_API_BASE_URL to point at the Laravel API root,
 * e.g. http://127.0.0.1:8000/api/v1
 */
export async function fetchProducts(params?: {
    limit?: number
    category_id?: number
    brand_id?: number
    search?: string
}): Promise<UiProduct[]> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

    if (!baseUrl) {
        throw new Error(
            'NEXT_PUBLIC_API_BASE_URL is not set. Add it to your .env.local file, e.g. ' +
            'NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1'
        )
    }

    const query = new URLSearchParams()
    if (params?.category_id) query.set('category_id', String(params.category_id))
    if (params?.brand_id) query.set('brand_id', String(params.brand_id))
    if (params?.search) query.set('search', params.search)

    const url = `${baseUrl}/products${query.toString() ? `?${query.toString()}` : ''}`

    const res = await fetch(url)

    if (!res.ok) {
        throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`)
    }

    const json: ApiProductsResponse = await res.json()

    if (!json.success) {
        throw new Error(json.message || 'Failed to fetch products')
    }

    let products = json.data.map(mapApiProductToUiProduct)

    if (params?.limit) {
        products = products.slice(0, params.limit)
    }

    return products
}

function isDiscountCurrentlyActive(p: ApiSearchProduct): boolean {
    if (!p.discount_enabled || !p.discount_type || !p.discount_value) return false

    const now = new Date()
    if (p.discount_start_date && now < new Date(p.discount_start_date)) return false
    if (p.discount_end_date && now > new Date(p.discount_end_date + 'T23:59:59')) return false

    return true
}

function computeSearchFinalPrice(p: ApiSearchProduct): number {
    if (!isDiscountCurrentlyActive(p)) return p.sale_price

    const value = Number(p.discount_value)
    if (p.discount_type === 'percentage') {
        return Math.max(0, Math.round(p.sale_price - (p.sale_price * value) / 100))
    }
    // fixed
    return Math.max(0, p.sale_price - value)
}

function resolveImageUrl(imagePath: string | null): string {
    if (!imagePath) return FALLBACK_IMAGE
    // Already a full URL (some endpoints return one) — use as-is
    if (imagePath.startsWith('http')) return imagePath

    const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL
    if (!imageBaseUrl) return FALLBACK_IMAGE

    return `${imageBaseUrl}${imagePath}`
}

function mapApiSearchProductToUiProduct(p: ApiSearchProduct): UiProduct {
    const hasActiveDiscount = isDiscountCurrentlyActive(p)
    const price = hasActiveDiscount ? computeSearchFinalPrice(p) : p.sale_price

    return {
        id: p.id,
        name: p.name.trim(),
        slug: p.slug,
        price,
        originalPrice: p.sale_price,
        image: resolveImageUrl(p.image),
        badge: hasActiveDiscount ? 'Sale' : undefined,
        rating: 0,
        reviews: 0,
        category: null,   // search endpoint only gives category_id, not the name
        brand: null,       // same for brand_id — see note below
        isNewArrival: false,
    }
}

export async function searchProducts(query: string): Promise<UiProduct[]> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    if (!baseUrl) {
        throw new Error('NEXT_PUBLIC_API_BASE_URL is not set.')
    }

    if (!query.trim()) return []

    const res = await fetch(`${baseUrl}/products/search?q=${encodeURIComponent(query)}`)

    if (!res.ok) {
        throw new Error(`Failed to search products: ${res.status} ${res.statusText}`)
    }

    const json: ApiSearchResponse = await res.json()

    if (!json.success) {
        throw new Error('Failed to search products')
    }

    return (json.products ?? []).map(mapApiSearchProductToUiProduct)
}