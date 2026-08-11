import siteData from "@/data/site.json"
import type { SiteData } from "@/lib/types"
import type { ApiCategory } from "@/app/page"
import { SiteHeader } from "@/components/site-header"
import { FeaturesBar } from "@/components/features-bar"
import { SiteFooter } from "@/components/site-footer"
import { FloatingButtons } from "@/components/floating-buttons"

import type { ApiProduct } from "@/components/product-card"
import {CategoryProduct} from "@/components/category-section";

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

async function getAllProducts(): Promise<ApiProduct[]> {
    try {
        const res = await fetch(`${DOMAIN}/all-products`, { next: { revalidate: 60 } })
        if (!res.ok) return []
        const json = await res.json()
        return json.success && Array.isArray(json.data) ? json.data : []
    } catch { return [] }
}

export default async function ShopPage() {
    const [categories, products] = await Promise.all([
        getCategories(),
        getAllProducts(),
    ])

    return (
        <div className="min-h-screen bg-background">
            <SiteHeader brand={data.brand} categories={categories} />
            <CategoryProduct categories={categories} products={products} />
            <FeaturesBar features={data.features} />
            <SiteFooter brand={data.brand} footer={data.footer} />
            <FloatingButtons />
        </div>
    )
}