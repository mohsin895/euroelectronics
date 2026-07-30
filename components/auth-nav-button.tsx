"use client"

import { User } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function AuthNavButton() {
    const { isAuthenticated, isLoading } = useAuth()

    const href = isLoading ? "#" : isAuthenticated ? "/customer/account" : "/login"

    return (

       <a href={href}
    aria-label="Account"
    className="text-foreground hover:text-[#EE2430] transition-colors"
        >
        <User className="h-6 w-6" />
        </a>
)
}