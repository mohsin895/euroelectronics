import { notFound } from "next/navigation"
import siteData from "@/data/site.json"
import type { SiteData } from "@/lib/types"
import type { ApiCategory } from "@/app/page"
import { SiteHeader } from "@/components/site-header"
import { FeaturesBar } from "@/components/features-bar"
import { SiteFooter } from "@/components/site-footer"
import { FloatingButtons } from "@/components/floating-buttons"
import type { ApiProduct } from "@/components/product-card"
import { CategoryProduct } from "@/components/category-section"

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
async function getBrands(): Promise<{ id: number; name: string; slug: string }[]> {
    try {
        const res = await fetch(`${DOMAIN}/brands`, { next: { revalidate: 60 } })
        if (!res.ok) return []
        const json = await res.json()
        return json.success && Array.isArray(json.data) ? json.data : []
    } catch { return [] }
}
async function getCategoryProducts(slug: string): Promise<ApiProduct[]> {
    try {
        const res = await fetch(`${DOMAIN}/category-product/${slug}`, { next: { revalidate: 60 } })
        if (!res.ok) return []
        const json = await res.json()
        return json.success && Array.isArray(json.data) ? json.data : []
    } catch { return [] }
}

interface PageProps {
    params: Promise<{ slug: string }>  // ← Next.js 15: params is a Promise
}

export default async function CategoryPage({ params }: PageProps) {
    const { slug } = await params  // ← must be awaited

    if (!slug) notFound()

    const [categories, products, brands] = await Promise.all([
        getCategories(),
        getCategoryProducts(slug),
        getBrands(),
    ])

    const category =
        categories.find(c => c.slug === slug) ??
        categories.find(c => typeof c.slug === "string" && slug.includes(c.slug)) ??
        categories.find(c => slug.endsWith(String(c.id)))

    if (!category && products.length === 0) {
        notFound()
    }

    const subCategories = (category?.sub_categories ?? []) as unknown as ApiCategory[]

    return (
        <div className="min-h-screen bg-background">
            <SiteHeader brand={data.brand} categories={categories} />
            <CategoryProduct  brands={brands}
                categories={subCategories}
                products={products}
                categoryName={category?.name ?? slug}
            />
            <FeaturesBar features={data.features} />
            <SiteFooter brand={data.brand} footer={data.footer} />
            <FloatingButtons />
        </div>
    )
}