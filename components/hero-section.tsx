"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Slider {
    photo: string
    url: string
}

interface Banner {
    photo: string
    url: string
}

interface HeroSectionProps {
    sliders: Slider[]
    banner: Banner | null
}

// ─── Slider client component (needs state for autoplay/dots) ──────────────────
export function HeroSection({ sliders, banner }: HeroSectionProps) {
    const [active, setActive] = useState(0)

    const next = useCallback(
        () => setActive((a) => (a + 1) % sliders.length),
        [sliders.length]
    )
    const prev = () => setActive((a) => (a - 1 + sliders.length) % sliders.length)

    useEffect(() => {
        if (sliders.length < 2) return
        const t = setInterval(next, 5000)
        return () => clearInterval(t)
    }, [next, sliders.length])

    return (
        <section className="mx-auto max-w-7xl px-4 py-5">
            <div className="grid gap-4 lg:grid-cols-3">

                {/* ── Slider ── */}
                <div className="relative overflow-hidden rounded-2xl lg:col-span-2 bg-muted min-h-[260px] md:min-h-[340px]">
                    {sliders.length > 0 && (
                        <>
                            <div
                                className="flex h-full transition-transform duration-500 ease-out"
                                style={{ transform: `translateX(-${active * 100}%)` }}
                            >
                                {sliders.map((slide, i) => (
                                    <a
                                        key={i}
                                        href={slide.url}
                                        className="relative w-full shrink-0 min-h-[260px] md:min-h-[340px] block"
                                    >
                                        <Image
                                            src={slide.photo}
                                            alt={`Slide ${i + 1}`}
                                            fill
                                            className="object-cover"
                                            priority={i === 0}
                                        />
                                    </a>
                                ))}
                            </div>

                            {/* Prev / Next */}
                            {sliders.length > 1 && (
                                <>
                                    <button
                                        onClick={prev}
                                        aria-label="Previous slide"
                                        className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-foreground shadow hover:bg-white transition-colors"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={next}
                                        aria-label="Next slide"
                                        className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-foreground shadow hover:bg-white transition-colors"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </>
                            )}

                            {/* Dots */}
                            {sliders.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                                    {sliders.map((_, i) => (
                                        <button
                                            key={i}
                                            aria-label={`Go to slide ${i + 1}`}
                                            onClick={() => setActive(i)}
                                            className={`h-2.5 rounded-full transition-all ${
                                                i === active ? "w-6 bg-white" : "w-2.5 bg-white/50"
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* ── Side banner ── */}
                <div className="relative hidden overflow-hidden rounded-2xl bg-muted lg:block min-h-[340px]">
                    {banner ? (
                        <a href={banner.url} className="block w-full h-full">
                            <Image
                                src={banner.photo}
                                alt="Banner"
                                fill
                                className="object-cover"
                            />
                        </a>
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                            No banner
                        </div>
                    )}
                </div>

            </div>
        </section>
    )
}