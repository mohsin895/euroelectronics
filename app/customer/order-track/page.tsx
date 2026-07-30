import { Suspense } from "react"

import { FloatingButtons } from "@/components/floating-buttons"
import { OrderTrackPanel } from "@/components/order-track-panel"
import {Footer} from "@/components/footer";
import {Header} from "@/components/header";



export default async function OrderTrack() {


    return (
        <div className="min-h-screen bg-background">
            <Header />

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

            <Footer />
            <FloatingButtons />
        </div>
    )
}