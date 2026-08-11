"use client"

import { useEffect, useState } from "react"
import { ProductCard, type ApiProduct, type ApiStock } from "./product-card"

// ─── API Types ──────────────────────────────────────────────────────────────────
export interface FlashSaleProduct {
    id: number
    slug: string
    name: string
    current_stock: number
    thumbnail_image: string | null
    has_discount: boolean
    discount: number
    discount_type: "amount" | "percent"
    stroked_price: string
    main_price: string
    rating: number
    tag: string
    stocks: ApiStock[]
}

export interface FlashSaleDeal {
    id: number
    slug: string
    title: string
    date: number // unix timestamp (seconds)
    banner: string | null
    products: {
        data: FlashSaleProduct[]
    }
}

// ─── Countdown ──────────────────────────────────────────────────────────────────
function calcTime(targetUnix: number) {
    const diff = targetUnix * 1000 - Date.now()
    if (diff <= 0) return { h: 0, m: 0, s: 0 }
    const totalSec = Math.floor(diff / 1000)
    return {
        h: Math.floor(totalSec / 3600),
        m: Math.floor((totalSec % 3600) / 60),
        s: totalSec % 60,
    }
}

function pad(n: number) {
    return String(n).padStart(2, "0")
}

function CountdownBadge({ targetUnix }: { targetUnix: number }) {
    // Start as null — renders nothing on the server, avoiding hydration mismatch
    const [time, setTime] = useState<{ h: number; m: number; s: number } | null>(null)

    useEffect(() => {
        // Set initial value only after mount (client-only)
        setTime(calcTime(targetUnix))
        const id = setInterval(() => setTime(calcTime(targetUnix)), 1000)
        return () => clearInterval(id)
    }, [targetUnix])

    // Server render / first paint: show placeholder boxes so layout doesn't shift
    if (!time) {
        return (
            <div className="flex items-center gap-1 text-sm font-bold">
                {["--", "--", "--"].map((v, i) => (
                    <span key={i} className="flex items-center gap-1">
                        <span className="rounded bg-[#EE2430] px-2 py-1 text-white tabular-nums w-9 text-center">{v}</span>
                        {i < 2 && <span className="text-muted-foreground">:</span>}
                    </span>
                ))}
            </div>
        )
    }

    if (time.h === 0 && time.m === 0 && time.s === 0) {
        return <span className="text-sm font-semibold text-red-500">Sale Ended</span>
    }

    return (
        <div className="flex items-center gap-1 text-sm font-bold">
            <span className="rounded bg-[#EE2430] px-2 py-1 text-white tabular-nums w-9 text-center">{pad(time.h)}</span>
            <span className="text-muted-foreground">:</span>
            <span className="rounded bg-[#EE2430] px-2 py-1 text-white tabular-nums w-9 text-center">{pad(time.m)}</span>
            <span className="text-muted-foreground">:</span>
            <span className="rounded bg-[#EE2430] px-2 py-1 text-white tabular-nums w-9 text-center">{pad(time.s)}</span>
        </div>
    )
}

// ─── Component ──────────────────────────────────────────────────────────────────
export function FlashSaleSection({ deals }: { deals: FlashSaleDeal[] }) {
    if (!deals.length) return null

    const deal = deals.find((d) => d.products.data.length > 0) ?? deals[0]
    const products = deal.products.data as ApiProduct[]

    if (!products.length) return null

    return (
        <section className="mx-auto max-w-7xl px-4 py-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                <h2 className="flex items-center gap-3 text-lg font-extrabold tracking-wide text-foreground md:text-xl">
                    <span className="h-6 w-1.5 rounded-full bg-[#EE2430]" />
                    {deal.title}
                </h2>
                <div className="flex items-center gap-3">
                    <CountdownBadge targetUnix={deal.date} />
                    <a
                        href='/flash-sale'
                        className="text-sm font-semibold uppercase tracking-wide text-muted-foreground hover:text-[#EE2430]"
                    >
                        VIEW MORE &gt;
                    </a>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {products.map((p) => (
                    <ProductCard key={p.id} product={p} showAddToCart />
                ))}
            </div>
        </section>
    )
}