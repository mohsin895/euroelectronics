"use client"

import { AuthProvider } from "@/contexts/auth-context"
import { CartProvider } from "@/lib/cart-context"
import { CartDrawer } from "@/components/cart-drawer"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>

                {children}


        </AuthProvider>
    )
}