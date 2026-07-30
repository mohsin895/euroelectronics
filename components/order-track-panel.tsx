"use client"

import { useState, type FormEvent } from "react"
import { useSearchParams } from "next/navigation"

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN ?? ""

const DELIVERY_STEPS = ["pending", "confirmed", "picked_up", "on_the_way", "delivered"]
const STEP_LABELS: Record<string, string> = {
    pending:    "Pending",
    confirmed:  "Confirmed",
    picked_up:  "Picked Up",
    on_the_way: "On The Way",
    delivered:  "Delivered",
    cancelled:  "Cancelled",
}

interface OrderResult {
    id: number
    code: string
    delivery_status: string
    payment_type: string
    payment_status: string
    grand_total: number
    coupon_discount: number
    date: number
    shipping_address: string
}

export function OrderTrackPanel() {
    const searchParams  = useSearchParams()
    const prefillCode   = searchParams.get("order_code") ?? ""

    const [phone,   setPhone]   = useState("")
    const [invoice, setInvoice] = useState(prefillCode)
    const [loading, setLoading] = useState(false)
    const [order,   setOrder]   = useState<OrderResult | null>(null)
    const [error,   setError]   = useState<string | null>(null)

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        setError(null)
        setOrder(null)
        setLoading(true)

        try {
            const params = new URLSearchParams()
            if (phone)   params.set("phone",      phone.startsWith("0") ? `880${phone.slice(1)}` : phone)
            if (invoice) params.set("order_code", invoice)

            const res  = await fetch(`${DOMAIN}/track-your-order?${params}`, {
                headers: { Accept: "application/json" },
            })
            const json = await res.json()

            if (json.success && json.order) {
                setOrder(json.order)
            } else {
                setError(json.message ?? "No order found. Please check your details.")
            }
        } catch {
            setError("Could not reach the server. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const inputCls = "w-full rounded-full border border-border bg-background py-3 pl-11 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"

    // Determine current step index
    const stepIndex = order ? DELIVERY_STEPS.indexOf(order.delivery_status) : -1
    const isCancelled = order?.delivery_status === "cancelled"

    // Parse shipping address
    let shippingName = ""
    let shippingAddr = ""
    if (order?.shipping_address) {
        try {
            const addr = JSON.parse(order.shipping_address)
            shippingName = addr.name ?? ""
            shippingAddr = [addr.address, addr.city, addr.state].filter(Boolean).join(", ")
        } catch { /* ignore */ }
    }

    return (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {/* Dark header */}
            <div
                className="relative flex flex-col items-center gap-3 bg-foreground px-6 py-10 text-background"
                style={{
                    backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                }}
            >
                {/* Truck icon */}
                <div className="text-4xl">🚚</div>
                <h1 className="text-2xl font-extrabold">Track Your Order</h1>
                <p className="text-sm text-background/60">Enter your details to see the delivery status</p>
            </div>

            {/* Form */}
            <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Phone */}
                    {/*<div>*/}
                    {/*    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold">*/}
                    {/*        📞 Phone Number <span className="text-red-500">*</span>*/}
                    {/*    </label>*/}
                    {/*    <div className="relative">*/}
                    {/*        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">📱</span>*/}
                    {/*        <input*/}
                    {/*            type="tel"*/}
                    {/*            placeholder="Enter registered phone number"*/}
                    {/*            value={phone}*/}
                    {/*            onChange={e => setPhone(e.target.value)}*/}
                    {/*            className={inputCls}*/}
                    {/*        />*/}
                    {/*    </div>*/}
                    {/*</div>*/}

                    {/* Invoice ID */}
                    <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold">
                            🧾 Invoice ID <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">#</span>
                            <input
                                type="text"
                                placeholder="Ex: 100001"
                                value={invoice}
                                onChange={e => setInvoice(e.target.value)}
                                className={inputCls}
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || (!phone && !invoice)}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-3.5 text-sm font-bold tracking-widest text-background transition-opacity hover:opacity-90 disabled:opacity-40"
                    >
                        🔍 {loading ? "TRACKING..." : "TRACK NOW"}
                    </button>

                    <p className="text-center text-sm text-muted-foreground">
                        Having issues?{" "}
                        <a href="/contact-us" className="font-bold text-foreground hover:underline">
                            Contact Support
                        </a>
                    </p>
                </form>

                {/* ── Result ── */}
                {order && (
                    <div className="mt-8 space-y-6">
                        <hr className="border-border" />

                        {/* Order info */}
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                            {[
                                { label: "Order Code",   value: order.code },
                                { label: "Total",        value: `৳${order.grand_total}` },
                                { label: "Discount",     value: `৳${order.coupon_discount}` },
                                { label: "Payment",      value: order.payment_type },
                                { label: "Paid",         value: order.payment_status },
                                { label: "Date",         value: new Date(order.date * 1000).toLocaleDateString() },
                            ].map(({ label, value }) => (
                                <div key={label} className="rounded-xl border border-border p-3">
                                    <p className="text-[11px] font-semibold tracking-widest text-muted-foreground">{label.toUpperCase()}</p>
                                    <p className="mt-1 text-sm font-bold capitalize">{value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Shipping address */}
                        {shippingName && (
                            <div className="rounded-xl border border-border p-4">
                                <p className="mb-1 text-[11px] font-semibold tracking-widest text-muted-foreground">SHIPPING TO</p>
                                <p className="text-sm font-bold">{shippingName}</p>
                                {shippingAddr && <p className="text-sm text-muted-foreground">{shippingAddr}</p>}
                            </div>
                        )}

                        {/* Status stepper */}
                        {isCancelled ? (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm font-bold text-red-600">
                                ❌ This order has been cancelled.
                            </div>
                        ) : (
                            <div>
                                <p className="mb-4 text-[11px] font-semibold tracking-widest text-muted-foreground">DELIVERY STATUS</p>
                                <div className="relative flex items-center justify-between">
                                    {/* Track line */}
                                    <div className="absolute left-0 right-0 top-4 h-0.5 bg-border" />
                                    <div
                                        className="absolute left-0 top-4 h-0.5 bg-foreground transition-all duration-500"
                                        style={{ width: stepIndex >= 0 ? `${(stepIndex / (DELIVERY_STEPS.length - 1)) * 100}%` : "0%" }}
                                    />

                                    {DELIVERY_STEPS.map((step, i) => {
                                        const done    = i <= stepIndex
                                        const current = i === stepIndex
                                        return (
                                            <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                                                <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors
                                                    ${done
                                                    ? "border-foreground bg-foreground text-background"
                                                    : "border-border bg-card text-muted-foreground"
                                                } ${current ? "ring-4 ring-foreground/20" : ""}`}
                                                >
                                                    {done ? "✓" : i + 1}
                                                </div>
                                                <span className={`text-center text-[10px] font-semibold leading-tight
                                                    ${done ? "text-foreground" : "text-muted-foreground"}`}
                                                >
                                                    {STEP_LABELS[step]}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}