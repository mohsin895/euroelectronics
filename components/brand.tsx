"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import type { Brand } from "@/app/page"
import { SectionHeading } from "./section-heading"

export function Brand({ brands }: { brands: Brand[] }) {
    const trackRef = useRef<HTMLDivElement>(null)
    const [isPaused, setIsPaused] = useState(false)
    const resumeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
    // Tracks whether the *next* scroll event was caused by our own rAF write,
    // so we don't treat the auto-scroll's own movement as "user scrolled".
    const isProgrammaticScroll = useRef(false)

    // Duplicate the list so the track can loop seamlessly.
    const loopItems = brands.length > 0 ? [...brands, ...brands] : []

    const pauseThenResume = () => {
        setIsPaused(true)
        if (resumeTimeout.current) clearTimeout(resumeTimeout.current)
        resumeTimeout.current = setTimeout(() => setIsPaused(false), 1200)
    }

    // Keep the auto-scroll loop running continuously; read isPaused from a ref
    // inside the loop instead of as a dependency, so manual scrolling/dragging
    // never tears down and restarts the animation frame loop.
    const isPausedRef = useRef(isPaused)
    useEffect(() => {
        isPausedRef.current = isPaused
    }, [isPaused])

    useEffect(() => {
        const track = trackRef.current
        if (!track || brands.length === 0) return

        const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches
        if (prefersReducedMotion) return

        const SPEED = 60 // pixels per second
        let frameId: number
        let lastTime: number | null = null

        const step = (time: number) => {
            if (lastTime === null) lastTime = time
            const delta = time - lastTime
            lastTime = time

            if (track) {
                const halfWidth = track.scrollWidth / 2

                if (!isPausedRef.current) {
                    isProgrammaticScroll.current = true
                    track.scrollLeft += (SPEED * delta) / 1000

                    if (track.scrollLeft >= halfWidth) {
                        track.scrollLeft -= halfWidth
                    } else if (track.scrollLeft < 0) {
                        track.scrollLeft += halfWidth
                    }
                }
            }

            frameId = requestAnimationFrame(step)
        }

        frameId = requestAnimationFrame(step)
        return () => cancelAnimationFrame(frameId)
        // Only depends on categories.length now — the loop reads pause state live via ref.
    }, [brands.length])

    useEffect(() => {
        return () => {
            if (resumeTimeout.current) clearTimeout(resumeTimeout.current)
        }
    }, [])

    const handleScroll = () => {
        // If this scroll event was caused by our own auto-scroll write, ignore it.
        if (isProgrammaticScroll.current) {
            isProgrammaticScroll.current = false
            return
        }
        // Otherwise it's a real user gesture (drag, swipe, trackpad, wheel-via-handler).
        pauseThenResume()
    }

    return (
        <section className="mx-auto max-w-7xl px-4 py-6">
            <SectionHeading title="All Brands" showMore={false} />
            <div
                ref={trackRef}
                className="flex gap-3 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={pauseThenResume}
                onScroll={handleScroll}
                onWheel={(e) => {
                    if (!trackRef.current) return
                    // Let a vertical wheel/trackpad gesture drive horizontal movement.
                    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                        e.preventDefault()
                        pauseThenResume()
                        trackRef.current.scrollLeft += e.deltaY
                    }
                }}
            >
                {loopItems.map((brand, idx) => (
                    <a
                        key={`${brand.id}-${idx}`}
                        href={`/brand/${brand.slug}`}
                        className="group flex w-24 shrink-0 flex-col items-center gap-2 rounded-xl border border-border bg-card p-3 text-center transition-shadow hover:shadow-md sm:w-28 lg:w-32"
                    >
                        <div className="relative h-14 w-full">
                            <Image
                                src={brand.logo || "/placeholder.svg"}
                                alt={brand.name}
                                fill
                                className="object-contain transition-transform duration-200 group-hover:scale-110"
                            />
                        </div>
                        <span className="text-[11px] font-semibold leading-tight text-foreground">
                            {brand.name}
                        </span>
                    </a>
                ))}
            </div>
        </section>
    )
}