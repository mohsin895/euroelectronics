import type { UiDiscountInfo } from '@/lib/products'

interface DiscountPriceBlockProps {
    discount: UiDiscountInfo
    size?: 'sm' | 'lg'
}

/**
 * Renders price + discount state consistently anywhere a product's price
 * is shown: current price, struck-through original price when a discount
 * is active, a "Save X%" badge, and a countdown if the discount is ending soon.
 */
export function DiscountPriceBlock({ discount, size = 'lg' }: DiscountPriceBlockProps) {
    const priceClass = size === 'lg' ? 'text-3xl font-bold' : 'text-lg font-bold'
    const originalClass = size === 'lg' ? 'text-lg' : 'text-sm'

    return (
        <div>
            <div className="flex items-baseline gap-3 flex-wrap">
        <span className={`${priceClass} text-primary`}>
          ৳{discount.finalPrice.toLocaleString()}
        </span>

                {discount.isActive && (
                    <>
            <span className={`${originalClass} text-muted-foreground line-through`}>
              ৳{discount.originalPrice.toLocaleString()}
            </span>
                        <span className="inline-block px-2.5 py-1 bg-green-500 text-white text-xs font-bold rounded-md">
              Save {discount.savedPercent}%
            </span>
                    </>
                )}
            </div>

            {discount.isActive && (
                <div className="mt-2 text-sm text-muted-foreground">
                    You save ৳{discount.savedAmount.toLocaleString()}
                    {discount.daysRemaining !== null && (
                        <>
                            {' '}
                            &middot;{' '}
                            {discount.daysRemaining === 0
                                ? 'Offer ends today'
                                : `Offer ends in ${discount.daysRemaining} day${discount.daysRemaining === 1 ? '' : 's'}`}
                        </>
                    )}
                </div>
            )}

            {!discount.isActive && discount.type && discount.startDate && (
                <div className="mt-2 text-sm text-muted-foreground">
                    A discount is scheduled for this product but isn&apos;t active right now
                    (runs {discount.startDate} to {discount.endDate}).
                </div>
            )}
        </div>
    )
}