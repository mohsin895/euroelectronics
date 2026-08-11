"use client"

import { useState, useMemo } from "react"
import { SlidersHorizontal, X, ChevronDown, ChevronUp, ChevronRight, List } from "lucide-react"
import { ProductCard, type ApiProduct } from "@/components/product-card"
import type { ApiCategory } from "@/app/page"

interface Props {
    categories: ApiCategory[]
    products: ApiProduct[]
    categoryName?: string
}

function parsePrice(str: string): number {
    return parseFloat(str.replace(/[^\d.]/g, "")) || 0
}

export function SubCategoryProduct({ categories, products, categoryName }: Props) {
    // ── filter/sort state ──────────────────────────────────────────────────
    const allPrices = products.map(p => parsePrice(p.main_price))
    const globalMin = Math.floor(Math.min(...allPrices, 0))
    const globalMax = Math.ceil(Math.max(...allPrices, 0))

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [priceMin, setPriceMin] = useState(globalMin)
    const [priceMax, setPriceMax] = useState(globalMax)
    const [sort, setSort] = useState("latest")
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [catExpanded, setCatExpanded] = useState(true)
    const [priceExpanded, setPriceExpanded] = useState(true)

    // ── derived list ───────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        let list = [...products]

        if (selectedCategory) {
            list = list.filter(p => p.tag === selectedCategory)
        }

        list = list.filter(p => {
            const price = parsePrice(p.main_price)
            return price >= priceMin && price <= priceMax
        })

        switch (sort) {
            case "price_asc":  list.sort((a, b) => parsePrice(a.main_price) - parsePrice(b.main_price)); break
            case "price_desc": list.sort((a, b) => parsePrice(b.main_price) - parsePrice(a.main_price)); break
            case "discount":   list.sort((a, b) => b.discount - a.discount); break
            case "rating":     list.sort((a, b) => b.rating - a.rating); break
            default: break
        }

        return list
    }, [products, selectedCategory, priceMin, priceMax, sort])

    // ── helpers for the dual price slider ─────────────────────────────────
    const range = Math.max(globalMax - globalMin, 1)
    const minPct = ((priceMin - globalMin) / range) * 100
    const maxPct = ((priceMax - globalMin) / range) * 100

    const sortLabels: Record<string, string> = {
        latest: "Latest",
        price_asc: "Price: low to high",
        price_desc: "Price: high to low",
        discount: "Most discounted",
        rating: "Top rated",
    }


    return (
        <main className="mx-auto max-w-7xl px-4 py-6">

            {/* ── Breadcrumb + top controls ── */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
                <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <a href="/" className="hover:text-foreground transition-colors">Home</a>
                    <span className="opacity-40">/</span>
                    <a href="/products" className="hover:text-foreground transition-colors">Products</a>
                    {categoryName && (
                        <>
                            <span className="opacity-40">/</span>
                            <span className="font-medium text-foreground">{categoryName}</span>
                        </>
                    )}
                </nav>

                <div className="flex items-center gap-2.5">
                    {/* Mobile sidebar toggle */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="flex h-9 items-center gap-2 rounded-full border border-border bg-card px-3 text-sm text-foreground lg:hidden"
                    >
                        <SlidersHorizontal className="h-4 w-4" /> Filters
                    </button>

                    <span className="hidden rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground sm:inline">
                        {filtered.length} of {products.length} products
                    </span>

                    <div className="relative">
                        <select
                            value={sort}
                            onChange={e => setSort(e.target.value)}
                            className="h-9 appearance-none rounded-full border border-border bg-card pl-3 pr-8 text-sm text-foreground outline-none focus:border-foreground"
                        >
                            {Object.entries(sortLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                    Product: {label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                </div>
            </div>

            {/* ── Body: sidebar + grid ── */}
            <div className="flex gap-6">

                {/* Desktop sidebar */}




                {/* Product grid */}
                <div className="min-w-0 flex-1">
                    {filtered.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {filtered.map(p => (
                                <ProductCard key={p.id} product={p} showAddToCart />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card py-24 text-center">
                            <div className="text-6xl">📦</div>
                            <div>
                                <p className="text-lg font-bold">No products found</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    This category doesn't have any products yet.
                                </p>
                            </div>

                           <a href="/"
                            className="rounded-full border border-border px-6 py-2 text-sm font-medium hover:bg-accent transition-colors"
                            >
                            Back to Home
                        </a>
                        </div>
                        )}
                </div>
            </div>

        </main>
    )
}