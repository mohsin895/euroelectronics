import { notFound } from "next/navigation"
import siteData from "@/data/site.json"
import type { SiteData } from "@/lib/types"
import type { Brand, ApiCategory } from "@/app/page"
import { SiteHeader } from "@/components/site-header"
import { FeaturesBar } from "@/components/features-bar"
import { SiteFooter } from "@/components/site-footer"
import { FloatingButtons } from "@/components/floating-buttons"
import type { ApiProduct } from "@/components/product-card"
import { BrandProduct } from "@/components/brand-product"

const data = siteData as SiteData
const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN ?? ""

async function getCategories(): Promise<ApiCategory[]> {
    try {
        const res = await fetch(`${DOMAIN}/categories`, { next: { revalidate: 60 } })
        if (!res.ok) return []
        const json = await res.json()
        return json.success && Array.isArray(json.data) ? json.data : []
    } catch {
        return []
    }
}

async function getBrands(): Promise<Brand[]> {
    try {
        const res = await fetch(`${DOMAIN}/brands`, { next: { revalidate: 60 } })
        if (!res.ok) return []
        const json = await res.json()
        console.log(json);
        return json.success && Array.isArray(json.data) ? json.data : []
    } catch {
        return []
    }
}

async function getBrandProducts(slug: string): Promise<ApiProduct[]> {
    try {
        const res = await fetch(`${DOMAIN}/products/brand/${slug}`, { next: { revalidate: 60 } })
        if (!res.ok) return []
        const json = await res.json()
        return json.success && Array.isArray(json.data) ? json.data : []
    } catch {
        return []
    }
}

interface PageProps {
    params: Promise<{ slug: string }> // ← Next.js 15: params is a Promise
}

export default async function BrandPage({ params }: PageProps) {
    const { slug } = await params // ← must be awaited

    if (!slug) notFound()

    const [categories, brands, products] = await Promise.all([
        getCategories(),
        getBrands(),
        getBrandProducts(slug),
    ])

    const brand =
        brands.find((b) => b.slug === slug) ??
        brands.find((b) => typeof b.slug === "string" && slug.includes(b.slug)) ??
        brands.find((b) => slug.endsWith(String(b.id)))

    if (!brand && products.length === 0) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-background">
            <SiteHeader brand={data.brand} categories={categories} />
            <BrandProduct
                brands={brands}
                products={products}
                categoryName={brand?.name ?? slug}
            />
            <FeaturesBar features={data.features} />
            <SiteFooter brand={data.brand} footer={data.footer} />
            <FloatingButtons />
        </div>
    )
}