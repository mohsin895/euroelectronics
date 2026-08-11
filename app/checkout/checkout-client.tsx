"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/cart-context"
import { Trash2, Minus, Plus, Tag, Clock, ChevronDown, X, Loader2, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import type { ShippingArea, CartSettings, AdvanceRule } from "@/lib/types"
import { fbqTrack } from "@/lib/fpixel"

// ─── helpers ────────────────────────────────────────────────────────────────

function formatBDT(n: number) {
    return "৳" + n.toLocaleString("en-BD", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

const FALLBACK_SHIPPING_AREAS: ShippingArea[] = [
    { id: 2, label: "ঢাকার ভিতরে (৳ 60)", value: 60 },
    { id: 3, label: "ঢাকার বাইরে (৳ 110)", value: 110 },
]

const INITIAL_TIME = 10 * 60

function isWithinWindow(start?: string, end?: string) {
    if (!start || !end) return false
    const now = Date.now()
    const s = new Date(start).getTime()
    const e = new Date(end).getTime()
    if (Number.isNaN(s) || Number.isNaN(e)) return false
    return now >= s && now <= e
}

function getApplicableAdvanceRule(rules: AdvanceRule[] | undefined, amount: number): AdvanceRule | null {
    if (!rules?.length) return null
    const candidates = rules
        .filter(r => r.is_active)
        .filter(r => amount >= r.min_order_amount && (r.max_order_amount === null || amount <= r.max_order_amount))
        .sort((a, b) => a.sort_order - b.sort_order)
    return candidates[0] ?? null
}

// ─── coupon types ────────────────────────────────────────────────────────────

interface ApiCoupon {
    id: number
    user_type: string
    shop_id: string
    shop_name: string
    shop_slug: string
    coupon_type: string          // "cart_base" | "product_base" etc.
    code: string
    discount: number
    coupon_product_details: unknown[]
    coupon_discount_details: {
        min_buy: string          // e.g. "৳100,000.00"
        max_discount: string     // e.g. "100"
    }
    discount_type: "percent" | "amount"
    start_date: number           // unix seconds
    end_date: number             // unix seconds
}

interface AppliedCoupon {
    code: string
    discountType: "percent" | "amount"
    discountValue: number        // percent number OR flat BDT
    maxDiscount: number          // 0 = no cap
    minBuy: number               // minimum subtotal in BDT
}

// ─── coupon controller ───────────────────────────────────────────────────────

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN ?? ""

/** Strip non-numeric chars and parse a BDT string like "৳100,000.00" → 100000 */
function parseBDTString(str: string): number {
    const cleaned = str.replace(/[^\d.]/g, "")
    return parseFloat(cleaned) || 0
}

async function fetchAndValidateCoupon(
    code: string,
    subtotal: number,
): Promise<{ coupon: AppliedCoupon } | { error: string }> {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) return { error: "কুপন কোড লিখুন।" }

    let list: ApiCoupon[] = []
    try {
        const res = await fetch(`${DOMAIN}/coupon-list`, { cache: "no-store" })
        if (!res.ok) throw new Error("Network error")
        const json = await res.json()
        if (!json.success || !Array.isArray(json.data)) throw new Error("Bad response")
        list = json.data as ApiCoupon[]
    } catch {
        return { error: "সার্ভারের সাথে সংযোগ ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।" }
    }

    const found = list.find(c => c.code.trim().toUpperCase() === trimmed)
    if (!found) return { error: "কুপন কোডটি সঠিক নয়।" }

    // Date validation (unix seconds → ms)
    const nowSec = Math.floor(Date.now() / 1000)
    if (nowSec < found.start_date) return { error: "এই কুপনটি এখনো সক্রিয় হয়নি।" }
    if (nowSec > found.end_date)   return { error: "কুপনের মেয়াদ শেষ হয়ে গেছে।" }

    const minBuy = parseBDTString(found.coupon_discount_details.min_buy)
    if (minBuy > 0 && subtotal < minBuy) {
        return { error: `ন্যূনতম অর্ডার ${formatBDT(minBuy)} হলে এই কুপন ব্যবহার করা যাবে।` }
    }

    const maxDiscount = parseFloat(found.coupon_discount_details.max_discount) || 0

    return {
        coupon: {
            code: found.code,
            discountType: found.discount_type,
            discountValue: found.discount,
            maxDiscount,
            minBuy,
        },
    }
}

/** Calculate the actual BDT discount from an applied coupon */
function calcCouponDiscount(coupon: AppliedCoupon, subtotal: number): number {
    let disc = 0
    if (coupon.discountType === "percent") {
        disc = Math.round(subtotal * (coupon.discountValue / 100))
    } else {
        disc = Math.round(coupon.discountValue)
    }
    if (coupon.maxDiscount > 0) disc = Math.min(disc, coupon.maxDiscount)
    return disc
}

// ─── props ───────────────────────────────────────────────────────────────────

interface CheckoutClientProps {
    shippingAreas: ShippingArea[]
    cartSettings: CartSettings | null
}

// ─── component ───────────────────────────────────────────────────────────────

export function CheckoutClient({ shippingAreas, cartSettings }: CheckoutClientProps) {
    const { items, removeItem, updateQty, clearCart } = useCart()
    const router = useRouter()

    const areas = shippingAreas.length > 0 ? shippingAreas : FALLBACK_SHIPPING_AREAS
    const defaultArea = areas.find(a => /বাহির|বাইর/.test(a.label)) ?? areas[areas.length - 1]

    const [mounted, setMounted]     = useState(false)
    const [form, setForm]           = useState({
        name: "", phone: "", address: "",
        shippingArea: defaultArea.value,
        note: "",
    })
    const [paymentMethod, setPaymentMethod] = useState<"sslcommerz" | "cod">("cod")
    const [agreed, setAgreed]       = useState(true)
    const [submitted, setSubmitted] = useState(false)
    const [timeLeft, setTimeLeft]   = useState(INITIAL_TIME)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

    // ── coupon state ──────────────────────────────────────────────
    const [couponInput, setCouponInput]         = useState("")
    const [couponLoading, setCouponLoading]     = useState(false)
    const [couponError, setCouponError]         = useState<string | null>(null)
    const [appliedCoupon, setAppliedCoupon]     = useState<AppliedCoupon | null>(null)

    // ── mount / timer ─────────────────────────────────────────────
    useEffect(() => {
        setMounted(true)
        const saved = sessionStorage.getItem("checkout_timer")
        if (saved) {
            const remaining = parseInt(saved, 10)
            if (remaining > 0) setTimeLeft(remaining)
        }
    }, [])

    useEffect(() => {
        if (!mounted) return
        if (timeLeft <= 0) { if (timerRef.current) clearInterval(timerRef.current); return }
        timerRef.current = setInterval(() => {
            setTimeLeft(s => {
                const next = s - 1
                sessionStorage.setItem("checkout_timer", String(next))
                return next
            })
        }, 1000)
        return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }, [mounted])

    const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0")
    const ss = String(timeLeft % 60).padStart(2, "0")
    const timerUrgent = timeLeft < 60

    // ── pricing ───────────────────────────────────────────────────
    const subtotal = mounted ? items.reduce((sum, i) => sum + i.price * i.qty, 0) : 0

    const freeDeliveryMin = cartSettings ? parseFloat(cartSettings.free_delivery_min_order) : null
    const isFreeDelivery =
        !!cartSettings &&
        cartSettings.delivery_charge_free === "1" &&
        freeDeliveryMin !== null &&
        !Number.isNaN(freeDeliveryMin) &&
        subtotal >= freeDeliveryMin

    const deliveryCharge = isFreeDelivery ? 0 : form.shippingArea

    const isOnlineDiscountActive =
        !!cartSettings &&
        cartSettings.online_payment_discount_enabled &&
        isWithinWindow(cartSettings.discount_valid_from, cartSettings.discount_valid_until)

    const onlineDiscountPercent  = isOnlineDiscountActive ? cartSettings!.online_payment_discount_percent : 0
    const onlinePaymentDiscount  =
        paymentMethod === "sslcommerz" && onlineDiscountPercent > 0
            ? Math.round(subtotal * (onlineDiscountPercent / 100))
            : 0

    const couponDiscount = appliedCoupon ? calcCouponDiscount(appliedCoupon, subtotal) : 0
    const totalDiscount  = couponDiscount + onlinePaymentDiscount
    const total          = subtotal + deliveryCharge - totalDiscount

    // ── advance payment ───────────────────────────────────────────
    const advanceRule = useMemo(
        () => getApplicableAdvanceRule(cartSettings?.advance_rules, total),
        [cartSettings, total]
    )
    const advanceEnabled = !!cartSettings && cartSettings.delivery_charge_advance_enabled === 1
    const advanceApplies =
        advanceEnabled &&
        !!advanceRule &&
        (cartSettings?.delivery_advance_type !== "cod_only" || paymentMethod === "cod")
    const advanceAmount = advanceRule
        ? advanceRule.advance_payment_type === "full"
            ? total
            : Math.round(total * (advanceRule.advance_percentage / 100))
        : 0

    // ── Meta Pixel: InitiateCheckout, fired once the checkout page has real cart data ──
    const checkoutTracked = useRef(false)
    useEffect(() => {
        if (!mounted || checkoutTracked.current || !items.length) return
        checkoutTracked.current = true
        fbqTrack("InitiateCheckout", {
            content_ids: items.map(i => String(i.id)),
            contents: items.map(i => ({ id: String(i.id), quantity: i.qty })),
            num_items: items.reduce((sum, i) => sum + i.qty, 0),
            value: subtotal,
            currency: "BDT",
        })
        // Only fire once when the checkout view first has items, not on every price recalculation.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mounted, items.length])

    // ── coupon handlers ───────────────────────────────────────────
    async function handleApplyCoupon() {
        if (!couponInput.trim() || couponLoading) return
        setCouponLoading(true)
        setCouponError(null)
        const result = await fetchAndValidateCoupon(couponInput, subtotal)
        setCouponLoading(false)
        if ("error" in result) {
            setCouponError(result.error)
            setAppliedCoupon(null)
        } else {
            setAppliedCoupon(result.coupon)
            setCouponError(null)
        }
    }

    function handleRemoveCoupon() {
        setAppliedCoupon(null)
        setCouponInput("")
        setCouponError(null)
    }

    // ── order submit state ────────────────────────────────────────
    const [orderLoading, setOrderLoading] = useState(false)
    const [orderError, setOrderError]     = useState<string | null>(null)
    const [orderCode, setOrderCode]       = useState<string | null>(null)

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const val = e.target.name === "shippingArea" ? Number(e.target.value) : e.target.value
        setForm(f => ({ ...f, [e.target.name]: val }))
    }

    async function handleSubmit() {
        if (!form.name || !form.phone || !form.address || !agreed || orderLoading) return

        setOrderLoading(true)
        setOrderError(null)

        // Map frontend cart items → backend cart_items shape
        const cartItemsPayload = items.map(item => ({
            product_id:    item.id,
            quantity:      item.qty,
            price:         item.price,
            variation:     item.variation  ?? null,
            variant_id:    item.variantId  ?? null,   // ← ADD
            tax:           item.tax        ?? 0,
            shipping_cost: 0,
            shipping_type: "flat_rate",
            discount:      0,
        }))

        const payload = {
            // Customer
            customer_name:    form.name,
            customer_phone:   form.phone,
            customer_email:   "",
            delivery_address: form.address,
            country:          "BD",
            state:            "",
            city:             "",
            zipcode:          "",
            // Order
            shipping_cost:    deliveryCharge,
            payment_method:   paymentMethod === "sslcommerz" ? "sslcommerz" : "cash_on_delivery",
            discount:         totalDiscount,         // coupon + online-payment discount combined
            coupon_code:      appliedCoupon?.code ?? "",
            note:             form.note,
            // Cart
            cart_items: cartItemsPayload,
        }

        try {
            const res = await fetch(`${DOMAIN}/gust/user/order/store`, {
                method:  "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body:    JSON.stringify(payload),
            })

            const json = await res.json()

            if (!res.ok || !json.result) {
                setOrderError(json.message ?? "অর্ডার প্রক্রিয়াকরণে সমস্যা হয়েছে। আবার চেষ্টা করুন।")
                setOrderLoading(false)
                return
            }

            // ── Meta Pixel: Purchase — the single most important conversion event ──
            fbqTrack("Purchase", {
                content_ids: items.map(i => String(i.id)),
                content_type: "product",
                contents: items.map(i => ({ id: String(i.id), quantity: i.qty })),
                num_items: items.reduce((sum, i) => sum + i.qty, 0),
                value: total,
                currency: "BDT",
                order_id: json.order_code ?? undefined,
            })

            // Success — clear local cart & timer, then show success screen
            setOrderCode(json.order_code ?? null)
            clearCart()
            sessionStorage.removeItem("checkout_timer")
            setSubmitted(true)

        } catch {
            setOrderError("সার্ভারের সাথে সংযোগ ব্যর্থ হয়েছে। আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন।")
            setOrderLoading(false)
        }
    }

    if (!mounted) return <div className="mx-auto max-w-6xl px-4 py-6 min-h-[60vh]" />

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">✅</div>
                <h1 className="text-2xl font-extrabold text-gray-900">অর্ডার সফল হয়েছে!</h1>
                {orderCode && (
                    <p className="rounded-lg border border-gray-200 bg-gray-50 px-5 py-2 text-sm font-semibold text-gray-700">
                        অর্ডার নম্বর: <span className="font-extrabold text-gray-900">{orderCode}</span>
                    </p>
                )}
                <p className="text-gray-500">আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।</p>
                <button
                    onClick={() => router.push("/")}
                    className="mt-4 rounded-lg bg-gray-900 px-8 py-3 font-bold text-white hover:bg-gray-700 transition-colors"
                >
                    হোমে ফিরুন
                </button>
            </div>
        )
    }

    if (!items.length) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
                <div className="text-6xl">🛒</div>
                <h1 className="text-xl font-bold text-gray-900">কার্ট খালি আছে</h1>
                <button
                    onClick={() => router.push("/")}
                    className="rounded-lg bg-gray-900 px-8 py-3 font-bold text-white hover:bg-gray-700 transition-colors"
                >
                    শপিং করুন
                </button>
            </div>
        )
    }

    const canSubmit = !!(form.name && form.phone && form.address && agreed && !orderLoading)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Login bar */}
            <div className="border-b border-gray-200 bg-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                    <p className="text-sm text-gray-500">Have any account? please login or register</p>
                    <div className="flex gap-2">
                        <a href="/login" className="rounded border border-gray-300 px-5 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                            Login
                        </a>
                        <a href='/register' className="rounded bg-gray-900 px-5 py-1.5 text-sm font-semibold text-white hover:bg-gray-700 transition-colors">
                            Register
                        </a>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-6xl px-4 py-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                    {/* ── LEFT COLUMN ── */}
                    <div className="flex flex-col gap-5">

                        {/* Order Review */}
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-5 py-4">
                                <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                                    <span className="h-5 w-1 rounded-full bg-gray-900" />
                                    Order review
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {items.map(item => (
                                    // id alone isn't unique once variants exist — different
                                    // variants of the same product share an id.
                                    <div key={`${item.id}::${item.variation ?? ""}`} className="flex flex-wrap items-center gap-3 px-5 py-4 sm:flex-nowrap">
                                        {item.image && (
                                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                                <Image src={item.image} alt={item.name} fill sizes="64px" className="object-contain p-1" />
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1 basis-full sm:basis-auto">
                                            <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">{item.name}</p>
                                            {item.variation && (
                                                <p className="mt-0.5 text-xs text-gray-500">{item.variation}</p>
                                            )}
                                            <p className="mt-1 text-sm font-bold text-gray-900">{formatBDT(item.price)}</p>
                                        </div>
                                        <div className="ml-auto flex items-center gap-3 sm:ml-0">
                                            <div className="flex items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                                                <button
                                                    onClick={() => updateQty(item.id, item.qty - 1, item.variation)}
                                                    className="flex h-7 w-7 items-center justify-center rounded-md text-gray-600 hover:bg-white hover:shadow-sm transition-all"
                                                    aria-label="Decrease"
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="w-8 text-center text-sm font-bold text-gray-800">{item.qty}</span>
                                                <button
                                                    onClick={() => updateQty(item.id, item.qty + 1, item.variation)}
                                                    className="flex h-7 w-7 items-center justify-center rounded-md text-gray-600 hover:bg-white hover:shadow-sm transition-all"
                                                    aria-label="Increase"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>
                                            <div className="w-16 text-right">
                                                <p className="text-sm font-bold text-gray-900">{formatBDT(item.price * item.qty)}</p>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id, item.variation)}
                                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                                aria-label="Remove"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-5 py-4">
                                <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                                    <span className="h-5 w-1 rounded-full bg-gray-900" />
                                    Shipping Address
                                </h2>
                            </div>
                            <div className="p-5 flex flex-col gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="name" type="text" placeholder="Enter your full name"
                                        value={form.name} onChange={handleChange}
                                        className="h-11 rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-800 outline-none focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-200 transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            Phone Number <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            name="phone" type="tel" placeholder="01XXXXXXXXX"
                                            value={form.phone} onChange={handleChange}
                                            className="h-11 rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-800 outline-none focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-200 transition-all"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            Shipping Area <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="shippingArea"
                                                value={form.shippingArea}
                                                onChange={handleChange}
                                                className="h-11 w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 px-4 pr-10 text-sm text-gray-800 outline-none focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-200 transition-all cursor-pointer"
                                            >
                                                {areas.map(a => (
                                                    <option key={a.id} value={a.value}>{a.label}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        Full Address <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="address" placeholder="House, Road, Area..."
                                        value={form.address} onChange={handleChange} rows={3}
                                        className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-200 transition-all resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT COLUMN ── */}
                    <div className="flex flex-col gap-5">

                        {/* Payment Method */}
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-5 py-4">
                                <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                                    <span className="h-5 w-1 rounded-full bg-gray-900" />
                                    Payment method
                                </h2>
                            </div>
                            {isOnlineDiscountActive && (
                                <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-xs font-medium text-amber-800">
                                    SSLCommerz ({onlineDiscountPercent}%) পেমেন্ট মেথড নির্বাচন করলে আপনি আকর্ষণীয় ডিসকাউন্ট পাবেন!
                                </div>
                            )}
                            <div className="grid grid-cols-2 divide-x divide-gray-100">
                                <button
                                    onClick={() => setPaymentMethod("sslcommerz")}
                                    className={`flex flex-col items-center justify-center gap-2 px-4 py-5 transition-all ${
                                        paymentMethod === "sslcommerz"
                                            ? "bg-blue-50 ring-2 ring-inset ring-blue-400"
                                            : "bg-white hover:bg-gray-50"
                                    }`}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <span className="inline-flex items-center justify-center rounded bg-blue-600 px-2 py-0.5 text-[10px] font-extrabold text-white tracking-tight">SSL</span>
                                        <span className="text-xs font-bold text-gray-700">Commerz</span>
                                    </div>
                                    <span className="text-[10px] text-gray-400">
                                        {isOnlineDiscountActive ? `${onlineDiscountPercent}% Discount` : "Online Payment"}
                                    </span>
                                    {paymentMethod === "sslcommerz" && (
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white text-[10px] font-bold">✓</span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setPaymentMethod("cod")}
                                    className={`flex flex-col items-center justify-center gap-2 px-4 py-5 transition-all ${
                                        paymentMethod === "cod"
                                            ? "bg-gray-900 ring-2 ring-inset ring-gray-700"
                                            : "bg-white hover:bg-gray-50"
                                    }`}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xl">💵</span>
                                        <span className={`text-xs font-bold ${paymentMethod === "cod" ? "text-white" : "text-gray-700"}`}>
                                            Cash On Delivery
                                        </span>
                                    </div>
                                    <span className={`text-[10px] ${paymentMethod === "cod" ? "text-gray-300" : "text-gray-400"}`}>
                                        Pay when received
                                    </span>
                                    {paymentMethod === "cod" && (
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-gray-900 text-[10px] font-bold">✓</span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-5 py-4">
                                <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                                    <span className="h-5 w-1 rounded-full bg-gray-900" />
                                    Order Summary
                                </h2>
                            </div>
                            <div className="p-5 flex flex-col gap-4">

                                {/* ── Coupon section ── */}
                                {appliedCoupon ? (
                                    /* Applied badge */
                                    <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                                            <div>
                                                <p className="text-xs font-bold text-green-800">
                                                    {appliedCoupon.code}
                                                    <span className="ml-1.5 font-normal text-green-700">
                                                        {appliedCoupon.discountType === "percent"
                                                            ? `(${appliedCoupon.discountValue}% ছাড়)`
                                                            : `(${formatBDT(appliedCoupon.discountValue)} ছাড়)`}
                                                    </span>
                                                </p>
                                                <p className="mt-0.5 text-[10px] text-green-600">
                                                    সাশ্রয় হচ্ছে: {formatBDT(couponDiscount)}
                                                    {appliedCoupon.maxDiscount > 0 &&
                                                        ` (সর্বোচ্চ ${formatBDT(appliedCoupon.maxDiscount)})`}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleRemoveCoupon}
                                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-green-200 text-green-500 hover:bg-green-100 hover:text-green-700 transition-colors"
                                            aria-label="Remove coupon"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ) : (
                                    /* Input row */
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Coupon Code"
                                                    value={couponInput}
                                                    onChange={e => {
                                                        setCouponInput(e.target.value)
                                                        if (couponError) setCouponError(null)
                                                    }}
                                                    onKeyDown={e => e.key === "Enter" && handleApplyCoupon()}
                                                    disabled={couponLoading}
                                                    className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-800 outline-none focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-200 transition-all disabled:opacity-60"
                                                />
                                            </div>
                                            <button
                                                onClick={handleApplyCoupon}
                                                disabled={!couponInput.trim() || couponLoading}
                                                className="h-11 min-w-[80px] rounded-lg bg-gray-900 px-5 text-sm font-bold text-white transition-colors hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                                            >
                                                {couponLoading ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : "Apply"}
                                            </button>
                                        </div>
                                        {couponError && (
                                            <p className="flex items-center gap-1.5 text-xs text-red-600">
                                                <X className="h-3 w-3 shrink-0" />
                                                {couponError}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Totals */}
                                <div className="flex flex-col gap-2.5 rounded-lg bg-gray-100 p-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="font-semibold text-gray-800">{formatBDT(subtotal)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">Delivery Charge</span>
                                        {isFreeDelivery ? (
                                            <span className="flex items-center gap-2">
                                                <span className="text-xs text-gray-400 line-through">{formatBDT(form.shippingArea)}</span>
                                                <span className="font-semibold text-green-600">Free</span>
                                            </span>
                                        ) : (
                                            <span className="font-semibold text-gray-800">{formatBDT(deliveryCharge)}</span>
                                        )}
                                    </div>
                                    {couponDiscount > 0 && appliedCoupon && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-green-600">
                                                Coupon ({appliedCoupon.code})
                                            </span>
                                            <span className="font-semibold text-green-600">-{formatBDT(couponDiscount)}</span>
                                        </div>
                                    )}
                                    {onlinePaymentDiscount > 0 && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-blue-600">Online Payment Discount ({onlineDiscountPercent}%)</span>
                                            <span className="font-semibold text-blue-600">-{formatBDT(onlinePaymentDiscount)}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between border-t border-gray-200 pt-2.5">
                                        <span className="font-bold text-gray-900">Total</span>
                                        <span className="text-xl font-extrabold text-gray-900">{formatBDT(total)}</span>
                                    </div>
                                </div>

                                {/* Advance payment notice */}
                                {advanceApplies && advanceRule && (
                                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
                                        <p className="font-semibold">
                                            অগ্রিম পরিশোধ প্রয়োজন: {formatBDT(advanceAmount)}
                                            {advanceRule.advance_payment_type !== "full" && ` (${advanceRule.advance_percentage}%)`}
                                        </p>
                                        <p className="mt-1 text-blue-600">
                                            অর্ডারটি কনফার্ম করতে অনুগ্রহ করে অগ্রিম পেমেন্ট সম্পন্ন করুন। বাকি টাকা ডেলিভারির সময় পরিশোধ করতে হবে।
                                        </p>
                                    </div>
                                )}

                                {/* Terms */}
                                <label className="flex items-start gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={agreed}
                                        onChange={e => setAgreed(e.target.checked)}
                                        className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-gray-900"
                                    />
                                    <span className="text-xs text-gray-500 leading-relaxed">
                                        I have read and agree to the{" "}
                                        <a href="#" className="font-semibold text-gray-700 underline hover:text-gray-900">Terms and Conditions</a>,{" "}
                                        <a href="#" className="font-semibold text-gray-700 underline hover:text-gray-900">Privacy Policy</a>{" & "}
                                        <a href="#" className="font-semibold text-gray-700 underline hover:text-gray-900">Refund and Return Policy</a>.
                                    </span>
                                </label>

                                {/* Note */}
                                <textarea
                                    name="note" placeholder="Order notes (optional)"
                                    value={form.note} onChange={handleChange} rows={2}
                                    className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-200 transition-all resize-none"
                                />

                                {/* Order error */}
                                {orderError && (
                                    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                                        <X className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                        <span>{orderError}</span>
                                    </div>
                                )}

                                {/* Submit */}
                                <button
                                    onClick={handleSubmit}
                                    disabled={!canSubmit || orderLoading}
                                    className="flex items-center cursor-pointer justify-center gap-2 h-13 rounded-lg bg-gray-900 py-3.5 font-bold text-white text-sm tracking-wide transition-all hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                                >
                                    {orderLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            অর্ডার প্রক্রিয়া হচ্ছে…
                                        </>
                                    ) : "অর্ডার নিশ্চিত করুন"}
                                </button>

                                {/* Countdown */}
                                {/*<div className={`flex items-center justify-center gap-2 rounded-lg py-2 px-3 ${timerUrgent ? "bg-red-50" : "bg-gray-50"}`}>*/}
                                {/*    <Clock className={`h-4 w-4 ${timerUrgent ? "text-red-500" : "text-gray-400"}`} />*/}
                                {/*    <span className={`text-xs font-medium ${timerUrgent ? "text-red-500" : "text-gray-500"}`}>*/}
                                {/*        Special Offer Ends In:*/}
                                {/*    </span>*/}
                                {/*    <span className={`text-sm font-extrabold tabular-nums ${timerUrgent ? "text-red-600" : "text-gray-800"}`} suppressHydrationWarning>*/}
                                {/*        {mm}:{ss}*/}
                                {/*    </span>*/}
                                {/*</div>*/}

                                {/* Notice */}
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                    <div className="flex gap-2.5">
                                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-800 text-white text-[10px] font-bold">i</span>
                                        <p className="text-xs text-red-600 leading-relaxed">
                                            বিশেষ দ্রষ্টব্য: অনুগ্রহ করে ১০০% নিশ্চিত হয়ে অর্ডার করুন। অর্ডার করার আগে প্রোডাক্টের ছবি, বর্ণনা ও বিস্তারিত তথ্য ভালোভাবে দেখে নিন।

                                            যদি ছবি ও বর্ণনার সাথে পণ্যের সম্পূর্ণ মিল থাকা সত্ত্বেও আপনি ব্যক্তিগত কারণে পণ্য গ্রহণ করতে না চান, সেক্ষেত্রে কুরিয়ার চার্জ ১২০ টাকা ডেলিভারি ম্যানকে প্রদান করে পণ্যটি রিটার্ন করতে হবে।

                                            অপ্রয়োজনীয় বা মজা করে অর্ডার করা থেকে বিরত থাকুন। প্রতিটি অর্ডারের তথ্য আমাদের সিস্টেমে সংরক্ষিত থাকে, যার মধ্যে মোবাইল নম্বর, ডেলিভারি ঠিকানা এবং ডিভাইস আইপি লগ অন্তর্ভুক্ত থাকতে পারে।

                                            🛒
                                            একই ডেলিভারি চার্জে আরও প্রয়োজনীয় প্রোডাক্ট যোগ করে অর্ডার করতে পারেন।

                                            আপনার সহযোগিতার জন্য আন্তরিক ধন্যবাদ। ❤️
                                        </p>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between">
                                        <span className="text-xs font-semibold text-red-600">To get more products with the same delivery charge</span>
                                        <button
                                            onClick={() => router.push("/shop")}
                                            className="rounded-lg bg-gray-800 px-4 py-1.5 text-xs font-semibold text-white hover:bg-gray-700 transition-colors"
                                        >
                                            Click Here
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}