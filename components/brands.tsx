'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Brand {
    id: number
    name: string
    slug?: string
    image: string
    status: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL

export function BrandSlider() {
    const [brands, setBrands] = useState<Brand[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeDot, setActiveDot] = useState(0)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!API_BASE_URL) {
            console.error('[BrandSlider] NEXT_PUBLIC_API_BASE_URL is not set')
            setError('API base URL is not configured')
            setLoading(false)
            return
        }

        const url = `${API_BASE_URL}/brands`
        console.log('[BrandSlider] Fetching:', url)

        fetch(url)
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`)
                }
                return res.json()
            })
            .then((data) => {
                console.log('[BrandSlider] Raw response:', data)
                if (data.success && Array.isArray(data.data)) {
                    const active = data.data.filter((brand: Brand) => brand.status === 'Active')

                    setBrands(active)
                    if (active.length === 0 && data.data.length > 0) {
                        console.warn(
                            '[BrandSlider] Brands exist but none have status === "Active". Sample status value:',
                            data.data[0]?.status
                        )
                    }
                } else {
                    console.warn('[BrandSlider] Unexpected response shape:', data)
                    setError('Unexpected API response shape')
                }
            })
            .catch((err) => {
                console.error('[BrandSlider] Failed to fetch brands:', err)
                setError(err.message || 'Failed to fetch brands')
            })
            .finally(() => setLoading(false))
    }, [])

    // Track which "page" of the scroll container is visible, to drive the dots
    const handleScroll = () => {
        if (!scrollRef.current) return
        const { scrollLeft, clientWidth, scrollWidth } = scrollRef.current
        const totalDots = Math.max(1, Math.ceil(scrollWidth / clientWidth))
        const dot = Math.round(scrollLeft / clientWidth)
        setActiveDot(Math.min(dot, totalDots - 1))
    }

    const scrollToDot = (index: number) => {
        if (!scrollRef.current) return
        scrollRef.current.scrollTo({
            left: index * scrollRef.current.clientWidth,
            behavior: 'smooth',
        })
    }

    function buildImageUrl(path: string) {
        if (!IMAGE_BASE_URL) return path
        const base = IMAGE_BASE_URL.replace(/\/+$/, '')
        const cleanPath = path.replace(/^\/+/, '')
        return `${base}/${cleanPath}`
    }

    if (loading) {
        return (
            <section className="py-12 md:py-16 px-4 md:px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="h-6 w-40 bg-muted rounded animate-pulse mb-8" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    if (error) {
        if (process.env.NODE_ENV === 'development') {
            return (
                <section className="py-8 px-4 md:px-6">
                    <div className="max-w-7xl mx-auto p-4 border border-red-300 bg-red-50 rounded-lg text-red-700 text-sm">
                        <strong>BrandSlider error:</strong> {error}. Check the browser console for details.
                    </div>
                </section>
            )
        }
        return null
    }

    if (brands.length === 0) {
        if (process.env.NODE_ENV === 'development') {
            return (
                <section className="py-8 px-4 md:px-6">
                    <div className="max-w-7xl mx-auto p-4 border border-yellow-300 bg-yellow-50 rounded-lg text-yellow-700 text-sm">
                        <strong>BrandSlider:</strong> API returned no active brands. Check the console log for the
                        raw response and confirm the <code>status</code> field value matches "Active" exactly.
                    </div>
                </section>
            )
        }
        return null
    }

    const dotCount = Math.max(1, Math.ceil(brands.length / 4))

    return (
        <section className="py-8 md:py-10 px-4 md:px-6 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-foreground">Our Brands</h2>
                        <div className="w-8 h-1 bg-primary mt-1" />
                    </div>
                    <Link
                        href="/brand"
                        className="text-sm font-medium text-foreground hover:text-primary flex items-center gap-1"
                    >
                        SEE ALL <span aria-hidden>→</span>
                    </Link>
                </div>

                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                    {brands.map((brand) => (
                        <Link
                            key={brand.id}
                            href={`/brand/${brand.slug ?? brand.id}`}
                            className="snap-start flex-shrink-0 w-[45%] md:w-[23%] h-24 border border-border rounded-lg flex items-center justify-center p-4 hover:shadow-md transition-shadow bg-white"
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

                {dotCount > 1 && (
                    <div className="flex justify-center gap-1.5 mt-4">
                        {Array.from({ length: dotCount }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => scrollToDot(i)}
                                aria-label={`Go to slide ${i + 1}`}
                                className={`h-1.5 rounded-full transition-all ${
                                    activeDot === i ? 'w-5 bg-primary' : 'w-1.5 bg-border'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}