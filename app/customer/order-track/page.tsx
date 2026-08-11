import { Suspense } from "react"
import siteData from "@/data/site.json"
import type { SiteData } from "@/lib/types"
import type { ApiCategory } from "@/app/page"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { FloatingButtons } from "@/components/floating-buttons"
import { OrderTrackPanel } from "@/components/order-track-panel"

const data = siteData as SiteData
const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN ?? ""

async function getCategories(): Promise<ApiCategory[]> {
    try {
        const res = await fetch(`${DOMAIN}/categories`, { next: { revalidate: 60 } })
        if (!res.ok) return []
        const json = await res.json()
        return json.success && Array.isArray(json.data) ? json.data : []
    } catch { return [] }
}

export default async function OrderTrack() {
    const [categories] = await Promise.all([getCategories()])

    return (
        <div className="min-h-screen bg-background">
            <SiteHeader brand={data.brand} categories={categories} />

            <main className="mx-auto max-w-2xl px-4 py-10">
                <p className="mb-6 text-center text-sm text-muted-foreground">
                    <a href="/" className="hover:underline">Home</a>
                    <span className="mx-2">/</span>
                    Order Track
                </p>

                <Suspense fallback={
                    <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
                        Loading...
                    </div>
                }>
                    <OrderTrackPanel />
                </Suspense>

                <div className="mt-4 rounded-2xl border border-border bg-card p-5">
                    <div className="flex gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">?</span>
                        <div>
                            <p className="text-sm font-bold">Where can I find my Invoice ID?</p>
                            <p className="mt-0.5 text-sm text-muted-foreground">
                                Check your SMS or the confirmation email we sent you after the order.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <SiteFooter brand={data.brand} footer={data.footer} />
            <FloatingButtons />
        </div>
    )
}