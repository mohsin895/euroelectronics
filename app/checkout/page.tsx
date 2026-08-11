import siteData from "@/data/site.json"
import type { SiteData, ShippingArea, CartSettings } from "@/lib/types"
import type { ApiCategory } from "@/app/page"
import { SiteHeader } from "@/components/site-header"
import { FeaturesBar } from "@/components/features-bar"
import { SiteFooter } from "@/components/site-footer"
import { FloatingButtons } from "@/components/floating-buttons"
import { CheckoutClient } from "./checkout-client"

const data = siteData as SiteData
const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN ?? ""

async function getCategories(): Promise<ApiCategory[]> {
    try {
        const res = await fetch(`${DOMAIN}/categories`, { next: { revalidate: 60 } })
        if (!res.ok) return []
        const json = await res.json()
        return json.success && Array.isArray(json.data) ? json.data : []
    } catch { return [] }
}

interface ShippingChargeApiItem {
    id: number
    name: string
    shipping_charge: string
    status: string
}

interface ShippingChargeResponse {
    result: boolean
    "shippingCharge "?: ShippingChargeApiItem[]
    shippingCharge?: ShippingChargeApiItem[]
}

async function getShippingAreas(): Promise<ShippingArea[]> {
    try {
        const res = await fetch(`${DOMAIN}/shipping-charge`, { next: { revalidate: 60 } })
        if (!res.ok) return []
        const json: ShippingChargeResponse = await res.json()

        if (!json.result) return []

        // API returns the array under "shippingCharge " (trailing space) — handle both
        const list = json["shippingCharge "] ?? json.shippingCharge ?? []
        if (!Array.isArray(list)) return []

        return list
            .filter(item => item.status === "active")
            .map(item => {
                const charge = Math.round(parseFloat(item.shipping_charge))
                return {
                    id: item.id,
                    label: `${item.name} (৳ ${charge})`,
                    value: charge,
                }
            })
            .sort((a, b) => a.id - b.id)
    } catch {
        return []
    }
}

interface CartSettingResponse {
    result: boolean
    "settings "?: CartSettings
    settings?: CartSettings
}

async function getCartSettings(): Promise<CartSettings | null> {
    try {
        const res = await fetch(`${DOMAIN}/cart-setting`, { next: { revalidate: 60 } })
        if (!res.ok) return null
        const json: CartSettingResponse = await res.json()
        if (!json.result) return null

        // API returns the object under "settings " (trailing space) — handle both
        return json["settings "] ?? json.settings ?? null
    } catch {
        return null
    }
}

export default async function CheckoutPage() {
    const [categories, shippingAreas, cartSettings] = await Promise.all([
        getCategories(),
        getShippingAreas(),
        getCartSettings(),
    ])

    return (
        <div className="min-h-screen bg-background">
            <SiteHeader brand={data.brand} categories={categories} />
            <CheckoutClient shippingAreas={shippingAreas} cartSettings={cartSettings} />
            <FeaturesBar features={data.features} />
            <SiteFooter brand={data.brand} footer={data.footer} />
            <FloatingButtons />
        </div>
    )
}