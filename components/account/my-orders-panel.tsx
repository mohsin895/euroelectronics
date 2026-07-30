"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getAuthToken } from "@/lib/utils/cookies"

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN ?? ""

interface Order {
    id: number
    code: string
    created_at: string
    grand_total: number
    coupon_discount: number
    payment_status: string
    delivery_status: string
}

export function MyOrdersPanel() {
    const router  = useRouter()
    const [orders, setOrders]   = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = getAuthToken()
        if (!token) { router.push("/login"); return }

        fetch(`${DOMAIN}/order/list`, {
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        })
            .then(r => r.json())
            .then(json => setOrders(Array.isArray(json.data) ? json.data : []))
            .catch(() => setOrders([]))
            .finally(() => setLoading(false))
    }, [router])

    const statusColor = (s: string) => {
        if (s === "delivered") return "text-green-600"
        if (s === "cancelled") return "text-red-500"
        return "text-yellow-600"
    }

    return (
        <div className="rounded-2xl border border-border bg-card p-8">
            <div className="mb-6">
                <h1 className="text-2xl font-extrabold">My Orders</h1>
                <p className="mt-1 text-sm text-muted-foreground">View and track your previous orders</p>
            </div>

            <div className="rounded-xl border border-border">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b border-border">
                        {["SL", "DATE", "AMOUNT", "DISCOUNT", "STATUS", "ACTION"].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-bold tracking-widest text-muted-foreground">
                                {h}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                        [...Array(3)].map((_, i) => (
                            <tr key={i} className="border-b border-border">
                                {[...Array(6)].map((__, j) => (
                                    <td key={j} className="px-4 py-3">
                                        <div className="h-4 animate-pulse rounded bg-muted" />
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : orders.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                                You have not placed any orders yet.
                            </td>
                        </tr>
                    ) : orders.map((order, i) => (
                        <tr key={order.id} className="border-b border-border last:border-0 hover:bg-accent/30">
                            <td className="px-4 py-3">{i + 1}</td>
                            <td className="px-4 py-3">{new Date(order.created_at).toLocaleDateString()}</td>
                            <td className="px-4 py-3 font-medium">৳{order.grand_total}</td>
                            <td className="px-4 py-3">৳{order.coupon_discount}</td>
                            <td className={`px-4 py-3 font-semibold capitalize ${statusColor(order.delivery_status)}`}>
                                {order.delivery_status}
                            </td>
                            <td className="px-4 py-3">
                                <button
                                    className="rounded border border-border px-3 py-1 text-xs font-medium hover:bg-accent"
                                    onClick={() => router.push(`/account/orders/${order.id}`)}
                                >
                                    Details
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}