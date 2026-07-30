'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, ShoppingBag } from 'lucide-react'
import { fetchTopSellingProducts, type UiProduct } from '@/lib/products'
import { useCart } from '@/lib/cart-context'

function formatTaka(amount: number) {
    return `৳${amount.toLocaleString('en-US')}`
}

function TopSellingCard({ product }: { product: UiProduct }) {
    const [isAdding, setIsAdding] = useState(false)
    const [isBuying, setIsBuying] = useState(false)
    const { addItem } = useCart()
    const router = useRouter()

    const hasDiscount = product.originalPrice > product.price
    const savedAmount = hasDiscount ? product.originalPrice - product.price : 0

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        setIsAdding(true)
        try {
            addItem({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                image: product.image,
                stock: 100,
            })
        } finally {
            setIsAdding(false)
        }
    }

    const handleBuyNow = (e: React.MouseEvent) => {
        e.preventDefault()
        setIsBuying(true)
        try {
            addItem({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                image: product.image,
                stock: 100,
            })
            router.push('/checkout')
        } finally {
            setIsBuying(false)
        }
    }

    return (
        <div className="relative bg-white rounded-lg border border-border p-5 md:p-5 flex flex-col md:flex-row gap-5">
            {product.badge && (
                <span className="absolute -top-0 right-4 -translate-y-1/2 bg-red-600 text-white text-xs font-medium px-3 py-1.5 rounded-md flex items-center gap-1">
                    🏷 {product.badge === 'Sale' ? 'Best Selling' : product.badge}
                </span>
            )}

            <Link href={`/product/${product.slug}`} className="shrink-0">
                <div className="relative w-[250px] h-[300px] md:w-[250px] md:h-[300px]">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill

                    />
                </div>
            </Link>

            <div className="flex flex-col justify-center gap-2 flex-1">
                <Link href={`/product/${product.slug}`}>
                    <h3 className="text-base font-medium text-foreground hover:text-orange-600 transition-colors">
                        {product.name}
                    </h3>
                </Link>

                <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-orange-600">
                        {formatTaka(product.price)}
                    </span>
                    {hasDiscount && (
                        <span className="text-sm text-muted-foreground line-through">
                            {formatTaka(product.originalPrice)}
                        </span>
                    )}
                </div>

                {hasDiscount && (
                    <span className="inline-block w-fit bg-lime-200 text-lime-900 text-xs font-medium px-2 py-0.5 rounded-md">
                        Save {formatTaka(savedAmount)}
                    </span>
                )}

                <div className="flex items-center gap-3 mt-1">
                    <button
                        onClick={handleAddToCart}
                        disabled={isAdding}
                        className="flex items-center gap-1.5 border border-orange-500 text-orange-600 text-sm font-medium px-3 py-1.5 rounded-md hover:bg-orange-50 disabled:opacity-50 transition-colors"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        {isAdding ? 'Adding...' : 'Add To Cart'}
                    </button>
                    <button
                        onClick={handleBuyNow}
                        disabled={isBuying}
                        className="flex items-center gap-1.5 bg-orange-500 text-white text-sm font-medium px-3 py-1.5 rounded-md hover:bg-orange-600 disabled:opacity-50 transition-colors"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        {isBuying ? 'Redirecting...' : 'Buy now'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function BestSellingProduct() {
    const [products, setProducts] = useState<UiProduct[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchTopSellingProducts(4)
            .then(setProducts)
            .catch((err) => {
                console.error('[BestSellingProduct] Failed to fetch products:', err)
                setError('Unable to load products right now.')
            })
            .finally(() => setIsLoading(false))
    }, [])

    return (
        <section className="py-12 md:py-16 px-4 md:px-6 bg-[#f7f4ee]">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-center items-center mb-8">
                    <h2 className=" text-xl md:text-3xl font-bold text-foreground">Top Selling Products</h2>
                </div>

                {isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-40 bg-muted rounded-lg animate-pulse" />
                        ))}
                    </div>
                )}

                {!isLoading && error && (
                    <p className="text-sm text-muted-foreground text-center">{error}</p>
                )}

                {!isLoading && !error && products.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center">No products available yet.</p>
                )}

                {!isLoading && !error && products.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {products.map((product) => (
                            <TopSellingCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}