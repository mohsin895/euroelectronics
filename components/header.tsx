'use client'

import Link from 'next/link'

import { useCart } from '@/lib/cart-context'
import { Menu, Search, Heart, ShoppingCart, User, LogOut } from 'lucide-react'
import { useState } from 'react'
import { CartDrawer } from './cart-drawer'
import { CategoryMenu } from './category-menu'
import Image from "next/image";
import {AuthNavButton} from "@/components/auth-nav-button";
import {SearchBar} from "@/components/search-bar";

export function Header() {

    const { totalItems } = useCart()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [cartDrawerOpen, setCartDrawerOpen] = useState(false)

    return (
        <header className="bg-white border-b border-border sticky top-0 z-50">
            {/* Top Navigation */}
            <div className="px-4 md:px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                        <Image src="/logo.jpeg" alt="logo" width={90} height={75} />
                    </Link>

                    {/* Search Bar - Desktop */}
                    <div className="hidden md:flex flex-1 mx-8 max-w-md">
                        <SearchBar />
                    </div>

                    {/* Right Navigation */}
                    <div className="flex items-center gap-4">
                        {/* Track Order - Desktop */}
                        <Link
                            href="/customer/order-track"
                            className="hidden md:flex items-center gap-2 text-sm text-foreground hover:text-primary"
                        >
                            <span>Track Order</span>
                        </Link>

                        {/* Auth Links */}
                        <AuthNavButton />


                        {/* Wishlist */}
                        {/*<Link href="/wishlist" className="hidden md:flex">*/}
                        {/*    <Heart className="w-5 h-5 text-foreground hover:text-primary" />*/}
                        {/*</Link>*/}

                        {/* Cart */}
                        <button
                            onClick={() => setCartDrawerOpen(true)}
                            className="relative  flex hover:opacity-80 transition-opacity"
                        >
                            <ShoppingCart className="w-5 h-5 text-foreground hover:text-primary" />
                            {totalItems > 0 && (
                                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {totalItems}
                </span>
                            )}
                        </button>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Mobile Search */}
                <div className="md:hidden mt-3">
                    <SearchBar />
                </div>
            </div>

            {/* Categories Navigation (dynamic, with subcategory dropdowns) */}
            <CategoryMenu />

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden px-4 py-4 border-t border-border bg-white">
                    <div className="space-y-3">
                        <Link href="/" className="block text-sm font-medium">
                            Home
                        </Link>
                        <Link href="/shop" className="block text-sm font-medium">
                           Shop
                        </Link>

                        <AuthNavButton />

                    </div>
                </div>
            )}

            {/* Cart Drawer */}
            <CartDrawer isOpen={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />
        </header>
    )
}