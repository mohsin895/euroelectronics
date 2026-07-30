"use client"

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import { getCurrentUser, logoutUser } from "@/lib/api/auth"
import { clearAuthToken, getAuthToken, setAuthToken } from "@/lib/utils/cookies"
import type { AuthUser } from "@/lib/types/auth"

interface AuthContextValue {
    user: AuthUser | null
    token: string | null
    isAuthenticated: boolean
    isLoading: boolean
    setSession: (token: string) => void
    logout: () => Promise<void>
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null)
    const [user, setUser] = useState<AuthUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const refreshUser = useCallback(async () => {
        const storedToken = getAuthToken()
        if (!storedToken) {
            setToken(null)
            setUser(null)
            setIsLoading(false)
            return
        }

        setToken(storedToken)
        const res = await getCurrentUser(storedToken)

        if (res.success && res.data) {
            const d = res.data as Record<string, unknown>
            const mapped: AuthUser = {
                id:               d.id as number,
                f_name:           (d.name as string) ?? "",
                l_name:           null,
                phone:            (d.phone as string) ?? "",
                email:            (d.email as string | null) ?? null,
                image:            (d.avatar_original as string | null) ?? (d.avatar as string | null) ?? null,
                is_phone_verified: undefined,
            }
            setUser(mapped)
        } else {
            clearAuthToken()
            setToken(null)
            setUser(null)
        }
        setIsLoading(false)
    }, [])
    useEffect(() => {
        refreshUser()
    }, [refreshUser])

    const setSession = useCallback((newToken: string) => {
        setAuthToken(newToken)   // ✓ cookie set
        setToken(newToken)        // ✓ state set
        void refreshUser()        // ← refreshUser calls getAuthToken() from cookie, which is fine
    }, [refreshUser])

    const logout = useCallback(async () => {
        if (token) {
            await logoutUser(token).catch(() => null)
        }
        clearAuthToken()
        setToken(null)
        setUser(null)
    }, [token])

    return (
        <AuthContext.Provider
            value={{ user, token, isAuthenticated: Boolean(token), isLoading, setSession, logout, refreshUser }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
    return ctx
}
