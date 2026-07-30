'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useCart } from '@/lib/cart-context'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react'

export default function CartPage() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart()


  const handleCheckout = () => {
    // if (!user) {
    //   router.push('/auth/login')
    //   return
    // }
    router.push('/checkout')
  }


  const total = totalPrice

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Breadcrumb */}
        <div className="px-4 md:px-6 py-4 bg-white border-b border-border">
          <div className="max-w-7xl mx-auto">
            <Link href="/" className="text-muted-foreground hover:text-primary">
              Home
            </Link>
            <span className="text-muted-foreground"> / Shopping Cart</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold text-foreground mb-4">Your cart is empty</h2>
              <p className="text-muted-foreground mb-8">Add some products to get started!</p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold mb-6 text-foreground">Shopping Cart</h2>

                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 bg-white border border-border rounded-lg p-4"
                    >
                      {/* Product Image */}
                      <div className="relative w-24 h-24 bg-muted rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <Link
                          href={`/product/${item.id}`}
                          className="font-semibold text-foreground hover:text-primary"
                        >
                          {item.name}
                        </Link>
                        <p className="text-primary font-bold mt-2">৳{item.price}</p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-4 border border-border rounded-lg w-fit">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, Math.max(1, item.quantity - 1))
                            }
                            className="px-3 py-1 hover:bg-muted transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-3 py-1 min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, Math.min(item.stock, item.quantity + 1))
                            }
                            className="px-3 py-1 hover:bg-muted transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Price and Remove */}
                      <div className="text-right flex flex-col justify-between">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <p className="font-bold text-foreground">
                          ৳{item.price * item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Continue Shopping */}
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary/5 font-medium mt-6"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Continue Shopping
                </Link>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white border border-border rounded-lg p-6 sticky top-24">
                  <h3 className="text-lg font-bold mb-6 text-foreground">Order Summary</h3>

                  <div className="space-y-3 mb-6 pb-6 border-b border-border">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-semibold text-foreground">৳{totalPrice}</span>
                    </div>

                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <span className="text-lg font-bold text-foreground">Total:</span>
                    <span className="text-2xl font-bold text-primary">৳{total}</span>
                  </div>

                  {/*{!user && (*/}
                  {/*  <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">*/}
                  {/*    <p className="text-sm text-blue-600">*/}
                  {/*      Please{' '}*/}
                  {/*      <Link href="/auth/login" className="font-semibold hover:underline">*/}
                  {/*        sign in*/}
                  {/*      </Link>{' '}*/}
                  {/*      to checkout*/}
                  {/*    </p>*/}
                  {/*  </div>*/}
                  {/*)}*/}

                  <button
                    onClick={handleCheckout}
                    className="w-full bg-primary cursor-pointer text-white py-3 rounded-lg hover:bg-primary/90 font-semibold transition-colors mb-3"
                  >
                    Proceed to Checkout
                  </button>

                  <button
                    onClick={() => clearCart()}
                    className="w-full border-2 border-red-200 text-red-600 py-3 rounded-lg hover:bg-red-50 font-semibold transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
