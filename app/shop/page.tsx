'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { FloatingCart } from '@/components/floating-cart'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Filter } from 'lucide-react'
import { fetchProducts, fetchTopSellingProducts, type UiProduct } from '@/lib/products'

type SortOption = 'default' | 'best-selling' | 'latest' | 'price-asc' | 'price-desc'

export default function ProductsPage() {
    const [products, setProducts] = useState<UiProduct[]>([])
    const [filteredProducts, setFilteredProducts] = useState<UiProduct[]>([])
    const [categories, setCategories] = useState<string[]>([])
    const [brands, setBrands] = useState<string[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string>('')
    const [selectedBrand, setSelectedBrand] = useState<string>('')
    const [sortBy, setSortBy] = useState<SortOption>('default')
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [minPrice, setMinPrice] = useState<string>('')
    const [maxPrice, setMaxPrice] = useState<string>('')
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Only fetched when "Best Selling" is chosen, since it needs a
    // separate endpoint that returns products in sold-count order.
    const [bestSellingOrder, setBestSellingOrder] = useState<number[]>([])

    useEffect(() => {
        fetchProducts({ limit: 200 })
            .then((data) => {
                setProducts(data)
                setFilteredProducts(data)

                const uniqueCategories = [
                    ...new Set(data.map((p) => p.category).filter((c): c is string => Boolean(c))),
                ]
                setCategories(uniqueCategories)

                const uniqueBrands = [
                    ...new Set(data.map((p) => p.brand).filter((b): b is string => Boolean(b))),
                ]
                setBrands(uniqueBrands)
            })
            .catch((err) => {
                console.error('[ProductsPage] Failed to fetch products:', err)
                setError('Unable to load products right now.')
            })
            .finally(() => setIsLoading(false))
    }, [])

    // Lazily load best-selling order the first time it's selected
    useEffect(() => {
        if (sortBy === 'best-selling' && bestSellingOrder.length === 0) {
            fetchTopSellingProducts()
                .then((data) => setBestSellingOrder(data.map((p) => p.id)))
                .catch((err) => console.error('[ProductsPage] Failed to fetch best sellers:', err))
        }
    }, [sortBy, bestSellingOrder.length])

    useEffect(() => {
        let filtered = [...products]

        if (selectedCategory) {
            filtered = filtered.filter((p) => p.category === selectedCategory)
        }

        if (selectedBrand) {
            filtered = filtered.filter((p) => p.brand === selectedBrand)
        }

        const min = minPrice ? Number(minPrice) : null
        const max = maxPrice ? Number(maxPrice) : null
        if (min !== null) filtered = filtered.filter((p) => p.price >= min)
        if (max !== null) filtered = filtered.filter((p) => p.price <= max)

        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            filtered = filtered.filter(
                (p) => p.name.toLowerCase().includes(q) || (p.category?.toLowerCase().includes(q) ?? false)
            )
        }

        switch (sortBy) {
            case 'price-asc':
                filtered.sort((a, b) => a.price - b.price)
                break
            case 'price-desc':
                filtered.sort((a, b) => b.price - a.price)
                break
            case 'latest':
                // No created_at field on the product yet — id is used as a
                // stand-in proxy for "newest first" (higher id = added later).
                filtered.sort((a, b) => b.id - a.id)
                break
            case 'best-selling':
                if (bestSellingOrder.length > 0) {
                    const rank = new Map(bestSellingOrder.map((id, idx) => [id, idx]))
                    filtered.sort((a, b) => {
                        const ra = rank.has(a.id) ? rank.get(a.id)! : Infinity
                        const rb = rank.has(b.id) ? rank.get(b.id)! : Infinity
                        return ra - rb
                    })
                }
                break
            case 'default':
            default:
                // Keep the API's original order
                break
        }

        setFilteredProducts(filtered)
    }, [selectedCategory, selectedBrand, sortBy, searchQuery, minPrice, maxPrice, products, bestSellingOrder])

    return (
        <>
            <Header />
            <main className="min-h-screen">
                {/* Breadcrumb */}
                <div className="px-4 md:px-6 py-4 bg-white border-b border-border">
                    <div className="max-w-7xl mx-auto">
                        <Link href="/" className="text-muted-foreground hover:text-primary">
                            Home
                        </Link>
                        <span className="text-muted-foreground"> / Products</span>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                    <div className="grid md:grid-cols-[250px_1fr] gap-8">
                        {/* Sidebar Filters */}
                        <aside className="space-y-6 rounded-[4px] bg-white p-3 shadow-[0_1px_1px_rgba(0,0,0,0.1)]">
                            <div>
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Filter className="w-5 h-5" />
                                    Filters
                                </h3>
                            </div>

                            {/* Category filter */}
                            <div>
                                <h4 className="font-semibold text-foreground mb-3">Categories</h4>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setSelectedCategory('')}
                                        className={`block w-full text-left px-3 py-2 rounded hover:bg-muted transition-colors ${
                                            selectedCategory === '' ? 'bg-primary text-white' : 'text-foreground'
                                        }`}
                                    >
                                        All Categories
                                    </button>
                                    {categories.map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => setSelectedCategory(category)}
                                            className={`block w-full text-left px-3 py-2 rounded hover:bg-muted transition-colors ${
                                                selectedCategory === category ? 'bg-primary text-white' : 'text-foreground'
                                            }`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Brand filter */}
                            {brands.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-foreground mb-3">Brands</h4>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => setSelectedBrand('')}
                                            className={`block w-full text-left px-3 py-2 rounded hover:bg-muted transition-colors ${
                                                selectedBrand === '' ? 'bg-primary text-white' : 'text-foreground'
                                            }`}
                                        >
                                            All Brands
                                        </button>
                                        {brands.map((brand) => (
                                            <button
                                                key={brand}
                                                onClick={() => setSelectedBrand(brand)}
                                                className={`block w-full text-left px-3 py-2 rounded hover:bg-muted transition-colors ${
                                                    selectedBrand === brand ? 'bg-primary text-white' : 'text-foreground'
                                                }`}
                                            >
                                                {brand}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Price filter */}
                            <div>
                                <h4 className="font-semibold text-foreground mb-3">Price Range (৳)</h4>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min={0}
                                        placeholder="Min"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        className="w-full px-3 py-2 border border-border rounded bg-white text-sm"
                                    />
                                    <span className="text-muted-foreground">-</span>
                                    <input
                                        type="number"
                                        min={0}
                                        placeholder="Max"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        className="w-full px-3 py-2 border border-border rounded bg-white text-sm"
                                    />
                                </div>
                            </div>
                        </aside>

                        {/* Main Content */}
                        <div>
                            <div className="mb-6">
                                <div className="flex flex-wrap items-center gap-4 mb-4">
                                    <div className="flex-1 relative min-w-[200px]">
                                        <input
                                            type="text"
                                            placeholder="Search products..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full px-4 py-2 border border-border rounded-lg"
                                        />
                                    </div>

                                    {/* Sort By dropdown, matching the requested design */}
                                    <div className="flex items-center gap-2">
                                        <label htmlFor="sort-by" className="text-sm font-medium text-foreground whitespace-nowrap">
                                            Sort By :
                                        </label>
                                        <select
                                            id="sort-by"
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                                            className="px-3 py-2 border border-border rounded bg-white text-sm min-w-[180px]"
                                        >
                                            <option value="default">Default Sorting</option>
                                            <option value="best-selling">Best Selling</option>
                                            <option value="latest">Sort by Latest</option>
                                            <option value="price-asc">Price Low to High</option>
                                            <option value="price-desc">Price High to Low</option>
                                        </select>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Showing {filteredProducts.length} products
                                </p>
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
                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {filteredProducts.map((product) => (
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