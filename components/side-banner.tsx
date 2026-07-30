'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface SideBannerData {
    id: number
    title: string
    subtitle: string
    highlights: string[]
    image: string
    link: string
    status: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL

export function SideBanner() {
    const [banner, setBanner] = useState<SideBannerData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`${API_BASE_URL}/side-banner`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success && Array.isArray(data.data)) {
                    const active = data.data.find((b: SideBannerData) => b.status === 'active')
                    if (active) setBanner(active)
                }
            })
            .catch((err) => console.error('[v0] Failed to fetch side banner:', err))
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return <div className="relative w-full h-96 md:h-[370px] overflow-hidden rounded-lg bg-muted animate-pulse" />
    }

    if (!banner) {
        return null
    }

    return (
        <Link
            href={banner.link || '#'}
            className="relative block w-full h-[280px] md:h-[370px] overflow-hidden rounded-lg bg-black group"
        >
            {/* Background image */}
            <Image
                src={`${IMAGE_BASE_URL}/${banner.image}`}
                alt={banner.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/5 to-black/40" />

            {/* Text content */}
            <div className="relative z-10 h-full p-5 flex flex-col">
                <p className="text-white/90 text-sm font-medium">{banner.subtitle}</p>
                <h3 className="text-white text-xl md:text-2xl font-bold leading-snug mt-1 mb-4">
                    {banner.title}
                </h3>

                {banner.highlights?.length > 0 && (
                    <ul className="space-y-2 mt-1">
                        {banner.highlights.map((point, i) => (
                            <li key={i} className="flex items-start gap-2 text-white text-sm">
                                <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-xs font-semibold">
                                    {i + 1}
                                </span>
                                <span>{point}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </Link>
    )
}