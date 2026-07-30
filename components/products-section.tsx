'use client'

import { ProductCard } from '@/components/product-card'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { fetchProducts, type UiProduct } from '@/lib/products'

export default function ProductSection() {
    const [products, setProducts] = useState<UiProduct[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchProducts({ limit: 6 })
            .then(setProducts)
            .catch((err) => {
                console.error('[ProductSection] Failed to fetch products:', err)
                setError('Unable to load products right now.')
            })
            .finally(() => setIsLoading(false))
    }, [])

    return (
        <section className="py-12 md:py-16 px-4 md:px-6 bg-background">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-foreground">Just For You</h2>
                        <div className="w-12 h-1 bg-primary mt-2"></div>
                    </div>
                    <Link
                        href="/shop"
                        className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
                    >
                        View All <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-80 bg-muted rounded-lg animate-pulse" />
                        ))}
                    </div>
                )}

                {!isLoading && error && (
                    <p className="text-sm text-muted-foreground">{error}</p>
                )}

                {!isLoading && !error && products.length === 0 && (
                    <p className="text-sm text-muted-foreground">No products available yet.</p>
                )}

                {!isLoading && !error && products.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {products.slice(0, 5).map((product) => (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                slug={product.slug}
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
        </section>
    )
}