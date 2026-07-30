'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface HeroBanner {
    id: number
    title: string
    subtitle: string
    image: string
    link: string
    link_text: string
    status: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL

export function HeroCarousel() {
    const [banners, setBanners] = useState<HeroBanner[]>([])
    const [currentSlide, setCurrentSlide] = useState(0)
    const [autoPlay, setAutoPlay] = useState(true)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`${API_BASE_URL}/slider`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success && Array.isArray(data.data)) {
                    setBanners(data.data.filter((banner: HeroBanner) => banner.status === 'active'))
                }
            })
            .catch((err) => console.error('[v0] Failed to fetch sliders:', err))
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        if (!autoPlay || banners.length === 0) return

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % banners.length)
        }, 5000) // Auto-slide every 5 seconds

        return () => clearInterval(interval)
    }, [autoPlay, banners.length])

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % banners.length)
        setAutoPlay(false)
    }

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
        setAutoPlay(false)
    }

    const goToSlide = (index: number) => {
        setCurrentSlide(index)
        setAutoPlay(false)
    }

    if (loading) {
        return (
            <div className="relative w-full h-96 md:h-[370px] overflow-hidden rounded-lg bg-muted animate-pulse" />
        )
    }

    if (banners.length === 0) {
        return null
    }

    return (
        <div className="relative w-full h-96 md:h-[370px] overflow-hidden rounded-lg bg-black">
            {/* Slides */}
            <div className="relative w-full h-full">
                {banners.map((banner, index) => (
                    <div
                        key={banner.id}
                        className={`absolute inset-0 transition-opacity h-full duration-1000 ease-in-out ${
                            index === currentSlide ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                        {/* Background Image */}
                        <Image
                            src={`${IMAGE_BASE_URL}/${banner.image}`}
                            alt={banner.title}
                            fill
                            className="object-cover"
                            priority={index === currentSlide}
                            unoptimized
                        />
                    </div>
                ))}
            </div>

            {/* Navigation Buttons */}
            {banners.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        onMouseEnter={() => setAutoPlay(false)}
                        onMouseLeave={() => setAutoPlay(true)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="w-6 h-6 text-white" />
                    </button>

                    <button
                        onClick={nextSlide}
                        onMouseEnter={() => setAutoPlay(false)}
                        onMouseLeave={() => setAutoPlay(true)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="w-6 h-6 text-white" />
                    </button>

                    {/* Dots Navigation */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                        {banners.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-2 h-2 rounded-full transition-all ${
                                    index === currentSlide
                                        ? 'bg-primary w-8'
                                        : 'bg-white/50 hover:bg-white/70'
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}