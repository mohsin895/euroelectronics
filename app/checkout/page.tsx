'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useCart } from '@/lib/cart-context'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { CheckCircle, Loader2, Minus, Plus, Trash2 } from 'lucide-react'
import {
    fetchCartSetting,
    fetchShippingCharge,
    storeOrder,
    type CartSettings,
    type ShippingChargeOption,
} from '@/lib/api'
import { computePricing } from '@/lib/checkout-pricing'

export default function CheckoutPage() {
    const { items, totalPrice, clearCart, updateQuantity, removeItem } = useCart()


    const [isProcessing, setIsProcessing] = useState(false)
    const [orderPlaced, setOrderPlaced] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [paymentMethod, setPaymentMethod] = useState<string>('cod')

    // Data loaded from the backend
    const [cartSettings, setCartSettings] = useState<CartSettings | null>(null)
    const [shippingOptions, setShippingOptions] = useState<ShippingChargeOption[]>([])
    const [selectedShippingId, setSelectedShippingId] = useState<number | null>(null)
    const [loadingSettings, setLoadingSettings] = useState(true)
    const [settingsError, setSettingsError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        phone:  '',
        name:  '',
        address:  '',
        city: '',
        postalCode: '',
    })

    // Load cart settings + shipping charges once on mount
    useEffect(() => {
        let cancelled = false

        async function loadCheckoutData() {
            setLoadingSettings(true)
            setSettingsError(null)
            try {
                const [settings, shipping] = await Promise.all([
                    fetchCartSetting(),
                    fetchShippingCharge(),
                ])
                if (cancelled) return

                setCartSettings(settings)

                const activeOptions = (Array.isArray(shipping) ? shipping : []).filter(
                    (s) => s.status === 'active'
                )
                setShippingOptions(activeOptions)
                if (activeOptions.length > 0) {
                    setSelectedShippingId(activeOptions[0].id)
                }
            } catch (error) {
                console.error('[checkout] Failed to load cart settings / shipping charges:', error)
                if (!cancelled) {
                    setSettingsError('Could not load delivery options. Please refresh and try again.')
                }
            } finally {
                if (!cancelled) setLoadingSettings(false)
            }
        }

        loadCheckoutData()
        return () => {
            cancelled = true
        }
    }, [])

    const selectedShipping =
        shippingOptions.find((s) => s.id === selectedShippingId) || null

    const pricing = computePricing(cartSettings, selectedShipping, totalPrice, paymentMethod)

    if (items.length === 0) {
        return (
            <>
                <Header />
                <main className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-muted-foreground mb-4">Your cart is empty</p>
                        <Link
                            href="/shop"
                            className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </main>
                <Footer />
            </>
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitError(null)

        if (!selectedShipping && !pricing.isFreeDelivery) {
            setSubmitError('Please select a delivery location.')
            return
        }

        setIsProcessing(true)
        try {
            await storeOrder({
                name: formData.name,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                postal_code: formData.postalCode,
                payment_method: paymentMethod,
                shipping_charge_id: selectedShipping?.id ?? null,
                shipping_charge: pricing.deliveryCharge,
                subtotal: totalPrice,
                discount: pricing.discount,
                advance_payment_required: pricing.advancePaymentRequired,
                advance_payment_amount: pricing.advancePaymentAmount,
                total: pricing.grandTotal,
                items: items.map((item) => ({
                    product_id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                })),
            })

            setOrderPlaced(true)
            clearCart()
        } catch (error) {
            console.error('[checkout] Order submission failed:', error)
            setSubmitError(
                error instanceof Error ? error.message : 'Something went wrong placing your order.'
            )
        } finally {
            setIsProcessing(false)
        }
    }

    if (orderPlaced) {
        return (
            <>
                <Header />
                <main className="min-h-screen flex items-center justify-center">
                    <div className="max-w-md text-center">
                        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                        <h1 className="text-3xl font-bold text-foreground mb-2">Order Placed!</h1>
                        <p className="text-muted-foreground mb-6">
                            Thank you for your order. We will process it shortly and notify you via email and phone.
                        </p>
                        <p className="text-sm text-muted-foreground mb-6">
                            Order Total: <span className="font-bold text-foreground">৳{pricing.grandTotal}</span>
                        </p>
                        <Link
                            href="/shop"
                            className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </main>
                <Footer />
            </>
        )
    }

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
                        <span className="text-muted-foreground"> / </span>
                        <Link href="/cart" className="text-muted-foreground hover:text-primary">
                            Cart
                        </Link>
                        <span className="text-muted-foreground"> / Checkout</span>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                    <h1 className="text-3xl font-bold mb-8 text-foreground">Checkout</h1>

                    {settingsError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                            {settingsError}
                        </div>
                    )}

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Checkout Form */}
                        <div className="lg:col-span-2">
                            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                                {/* Shipping Address */}
                                <div className="bg-white border border-border rounded-lg p-6">
                                    <h3 className="text-lg font-bold mb-4 text-foreground">Shipping Address</h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-1">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                                                }
                                                className="w-full px-4 py-2 border border-border rounded"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-1">
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                                                }
                                                className="w-full px-4 py-2 border border-border rounded"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-1">
                                                Address
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.address}
                                                onChange={(e) =>
                                                    setFormData((prev) => ({ ...prev, address: e.target.value }))
                                                }
                                                className="w-full px-4 py-2 border border-border rounded"
                                                required
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-foreground mb-1">
                                                    City
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.city}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({ ...prev, city: e.target.value }))
                                                    }
                                                    className="w-full px-4 py-2 border border-border rounded"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-foreground mb-1">
                                                    Postal Code
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.postalCode}
                                                    onChange={(e) =>
                                                        setFormData((prev) => ({ ...prev, postalCode: e.target.value }))
                                                    }
                                                    className="w-full px-4 py-2 border border-border rounded"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Delivery Location / Shipping Charge */}
                                <div className="bg-white border border-border rounded-lg p-6">
                                    <h3 className="text-lg font-bold mb-4 text-foreground">Delivery Location</h3>

                                    {loadingSettings ? (
                                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Loading delivery options...
                                        </div>
                                    ) : shippingOptions.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                            No delivery locations available right now.
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {shippingOptions.map((option) => (
                                                <label
                                                    key={option.id}
                                                    className="flex items-center justify-between gap-3 p-3 border border-border rounded cursor-pointer hover:bg-muted transition-colors"
                                                >
                          <span className="flex items-center gap-3">
                            <input
                                type="radio"
                                name="shipping"
                                value={option.id}
                                checked={selectedShippingId === option.id}
                                onChange={() => setSelectedShippingId(option.id)}
                                className="w-4 h-4"
                            />
                            <span className="font-medium text-foreground">{option.name}</span>
                          </span>
                                                    <span className="text-sm text-muted-foreground">
                            ৳{Number(option.shipping_charge)}
                          </span>
                                                </label>
                                            ))}
                                            {pricing.isFreeDelivery && (
                                                <p className="text-sm text-green-600 font-medium">
                                                    Your order qualifies for free delivery!
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Payment Method */}
                                <div className="bg-white border border-border rounded-lg p-6">
                                    <h3 className="text-lg font-bold mb-4 text-foreground">Payment Method</h3>

                                    <div className="space-y-3">
                                        {[
                                            { id: 'cod', label: 'Cash On Delivery', icon: '💵' },
                                            { id: 'online', label: 'Online Payment', icon: '💳' },
                                            { id: 'bkash', label: 'bKash', icon: '📱' },
                                        ].map((method) => (
                                            <label
                                                key={method.id}
                                                className="flex items-center gap-3 p-3 border border-border rounded cursor-pointer hover:bg-muted transition-colors"
                                            >
                                                <input
                                                    type="radio"
                                                    name="payment"
                                                    value={method.id}
                                                    checked={paymentMethod === method.id}
                                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                                    className="w-4 h-4"
                                                />
                                                <span>{method.icon}</span>
                                                <span className="font-medium text-foreground">{method.label}</span>
                                            </label>
                                        ))}
                                    </div>

                                    {cartSettings?.online_payment_discount_enabled && (
                                        <p className="text-sm text-green-600 mt-3">
                                            Pay online and save {cartSettings.online_payment_discount_percent}%
                                        </p>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white border border-border rounded-lg p-6 sticky top-24">
                                <h3 className="text-lg font-bold mb-6 text-foreground">Order Summary</h3>

                                <div className="space-y-3 max-h-80 overflow-y-auto mb-6 pb-6 border-b border-border">
                                    {items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex gap-3 pb-3 border-b border-border last:border-0 last:pb-0"
                                        >
                                            <Link
                                                href={`/product/${item.id}`}
                                                className="relative w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0"
                                            >
                                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                                            </Link>

                                            <div className="flex-1 min-w-0">
                                                <Link
                                                    href={`/product/${item.id}`}
                                                    className="font-medium text-foreground text-sm hover:text-primary line-clamp-1"
                                                >
                                                    {item.name}
                                                </Link>
                                                <p className="text-sm text-muted-foreground mb-2">৳{item.price} each</p>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center border border-border rounded">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="p-1.5 hover:bg-muted transition-colors"
                                                            aria-label="Decrease quantity"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            disabled={item.quantity >= item.stock}
                                                            className="p-1.5 hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                            aria-label="Increase quantity"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(item.id)}
                                                        className="p-1.5 text-muted-foreground hover:text-red-600 transition-colors"
                                                        aria-label={`Remove ${item.name} from cart`}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <p className="font-semibold text-foreground text-sm whitespace-nowrap">
                                                ৳{item.quantity * item.price}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3 mb-6 pb-6 border-b border-border">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal:</span>
                                        <span className="font-semibold text-foreground">৳{totalPrice}</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Delivery Charge:</span>
                                        <span className="font-semibold text-foreground">
                      {pricing.isFreeDelivery ? 'Free' : `৳${pricing.deliveryCharge}`}
                    </span>
                                    </div>

                                    {pricing.discount > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Online Payment Discount:</span>
                                            <span className="font-semibold text-green-600">
                        -৳{pricing.discount}
                      </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-foreground">Total:</span>
                                    <span className="text-2xl font-bold text-primary">৳{pricing.grandTotal}</span>
                                </div>

                                {pricing.advancePaymentRequired && (
                                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                                        An advance payment of{' '}
                                        <span className="font-bold">৳{pricing.advancePaymentAmount}</span> is required
                                        for this order{pricing.matchedAdvanceRule?.label ? ` (${pricing.matchedAdvanceRule.label})` : ''}.
                                    </div>
                                )}

                                {submitError && (
                                    <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                                        {submitError}
                                    </div>
                                )}

                                {/* Submit Button — tied to the form via the form attribute since it now lives outside <form> */}
                                <button
                                    type="submit"
                                    form="checkout-form"
                                    disabled={isProcessing || loadingSettings}
                                    className="w-full mt-6 bg-primary text-white py-3 rounded-lg hover:bg-primary/90 font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {isProcessing
                                        ? 'Processing...'
                                        : pricing.advancePaymentRequired
                                            ? `Pay Advance ৳${pricing.advancePaymentAmount}`
                                            : 'Place Order'}
                                </button>

                                <Link
                                    href="/cart"
                                    className="block text-center text-primary hover:text-primary/80 text-sm mt-4 font-medium"
                                >
                                    Edit Cart
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}