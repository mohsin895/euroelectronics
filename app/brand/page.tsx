'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { FloatingCart } from '@/components/floating-cart'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Brand {
    id: number
    name: string
    slug: string
    image: string
    status: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL

function buildImageUrl(path: string) {
    if (!IMAGE_BASE_URL) return path
    const base = IMAGE_BASE_URL.replace(/\/+$/, '')
    const cleanPath = path.replace(/^\/+/, '')
    return `${base}/${cleanPath}`
}

export default function BrandsPage() {
    const [brands, setBrands] = useState<Brand[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!API_BASE_URL) {
            setError('API base URL is not configured')
            setIsLoading(false)
            return
        }

        fetch(`${API_BASE_URL}/brands`)
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                return res.json()
            })
            .then((data) => {
                if (data.success && Array.isArray(data.data)) {
                    setBrands(data.data.filter((b: Brand) => b.status === 'Active'))
                } else {
                    setError('Unexpected API response shape')
                }
            })
            .catch((err) => {
                console.error('[BrandsPage] Failed to fetch brands:', err)
                setError('Unable to load brands right now.')
            })
            .finally(() => setIsLoading(false))
    }, [])

    return (
        <>
            <Header />
            <main className="min-h-screen bg-background">
                {/* Hero banner */}
                <div className="relative w-full h-[280px] md:h-[340px] overflow-hidden">
                    <Image
                        src="/brands-hero.jpg"
                        alt="Our brands"
                        fill
                        priority
                        className="object-cover"
                    />
                </div>

                <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
                    {/* Title + description */}
                    <div className="text-center mb-12">
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                            Brand Title
                        </h1>
                        <div className="w-16 h-1 bg-primary mx-auto mb-6" />
                        <p className="text-muted-foreground leading-relaxed max-w-4xl mx-auto">
                            We believe that good food does more than satisfy hunger—it creates moments,
                            builds trust, and brings families closer. Every brand under our name is crafted
                            with care, integrity, and a deep commitment to quality. From carefully sourcing
                            ingredients to thoughtful packaging, we ensure that every product meets the
                            standards we would choose for our own families. With us, every meal becomes a
                            promise of taste, safety, and trust—shared from our heart to your table.
                        </p>
                    </div>

                    {/* Popular brands grid */}
                    <div className="text-center mb-8">
                        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                            Popular Brands
                        </h2>
                        <div className="w-16 h-1 bg-primary mx-auto" />
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
                            ))}
                        </div>
                    ) : error ? (
                        <p className="text-center text-muted-foreground py-12">{error}</p>
                    ) : brands.length === 0 ? (
                        <p className="text-center text-muted-foreground py-12">No brands found</p>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {brands.map((brand) => (
                                <Link
                                    key={brand.id}
                                    href={`/brand/${brand.slug}`}
                                    className="h-24 border border-border rounded-lg flex items-center justify-center p-4 hover:shadow-md transition-shadow bg-white"
                                >
                                    {brand.image ? (
                                        <Image
                                            src={buildImageUrl(brand.image)}
                                            alt={brand.name}
                                            width={140}
                                            height={60}
                                            className="object-contain max-h-full"
                                            unoptimized
                                        />
                                    ) : (
                                        <span className="text-sm font-semibold text-foreground text-center">
                                            {brand.name}
                                        </span>
                                    )}
                                </Link>
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