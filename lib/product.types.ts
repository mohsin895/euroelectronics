// ─── Shared product types used by both the page and the details component ───────

export interface PhotoFile {
    id: number
    file_name: string
    file_original_name: string
    extension: string
}

export interface ProductStock {
    id: number
    product_id: number
    variant: string
    sku: string | null
    price: number
    qty: number
    image: string | null
}

export interface ProductDetail {
    id: number
    slug: string
    name: string
    description: string | null
    mini_description: string | null
    unit_price: number
    discount: number
    discount_type: "amount" | "percent"
    discount_start_date: number | null
    discount_end_date: number | null
    rating: number
    current_stock: number
    cash_on_delivery: number
    has_warranty: number
    shipping_type: string
    shipping_cost: number
    unit: string | null
    weight: number | null
    min_qty?: number          // ← add this
    colors: string
    choice_options: string
    thumbnail: PhotoFile | null
    photo_list: PhotoFile[]
    stocks: ProductStock[]
    taxes: unknown[]
}

export interface RelatedProduct {
    id: number
    slug: string
    name: string
    thumbnail?: {
        id: number
        file_name: string
    } | null
    has_discount: boolean
    discount: number
    discount_type: "amount" | "percent"
    stroked_price: string
    main_price: string
    current_stock: number
    rating: number
    tag: string
    brand_id?: number | null
    stocks: ProductStock[]
}