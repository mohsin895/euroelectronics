// lib/checkout-pricing.ts
// Pure functions that turn cart-setting + shipping-charge data into the
// numbers the checkout page needs to display and submit.

import type { AdvanceRule, CartSettings, ShippingChargeOption } from './api'

export interface PricingResult {
    deliveryCharge: number
    isFreeDelivery: boolean
    discount: number
    matchedAdvanceRule: AdvanceRule | null
    advancePaymentRequired: boolean
    advancePaymentAmount: number
    grandTotal: number
}

function isDiscountCurrentlyValid(settings: CartSettings): boolean {
    const now = new Date()
    if (settings.discount_valid_from && now < new Date(settings.discount_valid_from)) return false
    if (settings.discount_valid_until && now > new Date(settings.discount_valid_until)) return false
    return true
}

/** Picks the best-matching active advance rule for a given subtotal. */
function findAdvanceRule(rules: AdvanceRule[], subtotal: number): AdvanceRule | null {
    const candidates = rules.filter(
        (r) =>
            r.is_active &&
            subtotal >= Number(r.min_order_amount) &&
            (r.max_order_amount === null || subtotal <= Number(r.max_order_amount))
    )
    if (candidates.length === 0) return null
    // Prefer the most specific rule (highest sort_order wins ties)
    return candidates.sort((a, b) => b.sort_order - a.sort_order)[0]
}

export function computePricing(
    settings: CartSettings | null,
    selectedShipping: ShippingChargeOption | null,
    subtotal: number,
    paymentMethod: string
): PricingResult {
    if (!settings) {
        return {
            deliveryCharge: 0,
            isFreeDelivery: false,
            discount: 0,
            matchedAdvanceRule: null,
            advancePaymentRequired: false,
            advancePaymentAmount: 0,
            grandTotal: subtotal,
        }
    }

    const freeMin = Number(settings.free_delivery_min_order || 0)
    const isFreeDelivery = freeMin > 0 && subtotal >= freeMin

    const deliveryCharge = isFreeDelivery
        ? 0
        : selectedShipping
            ? Number(selectedShipping.shipping_charge)
            : Number(settings.default_delivery_charge || 0)

    const discountEligible =
        settings.online_payment_discount_enabled &&
        paymentMethod === 'online' &&
        isDiscountCurrentlyValid(settings)

    const discount = discountEligible
        ? Math.round(subtotal * (settings.online_payment_discount_percent / 100) * 100) / 100
        : 0

    const grandTotal = Math.max(subtotal + deliveryCharge - discount, 0)

    const matchedAdvanceRule = settings.delivery_charge_advance_required
        ? findAdvanceRule(settings.advance_rules || [], subtotal)
        : null

    const advancePaymentRequired = !!matchedAdvanceRule
    const advancePaymentAmount = matchedAdvanceRule
        ? matchedAdvanceRule.advance_payment_type === 'full'
            ? grandTotal
            : Math.round(grandTotal * (matchedAdvanceRule.advance_percentage / 100) * 100) / 100
        : 0

    return {
        deliveryCharge,
        isFreeDelivery,
        discount,
        matchedAdvanceRule,
        advancePaymentRequired,
        advancePaymentAmount,
        grandTotal,
    }
}