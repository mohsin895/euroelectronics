"use client"

import { HotOfferProductCard, type ApiProduct } from "@/components/ui/HotOfferProduct"

export type HotOfferProduct = ApiProduct

export function HotOfferSectopn({
                                    deals,
                                    title = "Hot Offer",
                                }: {
    deals: HotOfferProduct[]
    title?: string
}) {
    if (!deals?.length) return null

    const [featured, ...rest] = deals
    const gridItems = rest.slice(0, 4)

    return (
        <section className="mx-auto max-w-7xl px-4 py-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                <h2 className="flex items-center gap-3 text-lg font-extrabold tracking-wide text-foreground md:text-xl">
                    <span className="h-6 w-1.5 rounded-full bg-[#EE2430]" />
                    {title}
                </h2>

               <a href="/flash-sale"
                className="text-sm font-semibold uppercase tracking-wide text-muted-foreground hover:text-[#EE2430]"
                >
                VIEW MORE &gt;
            </a>
        </div>

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="sm:row-span-2">
            <HotOfferProductCard product={featured} showAddToCart size="large" />
        </div>
        {gridItems.map((p) => (
            <HotOfferProductCard key={p.id} product={p} showAddToCart />
        ))}
    </div>
</section>
)
}