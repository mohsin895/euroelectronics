"use client"

import { useMemo } from "react"
import { SectionHeading } from "./section-heading"
import { ProductCard, type ApiProduct } from "./product-card"

export interface ApiProductSection {
    name: string
    slug?: string
    products: ApiProduct[]
}

// Randomly pick up to `count` products from the array
function getRandomProducts(products: ApiProduct[], count: number) {
    const shuffled = [...products].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
}

export function ProductSectionBlock({ section }: { section: ApiProductSection }) {
    if (!section.products.length) return null

    // Build a URL-friendly slug from the section name, e.g. "Helmets & Helmet Accessories" → "helmets-helmet-accessories"
    // const slug = section.slug;
    // console.log(slug);

    const displayProducts = useMemo(
        () => getRandomProducts(section.products, 6),
        [section.products]
    )

    return (
        <section className="mx-auto max-w-7xl px-4 py-6">
            <SectionHeading
                title={section.name}
                href={`/category/${section.slug}`}
                showMore={true}
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {displayProducts.map((p) => (
                    <ProductCard key={p.id} product={p} showAddToCart />
                ))}
            </div>
        </section>
    )
}