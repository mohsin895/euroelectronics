"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { SlidersHorizontal, X, ChevronDown, ChevronUp, ChevronRight, List } from "lucide-react"
import { ProductCard, type ApiProduct } from "@/components/product-card"
import type { Brand } from "@/app/page"

interface Props {
    brands: Brand[]
    products: ApiProduct[]
    categoryName?: string
}

function parsePrice(str: string): number {
    return parseFloat(str.replace(/[^\d.]/g, "")) || 0
}

export function BrandProduct({ brands, products, categoryName }: Props) {
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

    // ── sidebar panel (shared between desktop + mobile) ───────────────────
    const SidebarContent = (
        <div className="flex flex-col gap-4">

            {/* ── Categories ── */}
            {brands.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-border bg-card">
                    <button
                        onClick={() => setCatExpanded(v => !v)}
                        className="flex w-full items-center justify-between gap-2 bg-foreground px-4 py-3 text-sm font-semibold text-background"
                    >
                        <span className="flex items-center gap-2">
                            <List className="h-4 w-4" />
                            Brands
                        </span>
                        {catExpanded
                            ? <ChevronUp className="h-4 w-4 opacity-70" />
                            : <ChevronDown className="h-4 w-4 opacity-70" />
                        }
                    </button>

                    {catExpanded && (
                        <ul className="max-h-[336px] overflow-y-auto p-2 [scrollbar-width:thin]">
                            {brands.map(cat => (
                                <li key={cat.id}>
                                    <Link
                                        href={`/brand/${cat.slug}`}
                                        className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors
                                            ${selectedCategory === cat.name
                                            ? "bg-secondary font-medium text-foreground"
                                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                        }`}
                                    >
                                        {cat.name}
                                        <ChevronRight className="h-4 w-4 opacity-40 transition-transform group-hover:translate-x-0.5" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* ── Price filter ── */}
            <div className="rounded-xl border border-border bg-card p-4">
                <button
                    onClick={() => setPriceExpanded(v => !v)}
                    className="flex w-full items-center justify-between text-sm font-semibold text-foreground"
                >
                    Filter by Price
                    {priceExpanded
                        ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    }
                </button>

                {priceExpanded && (
                    <div className="mt-4 space-y-4">

                        {/* Dual-handle slider */}
                        <div className="relative h-1.5 w-full">
                            <div className="absolute inset-0 rounded-full bg-secondary" />
                            <div
                                className="absolute h-1.5 rounded-full bg-foreground"
                                style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
                            />
                            <input
                                type="range"
                                min={globalMin}
                                max={globalMax}
                                step={10}
                                value={priceMin}
                                onChange={e => setPriceMin(Math.min(Number(e.target.value), priceMax - 10))}
                                className="absolute inset-0 top-1/2 h-1.5 w-full -translate-y-1/2 cursor-pointer appearance-none bg-transparent
                                    [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
                                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full
                                    [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background
                                    [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:shadow
                                    [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4
                                    [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2
                                    [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:bg-foreground"
                            />
                            <input
                                type="range"
                                min={globalMin}
                                max={globalMax}
                                step={10}
                                value={priceMax}
                                onChange={e => setPriceMax(Math.max(Number(e.target.value), priceMin + 10))}
                                className="absolute inset-0 top-1/2 h-1.5 w-full -translate-y-1/2 cursor-pointer appearance-none bg-transparent
                                    [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
                                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full
                                    [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background
                                    [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:shadow
                                    [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4
                                    [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2
                                    [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:bg-foreground"
                            />
                        </div>

                        {/* Min / Max numeric inputs */}
                        <div className="flex items-center gap-2 text-sm">
                            <div className="flex h-10 flex-1 items-center rounded-md border border-border bg-card px-2.5 text-foreground">
                                <span className="mr-1 text-xs text-muted-foreground">৳</span>
                                <input
                                    type="number"
                                    value={priceMin}
                                    min={globalMin}
                                    max={priceMax - 10}
                                    onChange={e => setPriceMin(Number(e.target.value))}
                                    className="w-full bg-transparent text-sm outline-none"
                                />
                            </div>
                            <span className="text-muted-foreground">–</span>
                            <div className="flex h-10 flex-1 items-center rounded-md border border-border bg-card px-2.5 text-foreground">
                                <span className="mr-1 text-xs text-muted-foreground">৳</span>
                                <input
                                    type="number"
                                    value={priceMax}
                                    min={priceMin + 10}
                                    max={globalMax}
                                    onChange={e => setPriceMax(Number(e.target.value))}
                                    className="w-full bg-transparent text-sm outline-none"
                                />
                            </div>
                        </div>

                        <button
                            onClick={() => { setPriceMin(globalMin); setPriceMax(globalMax) }}
                            className="w-full rounded-md bg-foreground py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}
            </div>

        </div>
    )

    return (
        <main className="mx-auto max-w-7xl px-4 py-6">

            {/* ── Breadcrumb + top controls ── */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
                <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <a href="/" className="hover:text-foreground transition-colors">Home</a>
                    <span className="opacity-40">/</span>
                    <a href="/shop" className="hover:text-foreground transition-colors">Products</a>
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
                <aside className="hidden w-64 shrink-0 lg:block">
                    <div className="sticky top-4">
                        {SidebarContent}
                    </div>
                </aside>

                {/* Mobile sidebar drawer */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div
                            className="absolute inset-0 bg-black/40"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <aside className="absolute left-0 top-0 h-full w-72 overflow-y-auto bg-background p-5 shadow-xl">
                            <div className="mb-4 flex items-center justify-between">
                                <span className="text-sm font-semibold text-foreground">Filters</span>
                                <button onClick={() => setSidebarOpen(false)}>
                                    <X className="h-5 w-5 text-muted-foreground" />
                                </button>
                            </div>
                            {SidebarContent}
                        </aside>
                    </div>
                )}

                {/* Product grid */}
                <div className="min-w-0 flex-1">
                    {filtered.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {filtered.map(p => (
                                <ProductCard key={p.id} product={p} showAddToCart />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
                            <div className="text-5xl">🔍</div>
                            <p className="text-muted-foreground">No products match your filters.</p>
                            <button
                                onClick={() => { setSelectedCategory(null); setPriceMin(globalMin); setPriceMax(globalMax) }}
                                className="rounded-md border border-border px-4 py-2 text-sm text-foreground hover:bg-secondary"
                            >
                                Clear filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

        </main>
    )
}