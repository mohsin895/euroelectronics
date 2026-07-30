'use client'

import { useCart } from '@/lib/cart-context'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useEffect, useState } from 'react'

export function FloatingCart() {
  const { items, totalItems } = useCart()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (totalItems === 0) return null

  return (
    <div className="fixed right-6 bottom-6 z-40 md:right-8 md:bottom-8">
      <Link
        href="/cart"
        className="group relative flex flex-col items-center"
      >
        {/* Floating Cart Box */}
        <div className="mb-4 bg-white border-2 border-primary rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          {/* Items Count Badge */}
          <div className="bg-primary text-white px-4 py-2 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <span className="font-semibold">{totalItems} Items</span>
            </span>
          </div>

          {/* Total Price */}
          <div className="bg-white px-4 py-3 text-center">
            <p className="text-sm text-muted-foreground mb-1">Total:</p>
            <p className="text-2xl md:text-3xl font-bold text-primary">
              ৳{subtotal.toLocaleString()}
            </p>
          </div>

          {/* CTA */}
          <div className="bg-muted px-4 py-2 text-center border-t border-border">
            <p className="text-xs font-medium text-foreground hover:text-primary cursor-pointer">
              View Cart →
            </p>
          </div>
        </div>

        {/* Floating Icon (always visible as fallback) */}
        {/*<button*/}
        {/*  className="p-3 bg-primary text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"*/}
        {/*  aria-label="View shopping cart"*/}
        {/*>*/}
        {/*  <ShoppingCart className="w-6 h-6" />*/}
        {/*  {totalItems > 0 && (*/}
        {/*    <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">*/}
        {/*      {totalItems}*/}
        {/*    </span>*/}
        {/*  )}*/}
        {/*</button>*/}
      </Link>
    </div>
  )
}
