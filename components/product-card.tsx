"use client"

import { useState } from "react"
import Image from "next/image"
import { Lock, ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/cart-context"  // ← only useCart, nothing else
import { fbqTrack } from "@/lib/fpixel"

export interface ApiStock {
    id: number
    product_id: number
    variant: string
    sku: string | null
    price: number
    qty: number
}

export interface ApiProduct {
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
    brand_id: number | null
    stocks: ApiStock[]
}

function parseVariants(stocks: ApiStock[] | undefined): { label: string; options: string[] } {
    if (!stocks?.length) return { label: "", options: [] }
    const withVariant = stocks.filter((s) => s.variant?.trim())
    if (!withVariant.length) return { label: "", options: [] }
    const hasDash = withVariant.some((s) => s.variant.includes("-"))
    if (hasDash) {
        const parts = withVariant.map((s) => {
            const idx = s.variant.lastIndexOf("-")
            return { label: s.variant.slice(0, idx), value: s.variant.slice(idx + 1) }
        })
        const firstLabel = parts[0].label
        const allSameLabel = parts.every((p) => p.label === firstLabel)
        const label = allSameLabel ? firstLabel : "Variant"
        const options = parts.map((p) => p.value).filter((v, i, arr) => arr.indexOf(v) === i)
        return { label, options }
    }
    const options = withVariant.map((s) => s.variant.trim()).filter((v, i, arr) => arr.indexOf(v) === i)
    return { label: "Variant", options }
}

function parsePrice(str: string): number {
    const cleaned = str.replace(/[^\d.]/g, "")
    return parseFloat(cleaned) || 0
}

export function ProductCard({
                                product,
                                showAddToCart = false,
                            }: {
    product: ApiProduct
    showAddToCart?: boolean
}) {
    const { addItem, addItemAndOpen } = useCart()  // ← destructure from useCart()
    const router = useRouter()
    const { label, options } = parseVariants(product.stocks)
    const variantRequired = options.length > 0

    const [selectedVariant, setSelectedVariant] = useState("")
    const [variantError, setVariantError]       = useState(false)
    const [shake, setShake]                     = useState(false)

    const outOfStock =
        product.current_stock === 0 &&
        (!product.stocks?.length || product.stocks.every((s) => s.qty === 0))

    // Resolve price/sku/stock for the currently selected variant, falling back
    // to the product-level defaults when there's no variant to match.
    function resolveStock() {
        if (!variantRequired) return undefined
        return product.stocks.find((s) => s.variant === selectedVariant)
    }

    function triggerVariantError() {
        setVariantError(true)
        setShake(true)
        setTimeout(() => setShake(false), 400)
    }

    function handleVariantChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setSelectedVariant(e.target.value)
        if (e.target.value) setVariantError(false)
    }

    function buildPayload() {
        const matched = resolveStock()
        // For no-variant products, fall back to first stock row
        const stockRow = matched ?? product.stocks[0]
        return {
            id: product.id,
            name: product.name,
            price: matched?.price ?? parsePrice(product.main_price),
            image: product.thumbnail_image ?? undefined,
            variation: variantRequired ? selectedVariant : undefined,
            variantId: stockRow?.id ?? null,   // ← ADD
        }
    }

    function trackCartEvent(eventName: "AddToCart" | "InitiateCheckout") {
        const payload = buildPayload()
        fbqTrack(eventName, {
            content_ids: [String(product.id)],
            content_type: "product",
            content_name: product.name,
            contents: [{ id: String(product.id), quantity: 1 }],
            value: payload.price,
            currency: "BDT",
        })
    }

    function handleAddToCart() {
        if (variantRequired && !selectedVariant) {
            triggerVariantError()
            return
        }
        trackCartEvent("AddToCart")
        addItemAndOpen(buildPayload())   // ← opens cart drawer
    }

    function handleOrderNow() {
        if (variantRequired && !selectedVariant) {
            triggerVariantError()
            return
        }
        trackCartEvent("AddToCart")
        addItem(buildPayload())          // ← no cart open
        trackCartEvent("InitiateCheckout")
        router.push("/checkout")
    }

    return (
        <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg">

            {/* ── Image ── */}
            <div className="relative bg-secondary/40 p-3">
                {product.has_discount && (
                    <span className="absolute left-3 top-3 z-10 rounded-md bg-[#f5c518] px-2 py-1 text-[11px] font-bold text-foreground leading-none">
                        {product.discount_type === "percent"
                            ? `SAVE ${product.discount}%`
                            : `SAVE ৳${product.discount}`}
                    </span>
                )}
                {outOfStock && (
                    <span className="absolute right-3 top-3 z-10 rounded-md bg-red-100 px-2 py-1 text-[11px] font-bold text-red-600 leading-none">
                        স্টক নেই
                    </span>
                )}
                <a href={`/product/${product.slug}`} className="block">
                    <div className="relative mx-auto h-40 w-full">
                        <Image
                            src={product.thumbnail_image || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 50vw, 200px"
                            className="object-contain transition-transform duration-200 hover:scale-105"
                        />
                    </div>
                </a>
            </div>

            {/* ── Body ── */}
            <div className="flex flex-1 flex-col p-3">
                <a href={`/product/${product.slug}`}>
                    <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-foreground hover:text-[#EE2430] transition-colors">
                        {product.name}
                    </h3>
                </a>

                <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-lg font-extrabold text-foreground">{product.main_price}</span>
                    {product.has_discount && (
                        <span className="text-sm text-muted-foreground line-through">{product.stroked_price}</span>
                    )}
                </div>

                {options.length > 0 && (
                    <div className={`mt-3 ${shake ? "animate-[shake_0.4s_ease-in-out]" : ""}`}>
                        <select
                            value={selectedVariant}
                            onChange={handleVariantChange}
                            className={`h-9 w-full rounded-md border bg-card px-2 text-sm outline-none transition-colors ${
                                variantError
                                    ? "border-[#EE2430] text-[#EE2430]"
                                    : "border-border text-muted-foreground focus:border-[#EE2430]"
                            }`}
                        >
                            <option value="" disabled>{label}</option>
                            {options.map((v) => (
                                <option key={v} value={v}>{v}</option>
                            ))}
                        </select>
                        {variantError && (
                            <p className="mt-1 text-[11px] font-semibold text-[#EE2430]">
                                অনুগ্রহ করে একটি {label.toLowerCase()} নির্বাচন করুন
                            </p>
                        )}
                    </div>
                )}

                <div className="mt-3 flex flex-1 flex-col justify-end gap-2">
                    <button
                        onClick={handleOrderNow}
                        disabled={outOfStock}
                        className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-foreground text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-40"
                    >
                        <Lock className="h-4 w-4" /> অর্ডার করুন
                    </button>
                    {showAddToCart && (
                        <button
                            onClick={handleAddToCart}
                            disabled={outOfStock}
                            className="flex h-10 items-center cursor-pointer justify-center gap-2 rounded-md border border-foreground text-sm font-semibold text-foreground transition-colors hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ShoppingCart className="h-4 w-4" /> কার্টে যোগ করুন
                        </button>
                    )}
                </div>
            </div>
        </article>
    )
}