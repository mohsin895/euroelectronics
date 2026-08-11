"use client"

import { ShoppingCart } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useState, useEffect } from "react"

export function CartButton() {
    const { openCart, totalItems } = useCart()
    const [mounted, setMounted] = useState(false)

    useEffect(() => { setMounted(true) }, [])

    return (
        <button
            onClick={openCart}
            aria-label="Open cart"
            className="relative cursor-pointer text-foreground hover:text-[#EE2430] transition-colors"
        >
            <ShoppingCart className="h-6 w-6" />
            {mounted && totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#EE2430] text-[10px] font-bold text-white leading-none">
                    {totalItems}
                </span>
            )}
        </button>
    )
}