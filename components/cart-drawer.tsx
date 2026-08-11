"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { X, Trash2, ShoppingBag, Plus, Minus } from "lucide-react"
import { useCart } from "@/lib/cart-context"

function formatBDT(n: number) {
    return "৳" + n.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function CartDrawer() {
    const { items, isOpen, closeCart, removeItem, updateQty, totalItems, totalPrice } = useCart()
    const panelRef = useRef<HTMLDivElement>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => { setMounted(true) }, [])

    useEffect(() => {
        if (!isOpen) return
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeCart() }
        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [isOpen, closeCart])

    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : ""
        return () => { document.body.style.overflow = "" }
    }, [isOpen])

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
                onClick={closeCart}
                aria-hidden="true"
            />

            {/* Panel */}
            <div
                ref={panelRef}
                role="dialog"
                aria-label="Shopping cart"
                aria-modal="true"
                className={`fixed right-0 top-0 z-[90] flex h-full w-full max-w-[420px] flex-col bg-background shadow-2xl transition-transform duration-300 ease-in-out ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5 text-foreground" />
                        <h2 className="text-base font-extrabold text-foreground">
                            কার্ট
                            {mounted && totalItems > 0 && (
                                <span className="ml-2 rounded-full bg-[#EE2430] px-2 py-0.5 text-xs font-bold text-white">
                                    {totalItems}
                                </span>
                            )}
                        </h2>
                    </div>
                    <button
                        onClick={closeCart}
                        aria-label="Close cart"
                        className="grid h-8 w-8 place-items-center rounded-full border border-border text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Items — scrollable middle */}
                <div className="flex-1 overflow-y-auto px-5 py-4">
                    {!mounted || items.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                            <ShoppingBag className="h-12 w-12 opacity-20" />
                            <p className="text-sm">আপনার কার্ট খালি</p>
                        </div>
                    ) : (
                        <ul className="space-y-4">
                            {items.map((item) => (
                                // id alone isn't unique once variants exist — Red-M and Blue-L
                                // of the same product share an id, so the key must include variation.
                                <li key={`${item.id}::${item.variation ?? ""}`} className="flex gap-3">
                                    {/* Thumbnail */}
                                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-secondary">
                                        {item.image && (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex flex-1 flex-col justify-between">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="line-clamp-2 text-sm font-medium text-foreground leading-snug">
                                                    {item.name}
                                                </p>
                                                {item.variation && (
                                                    <p className="mt-0.5 text-xs text-muted-foreground">{item.variation}</p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id, item.variation)}
                                                aria-label="Remove item"
                                                className="mt-0.5 flex-shrink-0 text-muted-foreground hover:text-destructive transition"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-[#EE2430]">
                                                {formatBDT(item.price * item.qty)}
                                            </span>

                                            {/* Qty stepper */}
                                            <div className="flex items-center gap-1 rounded-full border border-border px-1">
                                                <button
                                                    onClick={() => updateQty(item.id, item.qty - 1, item.variation)}
                                                    aria-label="Decrease quantity"
                                                    className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition"
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="min-w-[1.5rem] text-center text-sm font-semibold tabular-nums">
                                                    {item.qty}
                                                </span>
                                                <button
                                                    onClick={() => updateQty(item.id, item.qty + 1, item.variation)}
                                                    aria-label="Increase quantity"
                                                    className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Footer — totals + checkout */}
                {mounted && items.length > 0 && (
                    <div className="border-t border-border px-5 py-4 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">সাবটোটাল</span>
                            <span className="font-bold text-foreground">{formatBDT(totalPrice)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            শিপিং চার্জ চেকআউটে যোগ হবে
                        </p>

                        <a href="/checkout"
                           className="flex w-full items-center justify-center rounded-xl bg-[#EE2430] py-3 text-sm font-extrabold text-white transition hover:bg-[#c91d28] active:scale-[0.98]"
                        >
                            চেকআউট করুন
                        </a>
                    </div>
                )}
            </div>
        </>
    )
}