"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"

import { PackageSearch, ChevronDown, ChevronRight, Menu, X, Zap } from "lucide-react"
import type { Brand } from "@/lib/types"
import type { ApiCategory } from "@/app/page"
import logo from "../public/logo.png"
import { CartButton } from "@/components/cart-button"
import { SearchBar } from "@/components/search-bar"
import { AuthNavButton } from "@/components/auth-nav-button"

// ─── Internal nav shape ────────────────────────────────────────────────────────
interface NavLeaf  { label: string; href: string }
interface NavChild { label: string; href: string; children?: NavLeaf[] }
interface NavItem  { label: string; href: string; hasDropdown?: boolean; children?: NavChild[] }

// ─── Map API → NavItem[] ───────────────────────────────────────────────────────
function mapCategories(data: ApiCategory[]): NavItem[] {
    return [...data]
        .sort((a, b) => a.order_level - b.order_level)
        .map((cat) => ({
            label: cat.name,
            href: `/category/${cat.slug}`,
            hasDropdown: cat.sub_categories.length > 0,
            children: cat.sub_categories.map((sub) => ({
                label: sub.name,
                href: `/subcategory/${sub.slug}`,
                children: sub.child_categories.map((child) => ({
                    label: child.name,
                    href: `/subcategory/${cat.slug}/${sub.slug}/${child.slug}`,
                })),
            })),
        }))
}

// ─── SubMenu (3rd level) ───────────────────────────────────────────────────────
function SubMenu({ items }: { items: NavLeaf[] }) {
    return (
        <ul
            className="absolute left-full top-0 z-[60] min-w-[200px] bg-white border border-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.14)] py-1.5 rounded-sm animate-dropdown"
            role="menu"
        >
            {items.map((sub) => (
                <li key={sub.label}>
                    <a
                        href={sub.href}
                        role="menuitem"
                        className="block px-4 py-2.5 text-[13px] text-gray-700 hover:bg-[#EE2430] hover:text-white transition-colors duration-150"
                    >
                        {sub.label}
                    </a>
                </li>
            ))}
        </ul>
    )
}

// ─── DropdownMenu (2nd level) ──────────────────────────────────────────────────
function DropdownMenu({ items }: { items: NavChild[] }) {
    const [activeLabel, setActiveLabel] = useState<string | null>(null)
    const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const clearLeave = () => { if (leaveTimer.current) clearTimeout(leaveTimer.current) }
    const scheduleClose = () => { leaveTimer.current = setTimeout(() => setActiveLabel(null), 150) }

    useEffect(() => () => { if (leaveTimer.current) clearTimeout(leaveTimer.current) }, [])

    return (
        <ul
            className="absolute left-0 top-0 z-50 min-w-[220px] bg-white border border-gray-100 shadow-[0_8px_32px_rgba(0,0,0,0.12)] py-1.5 rounded-sm animate-dropdown"
            role="menu"
        >
            {items.map((item) => {
                const hasSub = !!item.children?.length
                const isActive = activeLabel === item.label
                return (
                    <li
                        key={item.label}
                        className="relative"
                        onMouseEnter={() => { clearLeave(); hasSub ? setActiveLabel(item.label) : setActiveLabel(null) }}
                        onMouseLeave={() => { if (hasSub) scheduleClose() }}
                    >
                        <a
                            href={item.href}
                            role="menuitem"
                            className="flex items-center justify-between px-4 py-2.5 text-[13px] text-gray-700 hover:bg-[#EE2430] hover:text-white transition-colors duration-150 group"
                        >
                            <span>{item.label}</span>
                            {hasSub && <ChevronRight className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />}
                        </a>
                        {hasSub && isActive && (
                            <div onMouseEnter={clearLeave} onMouseLeave={scheduleClose}>
                                <SubMenu items={item.children!} />
                            </div>
                        )}
                    </li>
                )
            })}
        </ul>
    )
}

// ─── Desktop nav item ──────────────────────────────────────────────────────────
function NavItemDesktop({ item }: { item: NavItem }) {
    const [open, setOpen] = useState(false)
    const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const clearLeave = useCallback(() => { if (leaveTimer.current) clearTimeout(leaveTimer.current) }, [])
    const scheduleClose = useCallback(() => { leaveTimer.current = setTimeout(() => setOpen(false), 150) }, [])

    useEffect(() => () => { if (leaveTimer.current) clearTimeout(leaveTimer.current) }, [])

    return (
        <li
            className="relative"
            onMouseEnter={() => { clearLeave(); setOpen(true) }}
            onMouseLeave={scheduleClose}
        >
            <a
                href={item.href}
                aria-haspopup={item.hasDropdown ? "true" : undefined}
                aria-expanded={item.hasDropdown ? open : undefined}
                className={`flex items-center gap-1 px-3 py-4 text-[13px] font-semibold tracking-wide transition-colors duration-150 whitespace-nowrap ${
                    open ? "bg-white/20 text-white" : "text-white/90 hover:text-white hover:bg-white/10"
                }`}
            >
                {item.label}
                {item.hasDropdown && (
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
                )}
            </a>

            {item.hasDropdown && !!item.children?.length && open && (
                <div
                    className="absolute left-0 top-full z-50"
                    onMouseEnter={() => { clearLeave(); setOpen(true) }}
                    onMouseLeave={scheduleClose}
                >
                    <div className="h-[2px]" />
                    <DropdownMenu items={item.children} />
                </div>
            )}
        </li>
    )
}

// ─── Mobile nav item ───────────────────────────────────────────────────────────
function MobileNavItem({ item }: { item: NavItem }) {
    const [open, setOpen] = useState(false)
    const [activeSub, setActiveSub] = useState<string | null>(null)

    return (
        <li>
            <div className="flex w-full items-center justify-between border-b border-white/10 py-3">
                <a href={item.href} className="flex-1 text-sm font-semibold text-white">{item.label}</a>
                {item.hasDropdown && (
                    <button
                        onClick={() => { setOpen(v => !v); setActiveSub(null) }}
                        aria-label="Toggle submenu"
                        className="p-1"
                    >
                        <ChevronDown className={`h-4 w-4 text-white transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
                    </button>
                )}
            </div>

            {item.hasDropdown && open && !!item.children?.length && (
                <ul className="mb-1 rounded-sm bg-white/10">
                    {item.children.map((child) => {
                        const hasSub = !!child.children?.length
                        const subOpen = activeSub === child.label
                        return (
                            <li key={child.label}>
                                <div className="flex w-full items-center justify-between border-b border-white/5 last:border-0">
                                    <a href={child.href} className="flex-1 px-4 py-2.5 text-[13px] text-white/90 hover:text-white">
                                        {child.label}
                                    </a>
                                    {hasSub && (
                                        <button
                                            onClick={() => setActiveSub(subOpen ? null : child.label)}
                                            className="px-3 py-2.5"
                                            aria-label="Toggle nested"
                                        >
                                            <ChevronDown className={`h-3.5 w-3.5 text-white transition-transform duration-200 ${subOpen ? "rotate-180" : ""}`} />
                                        </button>
                                    )}
                                </div>
                                {hasSub && subOpen && (
                                    <ul className="bg-white/10">
                                        {child.children!.map((sub) => (
                                            <li key={sub.label}>
                                                <a
                                                    href={sub.href}
                                                    className="block px-8 py-2 text-[12px] text-white/80 hover:text-white border-b border-white/5 last:border-0"
                                                >
                                                    {sub.label}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        )
                    })}
                </ul>
            )}
        </li>
    )
}

// ─── Main Header ───────────────────────────────────────────────────────────────
export function SiteHeader({
                               brand,
                               categories,
                           }: {
    brand: Brand
    categories: ApiCategory[]
}) {
    const [mobileOpen, setMobileOpen] = useState(false)
    const nav = mapCategories(categories)

    return (
        <>
            <style>{`
                @keyframes dropdownIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .animate-dropdown { animation: dropdownIn 0.15s ease-out forwards; }
            `}</style>

            {/* ── Top bar: scrolls away with the page ── */}
            <div className="w-full bg-card border-b border-border">
                <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 md:gap-6">

                    <a href="/" className="flex shrink-0 items-center w-[20%]">
                        <Image src={logo} alt={brand.name} width={70} height={40} />
                    </a>

                    <SearchBar placeholder="পণ্য খুঁজুন..." />

                    <div className="flex items-center gap-3 md:gap-5 w-[25%] justify-end">


                        <a
                            href="/customer/order-track"
                            aria-label="Track order"
                            className="text-foreground transition-colors hover:text-[#EE2430]"
                        >
                            <PackageSearch className="h-6 w-6" />
                        </a>
                        <AuthNavButton />
                        <CartButton />
                    </div>
                </div>
            </div>

            {/* ── Nav bar: sticks to top independently because it's a sibling, not a child ── */}
            <nav className="sticky top-0 z-50 w-full bg-foreground text-white" aria-label="Main navigation">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4">

                    <button
                        className="flex items-center gap-2 py-3 lg:hidden"
                        onClick={() => setMobileOpen(v => !v)}
                        aria-label="Toggle menu"
                        aria-expanded={mobileOpen}
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        <span className="text-sm font-semibold">Menu</span>
                    </button>

                    <ul className="hidden flex-wrap items-center lg:flex" role="menubar">
                        {nav.map((item) => (
                            <NavItemDesktop key={item.label} item={item} />
                        ))}
                    </ul>

                    {/*<a*/}
                    {/*    href="/flash-sale"*/}
                    {/*    className="my-2 hidden shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-gray-900 sm:flex hover:bg-gray-100 transition-colors"*/}
                    {/*>*/}
                    {/*    <Zap className="h-3.5 w-3.5 fill-[#EE2430] text-[#EE2430]" />*/}
                    {/*    ফ্ল্যাশ সেল*/}
                    {/*</a>*/}
                </div>

                {mobileOpen && (
                    <ul className="border-t border-white/10 px-4 pb-4 lg:hidden">
                        {nav.map((item) => (
                            <MobileNavItem key={item.label} item={item} />
                        ))}
                    </ul>
                )}
            </nav>
        </>
    )
}