"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart, ShoppingCart, FileText, Star, Flame, Tag } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/cart-context"
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
    brand_name?: string
    num_reviews?: number
    has_emi?: boolean
    cash_on_delivery?: boolean
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

// Screenshot shows two distinct square corner badges depending on the
// product's tag content — an orange "flame / HOT OFFER" badge and a pink
// "tag / OFFER" badge. Tag data from the API is a messy free-text/comma
// list, so we key off whether it contains the word "hot"; any other
// non-empty tag falls back to the plain "OFFER" badge; no tag → no badge.
function resolveBadge(tag: string): { label: string; variant: "hot" | "offer" } | null {
    const clean = tag?.trim()
    if (!clean) return null
    const firstWord = clean.split(",")[0].trim()
    if (/hot/i.test(firstWord)) return { label: "HOT\nOFFER", variant: "hot" }
    return { label: "OFFER", variant: "offer" }
}

export function HotOfferProductCard({
                                        product,
                                        showAddToCart = false,
                                        size = "default",
                                    }: {
    product: ApiProduct
    showAddToCart?: boolean
    size?: "default" | "large"
}) {
    const { addItem, addItemAndOpen } = useCart()
    const router = useRouter()
    const { label, options } = parseVariants(product.stocks)
    const variantRequired = options.length > 0

    const [selectedVariant, setSelectedVariant] = useState("")
    const [variantError, setVariantError] = useState(false)
    const [shake, setShake] = useState(false)
    const [wishlisted, setWishlisted] = useState(false)

    const outOfStock =
        product.current_stock === 0 &&
        (!product.stocks?.length || product.stocks.every((s) => s.qty === 0))

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
        const stockRow = matched ?? product.stocks[0]
        return {
            id: product.id,
            name: product.name,
            price: matched?.price ?? parsePrice(product.main_price),
            image: product.thumbnail_image ?? undefined,
            variation: variantRequired ? selectedVariant : undefined,
            variantId: stockRow?.id ?? null,
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
        addItemAndOpen(buildPayload())
    }

    function handleOrderNow() {
        if (variantRequired && !selectedVariant) {
            triggerVariantError()
            return
        }
        trackCartEvent("AddToCart")
        addItem(buildPayload())
        trackCartEvent("InitiateCheckout")
        router.push("/checkout")
    }

    const showSeeDetails = variantRequired || outOfStock
    const cod = product.cash_on_delivery ?? true
    const isLarge = size === "large"
    const badge = resolveBadge(product.tag)

    return (
        <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg">

            {/* ── Image ── */}
            <div className="relative bg-secondary/40 p-3">
                {badge && (
                    <span
                        className={`absolute left-3 top-3 z-10 flex h-9 w-9 flex-col items-center justify-center whitespace-pre-line rounded-md text-center text-[9px] font-bold leading-tight text-white shadow-sm ${
                            badge.variant === "hot"
                                ? "bg-gradient-to-b from-orange-400 to-orange-600"
                                : "bg-gradient-to-b from-pink-500 to-fuchsia-600"
                        }`}
                    >
                        {badge.variant === "hot" ? <Flame className="h-3.5 w-3.5" /> : <Tag className="h-3.5 w-3.5" />}
                        <span className="mt-0.5 text-[7px] leading-none">{badge.label}</span>
                    </span>
                )}

                <button
                    type="button"
                    onClick={() => setWishlisted((w) => !w)}
                    aria-label="Toggle wishlist"
                    className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-card/90 shadow-sm transition-colors"
                >
                    <Heart
                        className={`h-4 w-4 ${
                            wishlisted ? "fill-[#EE2430] text-[#EE2430]" : "text-muted-foreground"
                        }`}
                    />
                </button>

                {outOfStock && (
                    <span className="absolute right-3 bottom-3 z-10 rounded-md bg-red-100 px-2 py-1 text-[11px] font-bold leading-none text-red-600">
                        স্টক নেই
                    </span>
                )}

                <a href={`/product/${product.slug}`} className="block">
                    <div className={`relative mx-auto w-full ${isLarge ? "h-64" : "h-40"}`}>
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
            <div className={`flex flex-1 flex-col p-3 ${isLarge ? "items-center text-center" : ""}`}>
                {product.brand_name && (
                    <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                        {product.brand_name}
                    </span>
                )}

                <a href={`/product/${product.slug}`}>
                    <h3
                        className={`line-clamp-2 min-h-[2.5rem] font-semibold leading-snug text-foreground transition-colors hover:text-[#EE2430] ${
                            isLarge ? "text-base" : "text-sm"
                        }`}
                    >
                        {product.name}
                    </h3>
                </a>

                <div className={`mt-2 flex flex-wrap items-baseline gap-2 ${isLarge ? "justify-center" : ""}`}>
                    <span className={`font-extrabold text-foreground ${isLarge ? "text-2xl" : "text-lg"}`}>
                        {product.main_price}
                    </span>
                    {product.has_discount && (
                        <span className="text-sm text-muted-foreground line-through">{product.stroked_price}</span>
                    )}
                    {product.has_discount && product.discount > 0 && (
                        <span className="rounded-md bg-[#EE2430] px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                            {product.discount_type === "percent" ? `-${product.discount}%` : `-৳${product.discount}`}
                        </span>
                    )}
                </div>

                <div className={`mt-1 flex items-center gap-1 text-xs text-muted-foreground ${isLarge ? "justify-center" : ""}`}>
                    <Star className="h-3.5 w-3.5 fill-[#f5c518] text-[#f5c518]" />
                    <span>
                        {product.rating}/5 ({product.num_reviews ?? 0})
                    </span>
                </div>

                <div className={`mt-2 flex items-center gap-2 ${isLarge ? "justify-center" : ""}`}>
                    {product.has_emi && (
                        <span className="rounded-md bg-secondary px-2 py-1 text-[10px] font-semibold text-foreground">
                            EMI
                        </span>
                    )}
                    {cod && (
                        <span className="rounded-md bg-secondary px-2 py-1 text-[10px] font-semibold text-foreground">
                            COD
                        </span>
                    )}
                </div>

                {showAddToCart && options.length > 0 && (
                    <div className={`mt-3 w-full ${shake ? "animate-[shake_0.4s_ease-in-out]" : ""}`}>
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
                                Please select a {label.toLowerCase()}
                            </p>
                        )}
                    </div>
                )}

                <div className="mt-3 flex w-full flex-1 flex-col justify-end gap-2">
                    {showSeeDetails ? (

                       <a href={`/product/${product.slug}`}
                        className="flex h-10 items-center justify-center gap-2 rounded-md border border-foreground text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
                        >
                        <FileText className="h-4 w-4" /> See Details
                        </a>
                        ) : (
                        <button
                        onClick={handleAddToCart}
                     disabled={outOfStock}
                     className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-[#0d5c4f] text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-40"
                >
                    <ShoppingCart className="h-4 w-4" /> Add to Cart
                </button>
                )}
            </div>
        </div>
</article>
)
}