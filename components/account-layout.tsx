"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { User, ShoppingBag, UserPen, KeyRound, LogOut } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { useEffect } from "react"

const navLinks = [
    { label: "Account Overview", href: "/customer/account",          icon: User },
    { label: "My Orders",        href: "/customer/orders",   icon: ShoppingBag },
    { label: "Profile Edit",     href: "/customer/profile-edit",     icon: UserPen },
    { label: "Change Password",  href: "/customer/change-password", icon: KeyRound },
]

export function AccountLayout({ children }: { children?: React.ReactNode }) {
    const pathname = usePathname()
    const router   = useRouter()
    const { user, isAuthenticated, isLoading, logout } = useAuth()

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login")
        }
    }, [isLoading, isAuthenticated, router])

    const handleLogout = async () => {
        await logout()
        router.push("/")
    }

    const avatarUrl = user?.image ?? null

    // Show nothing while checking auth
    if (isLoading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-10">
                <div className="h-64 animate-pulse rounded-2xl bg-muted" />
            </div>
        )
    }

    if (!isAuthenticated) return null

    return (
        <div className="mx-auto max-w-7xl px-4 py-10">
            <div className="flex flex-col gap-6 lg:flex-row">

                {/* Sidebar */}
                <aside className="w-full shrink-0 overflow-hidden rounded-2xl border border-border lg:w-64">
                    <div className="flex flex-col items-center gap-3 bg-foreground px-6 py-8 text-background">
                        {avatarUrl ? (
                            <Image
                                src={avatarUrl}
                                alt={user?.f_name ?? "Avatar"}
                                width={72} height={72}
                                className="rounded-full object-cover ring-2 ring-background/30"
                            />
                        ) : (
                            <div className="grid h-[72px] w-[72px] place-items-center rounded-full bg-muted">
                                <User className="h-8 w-8 text-muted-foreground" />
                            </div>
                        )}
                        <div className="text-center">
                            <p className="text-sm text-background/60">Hello,</p>
                            <p className="text-base font-bold capitalize">
                                {user?.f_name} {user?.l_name ?? ""}
                            </p>
                        </div>
                    </div>

                    <nav className="bg-card p-2">
                        {navLinks.map(({ label, href, icon: Icon }) => {
                            const active = pathname === href
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors
                                        ${active
                                        ? "border-l-4 border-primary bg-primary/5 pl-3 font-semibold text-primary"
                                        : "font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                                    }`}
                                >
                                    <Icon className="h-4 w-4 shrink-0" />
                                    {label}
                                </Link>
                            )
                        })}

                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                            <LogOut className="h-4 w-4 shrink-0" />
                            Logout
                        </button>
                    </nav>
                </aside>

                {/* Main panel */}
                <main className="flex-1">
                    {children ?? <AccountOverview />}
                </main>
            </div>
        </div>
    )
}

function AccountOverview() {
    const { user } = useAuth()

    const fields = [
        { label: "FULL NAME",                value: `${user?.f_name ?? ""} ${user?.l_name ?? ""}`.trim() },
        { label: "PHONE NUMBER",             value: user?.phone?.replace(/^880/, "0") },
        { label: "EMAIL ADDRESS",            value: user?.email },
        { label: "DISTRICT",                 value: null },   // not in AuthUser — extend if API returns it
        { label: "AREA",                     value: null },
        { label: "DEFAULT SHIPPING ADDRESS", value: null, full: true },
    ]

    return (
        <div className="rounded-2xl border border-border bg-card p-8">
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold">Account Overview</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage your personal information and track orders
                    </p>
                </div>
                <Link
                    href="/customer/profile-edit"
                    className="rounded-lg border border-border px-5 py-2 text-sm font-semibold transition-colors hover:bg-accent"
                >
                    Edit Profile
                </Link>
            </div>

            <div className="rounded-xl border border-border p-6">
                <div className="grid grid-cols-1 gap-x-12 gap-y-6 sm:grid-cols-2">
                    {fields.map(({ label, value, full }) => (
                        <div key={label} className={full ? "sm:col-span-2" : ""}>
                            <p className="mb-1 text-[11px] font-semibold tracking-widest text-muted-foreground">
                                {label}
                            </p>
                            <p className="text-sm font-bold">{value || "Not Provided"}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}