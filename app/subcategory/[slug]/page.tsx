import { notFound } from "next/navigation"
import siteData from "@/data/site.json"
import type { SiteData } from "@/lib/types"
import type { ApiCategory } from "@/app/page"
import { SiteHeader } from "@/components/site-header"
import { FeaturesBar } from "@/components/features-bar"
import { SiteFooter } from "@/components/site-footer"
import { FloatingButtons } from "@/components/floating-buttons"
import type { ApiProduct } from "@/components/product-card"
import { SubCategoryProduct } from "@/components/subcategory-product"

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

async function getCategoryProducts(slug: string): Promise<ApiProduct[]> {
    try {
        const res = await fetch(`${DOMAIN}/subcategory-product/${slug}`, { next: { revalidate: 60 } })
        if (!res.ok) return []
        const json = await res.json()
        return json.success && Array.isArray(json.data) ? json.data : []
    } catch { return [] }
}

interface PageProps {
    params: Promise<{ slug: string }>
}

export default async function SubCategoryPage({ params }: PageProps) {
    const { slug } = await params

    if (!slug) notFound()

    const [categories, products] = await Promise.all([
        getCategories(),
        getCategoryProducts(slug),
    ])

    // 1. exact match on top-level category
    // 2. match inside sub_categories
    // 3. partial match (slug contains category slug)
    // 4. fallback — if products came back, still render the page
    const category =
        categories.find(c => c.slug === slug) ??
        categories.flatMap(c => c.sub_categories).find(s => s.slug === slug) ??
        categories.find(c => slug.toLowerCase().includes(c.slug.toLowerCase())) ??
        categories.flatMap(c => c.sub_categories).find(s =>
            slug.toLowerCase().includes(s.slug.toLowerCase())
        )

    // Only hard 404 when BOTH category unknown AND no products returned
    if (!category && products.length === 0) {
        notFound()
    }

    // Clean up the slug into a readable name when category lookup failed
    const categoryName =
        category?.name ??
        slug
            .replace(/-[A-Za-z0-9]{5,}$/, "")   // strip trailing ID suffix e.g. -X6jXI
            .replace(/-/g, " ")
            .replace(/\b\w/g, l => l.toUpperCase())
            .trim()

    const subCategories = (
        "sub_categories" in (category ?? {})
            ? (category as ApiCategory).sub_categories
            : []
    ) as unknown as ApiCategory[]

    return (
        <div className="min-h-screen bg-background">
            <SiteHeader brand={data.brand} categories={categories} />
            <SubCategoryProduct
                categories={subCategories}
                products={products}
                categoryName={categoryName}
            />
            <FeaturesBar features={data.features} />
            <SiteFooter brand={data.brand} footer={data.footer} />
            <FloatingButtons />
        </div>
    )
}