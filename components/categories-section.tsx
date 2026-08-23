"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import type { ApiCategory } from "@/app/page"
import { SectionHeading } from "./section-heading"

export function CategoriesSection({ categories }: { categories: ApiCategory[] }) {
    const trackRef = useRef<HTMLDivElement>(null)
    const progressBarRef = useRef<HTMLDivElement>(null)
    const [progress, setProgress] = useState(0)

    // Mouse-drag state
    const isDragging = useRef(false)
    const dragStartX = useRef(0)
    const dragStartScrollLeft = useRef(0)
    const didDrag = useRef(false) // distinguishes a drag from a plain click on a card

    const updateProgress = () => {
        const track = trackRef.current
        if (!track) return
        const maxScroll = track.scrollWidth - track.clientWidth
        if (maxScroll <= 0) {
            setProgress(0)
            return
        }
        setProgress((track.scrollLeft / maxScroll) * 100)
    }

    const handleScroll = () => {
        updateProgress()
    }

    // --- Mouse drag-to-scroll ---
    const handleMouseDown = (e: React.MouseEvent) => {
        const track = trackRef.current
        if (!track) return
        isDragging.current = true
        didDrag.current = false
        dragStartX.current = e.pageX - track.offsetLeft
        dragStartScrollLeft.current = track.scrollLeft
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        const track = trackRef.current
        if (!track || !isDragging.current) return
        e.preventDefault()
        const x = e.pageX - track.offsetLeft
        const walk = x - dragStartX.current
        if (Math.abs(walk) > 3) didDrag.current = true // treat as a drag, not a click
        track.scrollLeft = dragStartScrollLeft.current - walk
        updateProgress()
    }

    const endDrag = () => {
        isDragging.current = false
    }

    // Suppress the click navigation on a card if the mousedown→mouseup was actually a drag.
    const handleCardClick = (e: React.MouseEvent) => {
        if (didDrag.current) {
            e.preventDefault()
            didDrag.current = false
        }
    }

    // --- Click-to-seek on the progress bar itself ---
    const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const track = trackRef.current
        const bar = progressBarRef.current
        if (!track || !bar) return

        const maxScroll = track.scrollWidth - track.clientWidth
        if (maxScroll <= 0) return

        const rect = bar.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const ratio = Math.min(Math.max(clickX / rect.width, 0), 1)

        track.scrollTo({
            left: ratio * maxScroll,
            behavior: "smooth",
        })

        // scrollTo with smooth behavior updates scrollLeft asynchronously,
        // so reflect the new position immediately for a snappier feel
        setProgress(ratio * 100)
    }

    return (
        <section className="mx-auto max-w-7xl px-4 py-6">
            <SectionHeading title="What are you looking for?" showMore={false} />

            <div
                ref={trackRef}
                className="flex cursor-grab gap-4 overflow-x-auto select-none active:cursor-grabbing [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                onScroll={handleScroll}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={endDrag}
                onMouseLeave={endDrag}
                onWheel={(e) => {
                    if (!trackRef.current) return
                    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                        e.preventDefault()
                        trackRef.current.scrollLeft += e.deltaY
                    }
                }}
            >
                {categories.map((cat) => (
                    <a
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        onClick={handleCardClick}
                        onDragStart={(e) => e.preventDefault()} // stop native image/link drag ghost
                        className="group flex w-28 shrink-0 flex-col items-center gap-3 rounded-2xl border border-border bg-card p-4 text-center shadow-[1px_4px_10px_0px_var(--tw-shadow-color)] shadow-black/10 transition-shadow hover:shadow-[1px_4px_10px_0px_var(--tw-shadow-color)] hover:shadow-black/20 sm:w-32 lg:w-36"
                    >
                        <div className="relative h-20 w-full">
                            <Image
                                src={cat.icon || "/placeholder.svg"}
                                alt={cat.name}
                                fill
                                className="pointer-events-none object-contain transition-transform duration-200 group-hover:scale-110"
                            />
                        </div>
                        <span className="text-sm font-bold leading-tight text-foreground">
                            {cat.name}
                        </span>
                    </a>
                ))}
            </div>

            <div
                ref={progressBarRef}
                onClick={handleProgressBarClick}
                className="mx-auto mt-4 h-1.5 w-full max-w-[280px] cursor-pointer overflow-hidden rounded-full bg-blue-100"
            >
                <div
                    className="h-full rounded-full bg-slate-400 transition-[width,transform] duration-100 ease-linear"
                    style={{
                        width: "40%",
                        transform: `translateX(${Math.min(Math.max(progress, 0), 100) * 1.5}%)`,
                    }}
                />
            </div>
        </section>
    )
}