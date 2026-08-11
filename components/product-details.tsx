"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import {
    Star, ShoppingCart, Lock, Phone,
    MessageCircle, Shield, Truck,
    ChevronLeft, ChevronRight,
} from "lucide-react"
import { ProductCard, type ApiProduct } from "./product-card"
import type { ProductDetail, RelatedProduct, ProductStock } from "@/lib/product.types"
import { useCart } from "@/lib/cart-context"
import { useRouter } from "next/navigation"
import { fbqTrack } from "@/lib/fpixel"




// ─── Helpers ────────────────────────────────────────────────────────────────────
function imgUrl(filePath: string, base: string) {
    if (!filePath) return "/placeholder.svg"
    if (filePath.startsWith("http")) return filePath
    return `${base}/${filePath}`
}

function calcPrice(unitPrice: number, discount: number, discountType: "amount" | "percent") {
    if (discountType === "percent") return unitPrice * (1 - discount / 100)
    return unitPrice - discount
}

function formatBDT(n: number) {
    return "৳" + n.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function parseColors(json: string): string[] {
    try { return JSON.parse(json) ?? [] } catch { return [] }
}

interface ChoiceOption { attribute_id: string; values: string[] }
function parseChoiceOptions(json: string): ChoiceOption[] {
    try { return JSON.parse(json) ?? [] } catch { return [] }
}

const COLOR_HEX: Record<string, string> = {
    AliceBlue: "#F0F8FF", AntiqueWhite: "#FAEBD7", Aqua: "#00FFFF",
    Black: "#000000", White: "#FFFFFF", Red: "#EE2430", Green: "#008000",
    Blue: "#0000FF", Yellow: "#FFFF00", Gray: "#808080", Navy: "#000080",
    Orange: "#FFA500",
}

function hexToName(hex: string): string {
    return Object.entries(COLOR_HEX).find(([, h]) => h.toLowerCase() === hex.toLowerCase())?.[0] ?? ""
}

// ─── Star Rating ─────────────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className={`h-4 w-4 ${i <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"}`} />
            ))}
        </div>
    )
}

// ─── Thumbnail Strip ─────────────────────────────────────────────────────────────
function ThumbnailStrip({ photos, active, path, onSelect }: {
    photos: { id: number; file_name: string }[]
    active: number
    path: string
    onSelect: (i: number) => void
}) {
    return (
        <div className="flex flex-col gap-2">
            {photos.map((p, i) => (
                <button
                    key={p.id}
                    onClick={() => onSelect(i)}
                    className={`relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                        i === active ? "border-[#EE2430]" : "border-border hover:border-foreground/40"
                    }`}
                >
                    <Image src={imgUrl(p.file_name, path)} alt="" fill sizes="72px" className="object-cover" />
                </button>
            ))}
        </div>
    )
}

// ─── Related Products Carousel ───────────────────────────────────────────────────
function RelatedCarousel({ products, path }: { products: RelatedProduct[]; path: string }) {
    const PER_PAGE = 6
    const [start, setStart] = useState(0)

    const mapped: ApiProduct[] = products.map((p) => ({
        ...p,
        thumbnail_image: p.thumbnail?.file_name
            ? imgUrl(p.thumbnail.file_name, path)
            : null,
        tag: p.tag ?? "",
        stocks: p.stocks ?? [],
        brand_id: p.brand_id ?? null,
    }))

    if (!mapped.length) return null

    return (
        <section className="mt-12">
            <div className="mb-6 flex items-center justify-between border-b border-border pb-3">
                <h2 className="flex items-center gap-3 text-lg font-extrabold tracking-wide text-foreground">
                    <span className="h-6 w-1.5 rounded-full bg-accent" />
                    You May Also Like
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setStart((s) => Math.max(0, s - 1))}
                        disabled={start === 0}
                        className="flex h-8 w-8 items-center cursor-pointer justify-center rounded-full border border-border transition hover:bg-secondary disabled:opacity-30"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setStart((s) => Math.min(mapped.length - PER_PAGE, s + 1))}
                        disabled={start + PER_PAGE >= mapped.length}
                        className="flex h-8 w-8 items-center cursor-pointer justify-center rounded-full border border-border transition hover:bg-secondary disabled:opacity-30"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {mapped.slice(start, start + PER_PAGE).map((p) => (
                    <ProductCard key={p.id} product={p} showAddToCart />
                ))}
            </div>
        </section>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────────
export function ProductDetails({
                                   product,
                                   relatedProducts,
                                   path,
                               }: {
    product: ProductDetail
    relatedProducts: RelatedProduct[]
    path: string
}) {
    const { addItem, addItemAndOpen } = useCart()  // ← both methods
    const router = useRouter()

    const photos = product.photo_list.length
        ? product.photo_list
        : product.thumbnail ? [product.thumbnail] : []
    const [pageUrl, setPageUrl] = useState("")
    useEffect(() => {
        setPageUrl(window.location.href)
    }, [])
    const [activePhoto, setActivePhoto] = useState(0)
    const [qty, setQty]                 = useState(product.min_qty ?? 1)
    const [activeTab, setActiveTab]     = useState<"description" | "reviews">("description")

    const colors        = parseColors(product.colors)
    const choiceOptions = parseChoiceOptions(product.choice_options)
    const sizeOptions   = choiceOptions[0]?.values ?? []

    const [selectedColor, setSelectedColor] = useState(0)
    const [selectedSize, setSelectedSize]   = useState(sizeOptions[0] ?? "")

    // Whether the customer has actually confirmed a size — distinct from
    // selectedSize's default (which is just sizeOptions[0]) so we can still
    // require an explicit tap when sizes exist.
    const [sizeTouched, setSizeTouched] = useState(false)

    // Inline validation state for the "pick a variant" requirement
    const [variantError, setVariantError] = useState(false)
    const [shake, setShake]               = useState(false)

    const variantRequired = colors.length > 0 || sizeOptions.length > 0
    const variantSatisfied =
        (!colors.length || true) &&        // a color always has a value (selectedColor defaults to 0)
        (!sizeOptions.length || sizeTouched)

    const variantKey = useMemo(() => {
        const colorName = colors.length ? hexToName(colors[selectedColor] ?? "") : ""
        if (colorName && selectedSize) return `${colorName}-${selectedSize}`
        if (colorName)                 return colorName
        if (selectedSize)              return selectedSize
        return ""
    }, [selectedColor, selectedSize, colors])

    const matchedStock: ProductStock | undefined = useMemo(
        () => variantKey
            ? (product.stocks.find((s) => s.variant === variantKey) ?? product.stocks[0])
            : product.stocks[0],
        [variantKey, product.stocks]
    )

    const unitPrice     = matchedStock?.price ?? product.unit_price
    const mainPrice     = calcPrice(unitPrice, product.discount, product.discount_type)
    const hasDiscount   = product.discount > 0
    const saving        = unitPrice - mainPrice
    const discountLabel = product.discount_type === "percent"
        ? `Save ${formatBDT(saving)} (${product.discount}%)`
        : `Save ${formatBDT(product.discount)}`

    const stockQty = matchedStock?.qty ?? product.current_stock
    const inStock  = stockQty > 0

    const showRawPills = !colors.length && !sizeOptions.length && product.stocks.some((s) => s.variant)

    const whatsappMessage = useMemo(() => {
        const lines = [
            `Hi, I want to order this product:`,
            `*${product.name}*`,
        ]
        if (variantKey) lines.push(`Variant: ${variantKey}`)
        lines.push(`Quantity: ${qty}`)
        lines.push(`Price: ${formatBDT(mainPrice)} each`)
        lines.push(`Total: ${formatBDT(mainPrice * qty)}`)
        if (pageUrl) lines.push(`Link: ${pageUrl}`)
        return lines.join("\n")
    }, [product.name, variantKey, qty, mainPrice, pageUrl])

    const whatsappHref = `https://wa.me/8801732206841?text=${encodeURIComponent(whatsappMessage)}`
    const cartPayload = {
        id: product.id,
        name: product.name,
        price: mainPrice,
        image: photos[0] ? imgUrl(photos[0].file_name, path) : undefined,
        variation: variantKey || undefined,
        variantId: matchedStock?.id ?? null,
        qty,// ← ADD
    }
    function triggerVariantError() {
        setVariantError(true)
        setShake(true)
        setTimeout(() => setShake(false), 400)
    }
    useEffect(() => {
        setQty((q) => {
            const min = product.min_qty ?? 1
            if (stockQty <= 0) return min
            return Math.min(Math.max(q, min), stockQty)
        })
    }, [stockQty, product.min_qty])
    // ── Meta Pixel: ViewContent, fired once per product view ──────────────────
    useEffect(() => {
        fbqTrack("ViewContent", {
            content_ids: [String(product.id)],
            content_type: "product",
            content_name: product.name,
            value: mainPrice,
            currency: "BDT",
        })
        // Only re-fire if the underlying product changes, not on every price recalculation.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product.id])

    function handleAddToCart() {
        if (variantRequired && !variantSatisfied) {
            triggerVariantError()
            return
        }
        fbqTrack("AddToCart", {
            content_ids: [String(product.id)],
            content_type: "product",
            content_name: product.name,
            contents: [{ id: String(product.id), quantity: qty }],
            value: mainPrice * qty,
            currency: "BDT",
        })
        addItemAndOpen(cartPayload)   // ← opens cart drawer
    }

    function handleOrderNow() {
        if (variantRequired && !variantSatisfied) {
            triggerVariantError()
            return
        }
        fbqTrack("AddToCart", {
            content_ids: [String(product.id)],
            content_type: "product",
            content_name: product.name,
            contents: [{ id: String(product.id), quantity: qty }],
            value: mainPrice * qty,
            currency: "BDT",
        })
        addItem(cartPayload)          // ← silent add, then navigate
        fbqTrack("InitiateCheckout", {
            content_ids: [String(product.id)],
            content_type: "product",
            contents: [{ id: String(product.id), quantity: qty }],
            num_items: qty,
            value: mainPrice * qty,
            currency: "BDT",
        })
        router.push("/checkout")
    }

    return (
        <>
            {/* ── Top: Gallery + Info ── */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">

                {/* Gallery */}
                <div className="flex gap-3">
                    {photos.length > 1 && (
                        <ThumbnailStrip photos={photos} active={activePhoto} path={path} onSelect={setActivePhoto} />
                    )}
                    <div className="relative min-h-[360px] flex-1 overflow-hidden rounded-xl border border-border bg-secondary/30">
                        {photos[activePhoto] && (
                            <Image
                                src={imgUrl(photos[activePhoto].file_name, path)}
                                alt={product.name}
                                fill
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="object-contain p-4"
                                priority
                            />
                        )}
                    </div>
                </div>

                {/* Info panel */}
                <div className="flex flex-col gap-5">
                    <h1 className="text-2xl font-extrabold leading-snug text-foreground md:text-3xl">
                        {product.name}
                    </h1>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <Stars rating={product.rating} />
                        <span>({product.rating > 0 ? product.rating : 0} Reviews)</span>
                        {matchedStock?.sku && (
                            <>
                                <span className="h-4 w-px bg-border" />
                                <span>Product Code: {matchedStock.sku}</span>
                            </>
                        )}
                    </div>

                    {/* Price */}
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-3xl font-extrabold text-foreground">{formatBDT(mainPrice)}</span>
                        {hasDiscount && (
                            <>
                                <span className="text-lg text-muted-foreground line-through">{formatBDT(unitPrice)}</span>
                                <span className="rounded-md bg-green-500 px-2.5 py-1 text-sm font-bold text-white">{discountLabel}</span>
                            </>
                        )}
                    </div>

                    {/* Colour swatches */}
                    {colors.length > 0 && (
                        <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Color</p>
                            <div className="flex flex-wrap gap-2">
                                {colors.map((hex, i) => (
                                    <button
                                        key={hex}
                                        onClick={() => { setSelectedColor(i); setVariantError(false) }}
                                        title={hex}
                                        style={{ backgroundColor: hex }}
                                        className={`h-8 w-8 rounded-full cursor-pointer border-2 transition-all ${
                                            selectedColor === i ? "border-foreground scale-110 shadow" : "border-border hover:border-foreground/50"
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Size pills */}
                    {sizeOptions.length > 0 && (
                        <div className={shake ? "animate-[shake_0.4s_ease-in-out]" : ""}>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Select Option</p>
                            <div className="flex flex-wrap gap-2">
                                {sizeOptions.map((size) => {
                                    const colorName = colors.length ? hexToName(colors[selectedColor] ?? "") : ""
                                    const key       = colorName ? `${colorName}-${size}` : size
                                    const entry     = product.stocks.find((s) => s.variant === key)
                                    const available = entry ? entry.qty > 0 : true
                                    const label     = colorName ? `${colorName} - ${size}` : size
                                    const isSelected = sizeTouched && selectedSize === size
                                    return (
                                        <button
                                            key={size}
                                            onClick={() => { setSelectedSize(size); setSizeTouched(true); setVariantError(false) }}
                                            disabled={!available}
                                            className={`rounded-full cursor-pointer border px-4 py-1.5 text-sm font-semibold transition-all ${
                                                isSelected
                                                    ? "border-foreground bg-foreground text-background"
                                                    : variantError
                                                        ? "border-[#EE2430] bg-background text-[#EE2430]"
                                                        : "border-border bg-background text-foreground hover:border-foreground/60"
                                            } disabled:opacity-40 disabled:cursor-not-allowed`}
                                        >
                                            {label}
                                        </button>
                                    )
                                })}
                            </div>
                            {variantError && !sizeTouched && (
                                <p className="mt-2 text-[11px] font-semibold text-[#EE2430]">
                                    অনুগ্রহ করে একটি অপশন নির্বাচন করুন
                                </p>
                            )}
                        </div>
                    )}

                    {/* Raw variant pills fallback */}
                    {showRawPills && (
                        <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Variant</p>
                            <div className="flex flex-wrap gap-2">
                                {product.stocks.map((s) => (
                                    <span key={s.id} className="rounded-full border border-border px-4 py-1.5 text-sm font-semibold text-foreground">
                                        {s.variant}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quantity stepper */}
                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Quantity</p>
                        <div className="flex h-10 w-32 items-center overflow-hidden rounded-lg border border-border">
                            <button
                                onClick={() => setQty((q) => Math.max(product.min_qty ?? 1, q - 1))}
                                className="flex h-full w-10 items-center justify-center transition hover:bg-secondary"
                            >
                                −
                            </button>
                            <span className="flex-1 text-center text-sm font-bold">{qty}</span>
                            <button
                                onClick={() => setQty((q) => Math.min(stockQty, q + 1))}
                                disabled={qty >= stockQty}
                                className="flex h-full w-10 items-center justify-center transition hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* CTA buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={handleAddToCart}
                            disabled={!inStock || qty > stockQty}
                            className="flex h-12 items-center cursor-pointer justify-center gap-2 rounded-lg bg-foreground text-sm font-bold text-background transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ShoppingCart className="h-4 w-4" /> কার্টে যোগ করুন
                        </button>

                        <button
                            onClick={handleOrderNow}
                            disabled={!inStock || qty > stockQty}
                            className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#EE2430] text-sm font-bold text-white transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-40"
                        >
                            <Lock className="h-4 w-4" /> অর্ডার করুন
                        </button>

                        <a href={whatsappHref}
                           target="_blank"
                           rel="noopener noreferrer"
                           onClick={() =>
                               fbqTrack("Contact", {
                                   content_ids: [String(product.id)],
                                   content_name: product.name,
                               })
                           }
                           className="flex h-12 items-center cursor-pointer justify-center gap-2 rounded-lg bg-green-500 text-sm font-bold text-white transition hover:bg-green-600"
                        >
                            <MessageCircle className="h-4 w-4" /> WHATSAPP ORDER
                        </a>

                        <button className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#1a1a6e] text-sm font-bold text-white transition hover:opacity-90">
                            <Phone className="h-4 w-4" /> HOTLINE: +880 1732206841
                        </button>
                    </div>

                    {/* Trust badges */}
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        {product.cash_on_delivery === 1 && (
                            <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5" /> Cash on Delivery</span>
                        )}
                        {product.has_warranty === 1 && (
                            <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> Warranty Available</span>
                        )}
                        {!inStock && <span className="font-semibold text-red-500">স্টক নেই</span>}
                    </div>
                </div>
            </div>

            {/* ── Description / Reviews tabs ── */}
            <div className="mt-10">
                <div className="flex border-b border-border">
                    {(["description", "reviews"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-3 text-sm font-semibold capitalize transition-colors ${
                                activeTab === tab ? "border-b-2 border-foreground text-foreground" : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {tab === "reviews" ? "Reviews (0)" : "Description"}
                        </button>
                    ))}
                </div>
                <div className="mt-0 rounded-b-xl rounded-tr-xl border border-t-0 border-border p-6 text-sm leading-relaxed text-foreground">
                    {activeTab === "description" ? (
                        product.description ? (
                            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
                        ) : (
                            <p className="text-muted-foreground">No description available.</p>
                        )
                    ) : (
                        <p className="text-muted-foreground">No reviews yet. Be the first to review this product.</p>
                    )}
                </div>
            </div>

            {/* ── Related products ── */}
            <RelatedCarousel products={relatedProducts} path={path} />
        </>
    )
}