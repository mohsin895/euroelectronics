"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"

export interface CartItem {
    id: number | string
    name: string
    price: number
    qty: number
    image?: string
    variation?: string | null
    variantId?: number | null   // ← ADD: stock row id
    tax?: number
}

interface CartContextValue {
    items: CartItem[]
    isOpen: boolean
    openCart: () => void
    closeCart: () => void
    addItem: (item: Omit<CartItem, "qty"> & { qty?: number }) => void
    addItemAndOpen: (item: Omit<CartItem, "qty"> & { qty?: number }) => void
    removeItem: (id: CartItem["id"], variation?: string | null) => void
    updateQty: (id: CartItem["id"], qty: number, variation?: string | null) => void
    clearCart: () => void
    totalItems: number
    totalPrice: number
}

const CartContext = createContext<CartContextValue | null>(null)

// ── helper ───────────────────────────────────────────────────────────────────
function readLocalCart(): CartItem[] {
    try {
        const saved = localStorage.getItem("cart")
        return saved ? JSON.parse(saved) : []
    } catch {
        return []
    }
}

// A product id alone is not a unique line-item key once variants exist —
// Red-M and Blue-L of the same product must stay separate lines.
function sameLine(a: { id: CartItem["id"]; variation?: string | null }, b: { id: CartItem["id"]; variation?: string | null }) {
    return a.id === b.id && (a.variation ?? null) === (b.variation ?? null)
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(() => {
        if (typeof window === "undefined") return []
        return readLocalCart()
    })
    const [isOpen, setIsOpen] = useState(false)

    // ── persist on every change ──────────────────────────────────────────────
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(items))
    }, [items])

    const clearCart = useCallback(() => {
        setItems([])
    }, [])
    // ── re-hydrate when back button restores page from bfcache ───────────────
    useEffect(() => {
        const onPageShow = (e: PageTransitionEvent) => {
            if (e.persisted) setItems(readLocalCart())
        }
        window.addEventListener("pageshow", onPageShow)
        return () => window.removeEventListener("pageshow", onPageShow)
    }, [])

    // ── keep multiple tabs in sync ───────────────────────────────────────────
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === "cart" && e.newValue !== null) {
                try { setItems(JSON.parse(e.newValue)) } catch { /* ignore */ }
            }
        }
        window.addEventListener("storage", onStorage)
        return () => window.removeEventListener("storage", onStorage)
    }, [])

    const openCart  = useCallback(() => setIsOpen(true), [])
    const closeCart = useCallback(() => setIsOpen(false), [])

    const addItem = useCallback((incoming: Omit<CartItem, "qty"> & { qty?: number }) => {
        const addQty = incoming.qty ?? 1
        setItems(prev => {
            const existing = prev.find(i => sameLine(i, incoming))
            if (existing) return prev.map(i => sameLine(i, incoming) ? { ...i, qty: i.qty + addQty } : i)
            return [...prev, { ...incoming, qty: addQty }]
        })
    }, [])

    const addItemAndOpen = useCallback((incoming: Omit<CartItem, "qty"> & { qty?: number }) => {
        const addQty = incoming.qty ?? 1
        setItems(prev => {
            const existing = prev.find(i => sameLine(i, incoming))
            if (existing) return prev.map(i => sameLine(i, incoming) ? { ...i, qty: i.qty + addQty } : i)
            return [...prev, { ...incoming, qty: addQty }]
        })
        setIsOpen(true)
    }, [])

    const removeItem = useCallback((id: CartItem["id"], variation?: string | null) => {
        setItems(prev =>
            variation === undefined
                ? prev.filter(i => i.id !== id) // legacy call sites: drop every line for this id
                : prev.filter(i => !sameLine(i, { id, variation }))
        )
    }, [])

    const updateQty = useCallback((id: CartItem["id"], qty: number, variation?: string | null) => {
        const matches = (i: CartItem) => variation === undefined ? i.id === id : sameLine(i, { id, variation })
        if (qty <= 0) {
            setItems(prev => prev.filter(i => !matches(i)))
        } else {
            setItems(prev => prev.map(i => matches(i) ? { ...i, qty } : i))
        }
    }, [])

    const totalItems = items.reduce((sum, i) => sum + i.qty, 0)
    const totalPrice = items.reduce((sum, i) => sum + i.price * i.qty, 0)

    return (
        <CartContext.Provider value={{
            items, isOpen,
            openCart, closeCart,
            addItem, addItemAndOpen,
            removeItem, updateQty,
            clearCart,
            totalItems, totalPrice,
        }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const ctx = useContext(CartContext)
    if (!ctx) throw new Error("useCart must be used inside CartProvider")
    return ctx
}