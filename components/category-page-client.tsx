'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { FloatingCart } from '@/components/floating-cart'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Minus } from 'lucide-react'
import {
    fetchProductsByCategory,
    fetchSubCategories,
    type UiProduct,
    type ApiSubCategory,
} from '@/lib/products'

const PAGE_SIZE = 16
const MAX_PRICE_LIMIT = 5000

const SORT_OPTIONS = [
    { value: 'default', label: 'Default Sorting' },
    { value: 'latest', label: 'Sort by Latest' },
    { value: 'oldest', label: 'Sort by Oldest' },
    { value: 'price-asc', label: 'Price Low to High' },
    { value: 'price-desc', label: 'Price High to Low' },
] as const

type SortValue = (typeof SORT_OPTIONS)[number]['value']

function titleCase(slug: string) {
    return slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
}

export function CategoryPageClient({ slug }: { slug: string }) {
    const [products, setProducts] = useState<UiProduct[]>([])
    const [subCategories, setSubCategories] = useState<ApiSubCategory[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // filters
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [selectedBrands, setSelectedBrands] = useState<string[]>([])
    const [newArrivalOnly, setNewArrivalOnly] = useState(false)
    const [minPrice, setMinPrice] = useState(0)
    const [maxPrice, setMaxPrice] = useState(MAX_PRICE_LIMIT)

    const [sortBy, setSortBy] = useState<SortValue>('default')
    const [sortOpen, setSortOpen] = useState(false)
    const [page, setPage] = useState(1)

    const [categoryFilterOpen, setCategoryFilterOpen] = useState(true)
    const [priceFilterOpen, setPriceFilterOpen] = useState(true)

    useEffect(() => {
        setIsLoading(true)
        setError(null)

        Promise.all([fetchProductsByCategory(slug), fetchSubCategories(slug).catch(() => [])])
            .then(([productData, subCategoryData]) => {
                setProducts(productData)
                setSubCategories(subCategoryData)
            })
            .catch((err) => {
                console.error('[CategoryPage] Failed to load category:', err)
                setError(
                    err instanceof Error && err.message === 'NOT_FOUND'
                        ? 'Category not found.'
                        : 'Unable to load this category right now.'
                )
            })
            .finally(() => setIsLoading(false))
    }, [slug])

    const brands = useMemo(() => {
        return [...new Set(products.map((p) => p.brand).filter((b): b is string => Boolean(b)))]
    }, [products])

    const categoryDisplayName = products[0]?.category || titleCase(slug)

    const filteredProducts = useMemo(() => {
        let list = [...products]

        if (selectedCategories.length > 0) {
            list = list.filter((p) => p.category && selectedCategories.includes(p.category))
        }

        if (selectedBrands.length > 0) {
            list = list.filter((p) => p.brand && selectedBrands.includes(p.brand))
        }

        if (newArrivalOnly) {
            list = list.filter((p) => p.isNewArrival)
        }

        list = list.filter((p) => p.price >= minPrice && p.price <= maxPrice)

        if (sortBy === 'price-asc') {
            list.sort((a, b) => a.price - b.price)
        } else if (sortBy === 'price-desc') {
            list.sort((a, b) => b.price - a.price)
        } else if (sortBy === 'latest') {
            list.sort((a, b) => b.id - a.id)
        } else if (sortBy === 'oldest') {
            list.sort((a, b) => a.id - b.id)
        }

        return list
    }, [products, selectedCategories, selectedBrands, newArrivalOnly, minPrice, maxPrice, sortBy])

    // reset to page 1 whenever filters/sort change
    useEffect(() => {
        setPage(1)
    }, [selectedCategories, selectedBrands, newArrivalOnly, minPrice, maxPrice, sortBy])

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE))
    const pageProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    const rangeStart = filteredProducts.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
    const rangeEnd = Math.min(page * PAGE_SIZE, filteredProducts.length)

    function toggleCategory(name: string) {
        setSelectedCategories((prev) =>
            prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
        )
    }

    function toggleBrand(name: string) {
        setSelectedBrands((prev) =>
            prev.includes(name) ? prev.filter((b) => b !== name) : [...prev, name]
        )
    }

    return (
        <>
            <Header />
            <main className="min-h-screen bg-background">
                <div className="px-4 md:px-6 py-4 bg-white border-b border-border flex items-center justify-between">
                    <h1 className="text-2xl font-bold">{categoryDisplayName}</h1>
                    <div className="text-sm">
                        <Link href="/" className="text-muted-foreground hover:text-primary">
                            Home
                        </Link>
                        <span className="text-muted-foreground"> {'>'} {categoryDisplayName}</span>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                    <div className="grid md:grid-cols-[260px_1fr] gap-8">
                        {/* Sidebar */}
                        <aside className="space-y-6">
                            {/* Category filter */}
                            <div className="mb-[10px] rounded-[4px] bg-white p-3 shadow-[0_1px_1px_rgba(0,0,0,0.1)]">
                                <button
                                    onClick={() => setCategoryFilterOpen((v) => !v)}
                                    className="w-full flex items-center justify-between font-semibold text-sm tracking-wide mb-3"
                                >
                                    FILTER BY CATEGORY
                                    <Minus className="w-4 h-4" />
                                </button>
                                {categoryFilterOpen && (
                                    <div className="space-y-2">
                                        {subCategories.map((cat) => (
                                            <label
                                                key={cat.id}
                                                className="flex items-center gap-2 text-sm cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCategories.includes(cat.name)}
                                                    onChange={() => toggleCategory(cat.name)}
                                                    className="accent-primary"
                                                />
                                                {cat.name}
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Price range */}
                            <div className="mb-[10px] rounded-[4px] bg-white p-3 shadow-[0_1px_1px_rgba(0,0,0,0.1)]">
                                <button
                                    onClick={() => setPriceFilterOpen((v) => !v)}
                                    className="w-full flex items-center justify-between font-semibold text-sm tracking-wide mb-4"
                                >
                                    PRICE RANGE
                                    <Minus className="w-4 h-4" />
                                </button>
                                {priceFilterOpen && (
                                    <>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span>৳ {minPrice}</span>
                                            <span>৳ {maxPrice}</span>
                                        </div>
                                        <div className="relative h-6">
                                            <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-border rounded" />
                                            <div
                                                className="absolute top-1/2 -translate-y-1/2 h-1 bg-primary rounded"
                                                style={{
                                                    left: `${(minPrice / MAX_PRICE_LIMIT) * 100}%`,
                                                    right: `${100 - (maxPrice / MAX_PRICE_LIMIT) * 100}%`,
                                                }}
                                            />
                                            <input
                                                type="range"
                                                min={0}
                                                max={MAX_PRICE_LIMIT}
                                                value={minPrice}
                                                onChange={(e) =>
                                                    setMinPrice(Math.min(Number(e.target.value), maxPrice - 1))
                                                }
                                                className="range-thumb absolute w-full top-1/2 -translate-y-1/2"
                                            />
                                            <input
                                                type="range"
                                                min={0}
                                                max={MAX_PRICE_LIMIT}
                                                value={maxPrice}
                                                onChange={(e) =>
                                                    setMaxPrice(Math.max(Number(e.target.value), minPrice + 1))
                                                }
                                                className="range-thumb absolute w-full top-1/2 -translate-y-1/2"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Brands */}
                            {brands.length > 0 && (
                                <div className="mb-[10px] rounded-[4px] bg-white p-3 shadow-[0_1px_1px_rgba(0,0,0,0.1)]">
                                    <h4 className="font-semibold text-sm tracking-wide mb-3">BRANDS</h4>
                                    <div className="space-y-2">
                                        {brands.map((brand) => (
                                            <label
                                                key={brand}
                                                className="flex items-center gap-2 text-sm cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedBrands.includes(brand)}
                                                    onChange={() => toggleBrand(brand)}
                                                    className="accent-primary"
                                                />
                                                {brand}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Product flag */}
                            {/*<div>*/}
                            {/*    <h4 className="font-semibold text-sm tracking-wide mb-3">PRODUCT FLAG</h4>*/}
                            {/*    <label className="flex items-center gap-2 text-sm cursor-pointer">*/}
                            {/*        <input*/}
                            {/*            type="checkbox"*/}
                            {/*            checked={newArrivalOnly}*/}
                            {/*            onChange={(e) => setNewArrivalOnly(e.target.checked)}*/}
                            {/*            className="accent-primary"*/}
                            {/*        />*/}
                            {/*        New Arrival*/}
                            {/*    </label>*/}
                            {/*</div>*/}
                        </aside>

                        {/* Main content */}
                        <div>
                            <div  className=" flex items-center justify-between  mb-[10px] rounded-[4px] bg-white p-3 shadow-[0_1px_1px_rgba(0,0,0,0.1)]">
                                <p className="text-sm text-muted-foreground">
                                    Sort By :
                                </p>
                                <div className="relative">
                                    <button
                                        onClick={() => setSortOpen((v) => !v)}
                                        className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg bg-white text-sm font-medium min-w-[180px] justify-between"
                                    >
                                        {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                                        {sortOpen ? (
                                            <ChevronUp className="w-4 h-4" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4" />
                                        )}
                                    </button>
                                    {sortOpen && (
                                        <div className="absolute right-0 mt-1 w-full bg-white border border-border rounded-lg shadow-lg z-20 overflow-hidden">
                                            {SORT_OPTIONS.map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => {
                                                        setSortBy(opt.value)
                                                        setSortOpen(false)
                                                    }}
                                                    className={`block w-full text-left px-4 py-2 text-sm ${
                                                        sortBy === opt.value
                                                            ? 'bg-primary text-white'
                                                            : 'hover:bg-muted text-foreground'
                                                    }`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground">Loading products...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground">{error}</p>
                                </div>
                            ) : filteredProducts.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground">No products found</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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

                                    {/* Pagination */}
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
                                            Showing {rangeStart} - {rangeEnd} of {filteredProducts.length} results
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
            <FloatingCart />
        </>
    )
}