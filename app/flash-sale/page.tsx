import siteData from "@/data/site.json"
import type { SiteData } from "@/lib/types"
import type { ApiCategory } from "@/app/page"
import { SiteHeader } from "@/components/site-header"
import { FeaturesBar } from "@/components/features-bar"
import { SiteFooter } from "@/components/site-footer"
import { FloatingButtons } from "@/components/floating-buttons"
import { type FlashSaleDeal } from "@/components/flash-sale-section"  // ← add this
import { ProductCard, type ApiProduct } from "@/components/product-card"

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

async function getFlashDeals(): Promise<FlashSaleDeal[]> {  // ← now recognized
    try {
        const res = await fetch(`${DOMAIN}/flash-deals/info`, { next: { revalidate: 60 } })
        if (!res.ok) return []
        const json = await res.json()
        return json.success && Array.isArray(json.data) ? json.data : []
    } catch { return [] }
}

export default async function FlashSalePage() {
    const [categories, deals] = await Promise.all([
        getCategories(),
        getFlashDeals(),
    ])

    const deal = deals.find(d => d.products.data.length > 0) ?? deals[0]
    const products = (deal?.products.data ?? []) as ApiProduct[]
    const total = products.length

    return (
        <div className="min-h-screen bg-background">
            <SiteHeader brand={data.brand} categories={categories} />
            <main className="mx-auto max-w-7xl px-4 py-6">

                {/* Breadcrumb + count */}
                <div className="mb-6 flex items-center justify-between text-sm text-muted-foreground">
                    <nav className="flex items-center gap-1">
                        <a href="/" className="hover:text-foreground">Home</a>
                        <span>/</span>
                        <span className="text-foreground font-semibold">Flash Sales</span>
                    </nav>
                    <span>Showing 1-{total} of {total}</span>
                </div>

                {/* Products grid */}
                {products.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {products.map(p => (
                            <ProductCard key={p.id} product={p} showAddToCart />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
                        <div className="text-5xl">🏷️</div>
                        <p className="text-muted-foreground">No flash sale products available right now.</p>
                    </div>
                )}
            </main>
            <FeaturesBar features={data.features} />
            <SiteFooter brand={data.brand} footer={data.footer} />
            <FloatingButtons />
        </div>
    )
}