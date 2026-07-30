// lib/api.ts
// Thin wrappers around the checkout-related backend endpoints.

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL

// ---------- Types ----------

export interface AdvanceRule {
    id: number
    cart_setting_id: number
    min_order_amount: number
    max_order_amount: number | null
    advance_payment_type: 'full' | 'percentage'
    advance_percentage: number
    fixed_delivery_charge: number
    label: string
    delivery_charge_advance_enabled: number
    delivery_advance_type: string
    sort_order: number
    is_active: boolean
}

export interface CartSettings {
    id: number
    online_payment_discount_enabled: boolean
    online_payment_discount_percent: number
    discount_valid_from: string | null
    discount_valid_until: string | null
    delivery_charge_advance_required: boolean
    delivery_charge_amount: number
    delivery_charge_free: string
    free_delivery_min_order: string
    default_delivery_charge: string
    delivery_charge_advance_enabled: number
    delivery_advance_type: string
    advance_rules: AdvanceRule[]
}

export interface ShippingChargeOption {
    id: number
    name: string
    shipping_charge: string
    status: string
}

export interface StoreOrderPayload {
    name: string
    phone: string
    address: string
    city: string
    postal_code: string
    payment_method: string
    shipping_charge_id: number | null
    shipping_charge: number
    subtotal: number
    discount: number
    advance_payment_required: boolean
    advance_payment_amount: number
    total: number
    items: {
        product_id: number
        name: string
        quantity: number
        price: number
    }[]
}

export interface StoreOrderResponse {
    result: boolean
    message?: string
    order?: Record<string, unknown>
    [key: string]: unknown
}

// ---------- Helpers ----------

async function getJson<T>(path: string): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { Accept: 'application/json' },
    })
    if (!res.ok) {
        throw new Error(`Request to ${path} failed with status ${res.status}`)
    }
    return res.json() as Promise<T>
}

// ---------- Endpoints ----------

/**
 * The backend sometimes returns keys with a trailing space
 * (e.g. "settings " / "shippingCharge "). This pulls a value out
 * regardless of whether the key has stray whitespace.
 */
function pickField<T>(obj: Record<string, unknown>, fieldName: string): T | undefined {
    if (fieldName in obj) return obj[fieldName] as T
    const trimmedMatch = Object.keys(obj).find((key) => key.trim() === fieldName)
    return trimmedMatch ? (obj[trimmedMatch] as T) : undefined
}

export async function fetchCartSetting(): Promise<CartSettings> {
    const data = await getJson<Record<string, unknown>>('/cart-setting')
    const settings = pickField<CartSettings>(data, 'settings')
    if (!settings) {
        throw new Error('Cart settings response did not include a "settings" field')
    }
    return settings
}

export async function fetchShippingCharge(): Promise<ShippingChargeOption[]> {
    const data = await getJson<Record<string, unknown>>('/shipping-charge')
    const shippingCharge = pickField<ShippingChargeOption[]>(data, 'shippingCharge')
    return shippingCharge ?? []
}

export async function storeOrder(payload: StoreOrderPayload): Promise<StoreOrderResponse> {
    const res = await fetch(`${API_BASE}/store-order`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify(payload),
    })

    const data = (await res.json()) as StoreOrderResponse

    if (!res.ok || data.result === false) {
        throw new Error(data.message || `Order submission failed with status ${res.status}`)
    }

    return data
}