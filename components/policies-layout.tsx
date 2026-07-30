"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    ListOrdered, Truck, RotateCcw, FileText, ShieldCheck,Contact, Headphones
} from "lucide-react"

const links = [
    { label: "Order Procedure",    href: "/page/order-procedure", icon: ListOrdered },
    { label: "Delivery Rules",     href: "/page/delivery-rules",  icon: Truck },
    { label: "Return Policy",      href: "/page/return-policy",   icon: RotateCcw },
    { label: "Terms & Conditions", href: "/page/terms-conditions",           icon: FileText },
    { label: "Privacy Policy",     href: "/page/privacy-policy",  icon: ShieldCheck },
    { label: "Warranty",         href: "/page/warranty",      icon: Headphones },
    { label: "Contact", href: "/page/contact", icon: Contact },

]

export function PoliciesLayout({
                                   title,
                                   children,
                               }: {
    title: string
    children: React.ReactNode
}) {
    const pathname = usePathname()

    return (
        <div className="mx-auto max-w-7xl px-4 py-10">
            {/* Breadcrumb */}
            <p className="mb-6 text-sm text-muted-foreground">
                <Link href="/" className="hover:underline">Home</Link>
                <span className="mx-1">/</span>
                Pages
            </p>

            <div className="flex flex-col gap-6 lg:flex-row">
                {/* Sidebar */}
                <aside className="w-full shrink-0 lg:w-64">
                    <div className="rounded-2xl border border-border bg-card p-5">
                        <h2 className="mb-4 text-base font-bold">Help &amp; Policies</h2>
                        <nav className="space-y-1">
                            {links.map(({ label, href, icon: Icon }) => {
                                const active = pathname === href
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                      ${active
                                            ? "border-l-4 border-primary bg-primary/5 pl-2 text-primary"
                                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                        }`}
                                    >
                                        <Icon className="h-4 w-4 shrink-0" />
                                        {label}
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>
                </aside>

                {/* Content panel */}
                <main className="flex-1">
                    <div className="rounded-2xl border border-border bg-card p-8">
                        <h1 className="mb-1 text-2xl font-extrabold">{title}</h1>
                        <hr className="mb-6 border-border" />
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}