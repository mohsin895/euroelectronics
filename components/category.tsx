'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Category {
    id: number
    name: string
    slug?: string
    image: string
    status: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL

export function CategorySlider() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!API_BASE_URL) {
            console.error('[CategorySlider] NEXT_PUBLIC_API_BASE_URL is not set')
            setError('API base URL is not configured')
            setLoading(false)
            return
        }

        const url = `${API_BASE_URL}/category`


        fetch(url)
            .then((res) => {

                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`)
                }
                return res.json()
            })
            .then((data) => {

                if (data.success && Array.isArray(data.data)) {
                    const active = data.data.filter(
                        (category: Category) => category.status === 'Active'
                    )

                    setCategories(active)
                    if (active.length === 0 && data.data.length > 0) {
                        console.warn(
                            '[CategorySlider] Categories exist but none have status === "active". Sample status value:',
                            data.data[0]?.status
                        )
                    }
                } else {
                    console.warn('[CategorySlider] Unexpected response shape:', data)
                    setError('Unexpected API response shape')
                }
            })
            .catch((err) => {
                console.error('[CategorySlider] Failed to fetch categories:', err)
                setError(err.message || 'Failed to fetch categories')
            })
            .finally(() => setLoading(false))
    }, [])

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return
        const { current } = scrollRef
        const scrollAmount = current.clientWidth * 0.8
        current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        })
    }

    if (loading) {
        return (
            <section className="py-12 md:py-16 px-4 md:px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="h-8 w-64 bg-muted rounded animate-pulse mb-8" />
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    // Visible (dev-only) error banner instead of silently returning null,
    // so misconfiguration is obvious instead of looking like "nothing happened"
    if (error) {
        if (process.env.NODE_ENV === 'development') {
            return (
                <section className="py-8 px-4 md:px-6">
                    <div className="max-w-7xl mx-auto p-4 border border-red-300 bg-red-50 rounded-lg text-red-700 text-sm">
                        <strong>CategorySlider error:</strong> {error}. Check the browser console for details.
                    </div>
                </section>
            )
        }
        return null
    }

    if (categories.length === 0) {
        if (process.env.NODE_ENV === 'development') {
            return (
                <section className="py-8 px-4 md:px-6">
                    <div className="max-w-7xl mx-auto p-4 border border-yellow-300 bg-yellow-50 rounded-lg text-yellow-700 text-sm">
                        <strong>CategorySlider:</strong> API returned no active categories. Check the console log
                        for the raw response and confirm the <code>status</code> field value matches "active" exactly.
                    </div>
                </section>
            )
        }
        return null
    }

    return (
        <section id="featured-categories" className="py-12 md:py-16 px-4 md:px-6 bg-white">
            <div className="max-w-7xl mx-auto">
                <h2 className=" text-xl md:text-3xl font-bold mb-2 text-foreground">Featured Categories</h2>
                <div className="w-12 h-1 bg-primary mb-8"></div>

                <div className="relative">
                    {categories.length > 6 && (
                        <button
                            onClick={() => scroll('left')}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-2 bg-white border border-border rounded-full shadow-md hover:bg-muted transition-colors"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft className="w-5 h-5 text-foreground" />
                        </button>
                    )}

                    <div
                        ref={scrollRef}
                        className="flex gap-4 overflow-x-auto scroll-smooth pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                    >
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/category/${category.slug ?? category.id}`}
                                className="group flex flex-col items-center flex-shrink-0 w-[140px] md:w-[160px] shrink-0"
                            >
                                <div className="relative w-[140px] aspect-square h-[140px] bg-muted rounded-lg overflow-hidden mb-3 group-hover:shadow-lg transition-shadow">
                                    {category.image ? (
                                        <Image
                                            src={`${IMAGE_BASE_URL}/${category.image}`}
                                            alt={category.name}
                                            width={160}
                                            height={160}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl">
                                            🛍️
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm font-medium text-center text-foreground group-hover:text-primary">
                                    {category.name}
                                </p>
                            </Link>
                        ))}
                    </div>

                    {categories.length > 6 && (
                        <button
                            onClick={() => scroll('right')}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-2 bg-white border border-border rounded-full shadow-md hover:bg-muted transition-colors"
                            aria-label="Scroll right"
                        >
                            <ChevronRight className="w-5 h-5 text-foreground" />
                        </button>
                    )}
                </div>
            </div>
        </section>
    )
}