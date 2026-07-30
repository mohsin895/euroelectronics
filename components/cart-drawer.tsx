'use client'

import { useCart } from '@/lib/cart-context'
import Link from 'next/link'
import Image from 'next/image'
import { X, Plus, Minus, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'

interface CartProduct {
  id: number
  name: string
  price: number
  image: string
  quantity: number
}

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity } = useCart()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const total = subtotal

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl z-50 transform transition-transform duration-300 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 flex justify-between items-center p-4 border-b border-border bg-white">
          <h2 className="text-xl font-bold text-foreground">Shopping Cart</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-foreground" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">🛒</span>
              </div>
              <p className="text-foreground font-medium mb-2">Your cart is empty</p>
              <p className="text-sm text-muted-foreground mb-4">
                Add some products to get started!
              </p>
              <button
                onClick={onClose}
                className="text-primary hover:underline font-medium text-sm"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-border">
                  {/* Product Image */}
                  <div className="relative w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.name}
                    </p>
                    <p className="text-primary font-semibold mt-1">
                      ৳{item.price.toLocaleString()}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, Math.max(1, item.quantity - 1))
                        }
                        className="p-1 border border-border rounded hover:bg-muted transition-colors"
                      >
                        <Minus className="w-3 h-3 text-foreground" />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 border border-border rounded hover:bg-muted transition-colors"
                      >
                        <Plus className="w-3 h-3 text-foreground" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto p-1 text-destructive hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="sticky bottom-0 border-t border-border bg-white p-4 space-y-4">
            {/* Promo */}
            <div className="bg-primary/10 rounded-lg p-3">
              <p className="text-xs text-primary font-medium">
                Add ৳{Math.max(0, 700 - subtotal)} more to unlock free shipping!
              </p>
              <div className="w-full bg-primary/20 rounded-full h-1.5 mt-2">
                <div
                  className="bg-primary h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (subtotal / 700) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-foreground">
                <span>Subtotal</span>
                <span className="font-medium">৳{subtotal.toLocaleString()}</span>
              </div>

              <div className="border-t border-border pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">৳{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <Link
              href="/checkout"
              onClick={onClose}
              className="block w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors text-center"
            >
              Checkout
            </Link>

            {/* Continue Shopping */}
            <button
              onClick={onClose}
              className="w-full py-2 border-2 border-primary cursor-pointer text-primary font-medium rounded-lg hover:bg-primary/5 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  )
}
