"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart, ShoppingCart, FileText, Star } from "lucide-react"
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
    // Optional display fields used by the new card layout — wire these up
    // from the API when available. The card degrades gracefully if any
    // of them are missing.
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

export function ProductCard({
                                product,
                                showAddToCart = false,
                            }: {
    product: ApiProduct
    showAddToCart?: boolean
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

    // Screenshot behaviour: products that need a variant chosen route to the
    // product page ("See Details"); simple products get a direct
    // "Add to Cart" button. handleOrderNow is left intact above in case a
    // buy-now flow is still needed elsewhere.
    const showSeeDetails = variantRequired || outOfStock
    const cod = product.cash_on_delivery ?? true

    return (
        <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg">

            {/* ── Image ── */}
            <div className="relative bg-secondary/40 p-3">
                {product.tag ? (
                    <span className="absolute left-3 top-3 z-10 rounded-md bg-[#EE2430] px-2 py-1 text-[10px] font-bold uppercase leading-none text-white">
                        {product.tag}
                    </span>
                ) : (
                    product.has_discount && (
                        <span className="absolute left-3 top-3 z-10 rounded-md bg-[#f5c518] px-2 py-1 text-[11px] font-bold leading-none text-foreground">
                            {product.discount_type === "percent"
                                ? `SAVE ${product.discount}%`
                                : `SAVE ৳${product.discount}`}
                        </span>
                    )
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
                {product.brand_name && (
                    <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                        {product.brand_name}
                    </span>
                )}

                <a href={`/product/${product.slug}`}>
                    <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-foreground transition-colors hover:text-[#EE2430]">
                        {product.name}
                    </h3>
                </a>

                <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-lg font-extrabold text-foreground">{product.main_price}</span>
                    {product.has_discount && (
                        <span className="text-sm text-muted-foreground line-through">{product.stroked_price}</span>
                    )}
                </div>

                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3.5 w-3.5 fill-[#f5c518] text-[#f5c518]" />
                    <span>
                        {product.rating}/5 ({product.num_reviews ?? 0})
                    </span>
                </div>

                <div className="mt-2 flex items-center gap-2">
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

                {/* Inline variant picker kept for the quick-add flow when a
                    caller still wants add-to-cart with variant selection on
                    the card itself. */}
                {showAddToCart && options.length > 0 && (
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
                                Please select a {label.toLowerCase()}
                            </p>
                        )}
                    </div>
                )}

                <div className="mt-3 flex flex-1 flex-col justify-end gap-2">
                    {showSeeDetails ? (
                        <a
                            href={`/product/${product.slug}`}
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