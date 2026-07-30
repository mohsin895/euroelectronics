'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { FloatingCart } from '@/components/floating-cart'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { fetchBrandDetails, fetchProductsByBrand, type UiProduct, type ApiBrand } from '@/lib/products'

const PAGE_SIZE = 16
const DESCRIPTION_PREVIEW_LENGTH = 220
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL
function titleCase(slug: string) {
    return slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
}

export function BrandPageClient({ slug }: { slug: string }) {
    const [products, setProducts] = useState<UiProduct[]>([])
    const [brand, setBrand] = useState<ApiBrand | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [descriptionExpanded, setDescriptionExpanded] = useState(false)
    const [page, setPage] = useState(1)

    useEffect(() => {
        setIsLoading(true)
        setError(null)

        Promise.all([fetchProductsByBrand(slug), fetchBrandDetails(slug)])
            .then(([productData, brandData]) => {
                setProducts(productData)
                setBrand(brandData)
            })
            .catch((err) => {
                console.error('[BrandPage] Failed to load brand:', err)
                setError(
                    err instanceof Error && err.message === 'NOT_FOUND'
                        ? 'Brand not found.'
                        : 'Unable to load this brand right now.'
                )
            })
            .finally(() => setIsLoading(false))
    }, [slug])

    const brandName = brand?.name || products[0]?.brand || titleCase(slug)

    const description = brand?.description ?? ''
    const isLongDescription = description.length > DESCRIPTION_PREVIEW_LENGTH
    const visibleDescription =
        descriptionExpanded || !isLongDescription
            ? description
            : description.slice(0, DESCRIPTION_PREVIEW_LENGTH).trimEnd() + '...'

    const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE))
    const pageProducts = useMemo(
        () => products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
        [products, page]
    )
    const rangeStart = products.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
    const rangeEnd = Math.min(page * PAGE_SIZE, products.length)
    function buildImageUrl(path: string) {
        if (!IMAGE_BASE_URL) return path
        const base = IMAGE_BASE_URL.replace(/\/+$/, '')
        const cleanPath = path.replace(/^\/+/, '')
        return `${base}/${cleanPath}`
    }
    return (
        <>
            <Header />
            <main className="min-h-screen bg-background">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                    {/* Brand header */}
                    <div className="grid md:grid-cols-[280px_1fr] gap-6 mb-10">
                        <div className="border border-border rounded-lg bg-white flex items-center justify-center p-6 h-[160px]">
                            {brand?.image ? (
                                <Image

                                    src={buildImageUrl(brand.image)}
                                    alt={brandName}
                                    width={220}
                                    height={100}
                                    className="object-contain max-h-full"
                                    unoptimized
                                />
                            ) : (
                                <span className="text-xl font-bold text-foreground">{brandName}</span>
                            )}
                        </div>

                        <div>
                            {description ? (
                                <>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {visibleDescription}
                                    </p>
                                    {isLongDescription && (
                                        <button
                                            onClick={() => setDescriptionExpanded((v) => !v)}
                                            className="text-primary text-sm font-medium mt-2 hover:underline"
                                        >
                                            {descriptionExpanded ? 'Show Less' : 'Read More'}
                                        </button>
                                    )}
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Browse all products from {brandName}.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Section heading */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-foreground">Brand Products</h2>
                        <div className="w-12 h-1 bg-primary mt-2" />
                    </div>

                    {isLoading ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">Loading products...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">{error}</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">No products found for this brand</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {pageProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        slug={product.slug}
                                        id={product.id}
                                        name={product.name}
                                        price={product.price}
                                        originalPrice={product.originalPrice}
                                        image={product.image}
                                        badge={product.badge}
                                        rating={product.rating}
                                        reviews={product.reviews}
                                    />
                                ))}
                            </div>

                            <div className="flex flex-col items-center gap-3 mt-10">
                                {totalPages > 1 && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="w-8 h-8 flex items-center justify-center rounded-full border border-border disabled:opacity-40"
                                        >
                                            ‹
                                        </button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                                            <button
                                                key={n}
                                                onClick={() => setPage(n)}
                                                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm ${
                                                    page === n
                                                        ? 'bg-primary text-white'
                                                        : 'border border-border text-foreground'
                                                }`}
                                            >
                                                {n}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="w-8 h-8 flex items-center justify-center rounded-full border border-border disabled:opacity-40"
                                        >
                                            ›
                                        </button>
                                    </div>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    Showing {rangeStart} - {rangeEnd} of {products.length} results
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </main>
            <Footer />
            <FloatingCart />
        </>
    )
}