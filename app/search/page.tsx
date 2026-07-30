'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { FloatingCart } from '@/components/floating-cart'
import { SearchBar } from '@/components/search-bar'
import { searchProducts, type UiProduct } from '@/lib/products'

function SearchResults() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const query = searchParams.get('search') ?? ''

    const [results, setResults] = useState<UiProduct[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default')

    useEffect(() => {
        if (!query.trim()) {
            setResults([])
            setIsLoading(false)
            return
        }

        setIsLoading(true)
        setError(null)

        searchProducts(query)
            .then((data) => setResults(data))
            .catch((err) => {
                console.error('[SearchPage] search failed:', err)
                setError('Unable to load search results right now.')
            })
            .finally(() => setIsLoading(false))
    }, [query])

    const sortedResults = [...results].sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price
        if (sortBy === 'price-desc') return b.price - a.price
        return 0
    })

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
                        <span className="text-muted-foreground"> / Search</span>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                    {/* Search header */}
                    <div className="mb-6">
                        <h1 className="text-xl font-semibold text-foreground mb-4">
                            {query ? (
                                <>
                                    Search results for <span className="text-primary">&quot;{query}&quot;</span>
                                </>
                            ) : (
                                'Search'
                            )}
                        </h1>

                        {/* Re-searchable search bar at the top of results */}


                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <p className="text-sm text-muted-foreground">
                                {isLoading ? 'Searching...' : `${sortedResults.length} products found`}
                            </p>

                            {sortedResults.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <label htmlFor="sort-by" className="text-sm font-medium text-foreground whitespace-nowrap">
                                        Sort By :
                                    </label>
                                    <select
                                        id="sort-by"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                                        className="px-3 py-2 border border-border rounded bg-white text-sm"
                                    >
                                        <option value="default">Default Sorting</option>
                                        <option value="price-asc">Price Low to High</option>
                                        <option value="price-desc">Price High to Low</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Results */}
                    {!query.trim() ? (
                        <div className="text-center py-16">
                            <p className="text-muted-foreground">Type something above to search our products.</p>
                        </div>
                    ) : isLoading ? (
                        <div className="text-center py-16">
                            <p className="text-muted-foreground">Searching products...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-16">
                            <p className="text-muted-foreground">{error}</p>
                        </div>
                    ) : sortedResults.length === 0 ? (
                        <div className="text-center py-16 space-y-3">
                            <p className="text-muted-foreground">
                                No products found for &quot;{query}&quot;.
                            </p>
                            <button
                                onClick={() => router.push('/products')}
                                className="px-5 py-2.5 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-all font-semibold text-sm"
                            >
                                Browse All Products
                            </button>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {sortedResults.map((product) => (
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
            </main>
            <Footer />
            <FloatingCart />
        </>
    )
}

export default function SearchPage() {
    return (
        <Suspense fallback={null}>
            <SearchResults />
        </Suspense>
    )
}