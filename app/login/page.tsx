"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthShell } from "@/components/auth/auth-shell"
import { Field } from "@/components/auth/field"
import { SubmitButton } from "@/components/auth/submit-button"
import { FormMessage } from "@/components/auth/form-message"
import { getErrorMessage, loginUser } from "@/lib/api/auth"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
    const router = useRouter()
    const { setSession } = useAuth()

    const [emailOrPhone, setEmailOrPhone] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const res = await loginUser({ email_or_phone: emailOrPhone.trim(), password })

            if (res.success && res.data?.token) {
                setSession(res.data.token)
                router.push("/customer/account")
                return  // setLoading intentionally left true — page is navigating away
            }

            setError(getErrorMessage(res, "Phone, email or password is incorrect."))
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthShell
            eyebrow="Member access // 01"
            title="Gear up. Sign in."
            description="Track orders, save your sizes and check out faster on your next ride into the rain."
            gaugeLabel="Login"
            gaugeValue={0.22}
        >
            <div className="mb-8">
                <h2 className="text-2xl font-semibold text-[#11151B]">Sign in to your account</h2>
                <p className="mt-1 text-sm text-[#8893A3]">Enter your details to continue.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && <FormMessage tone="error">{error}</FormMessage>}

                <Field
                    label="Phone or email"
                    name="email_or_phone"
                    placeholder="01XXXXXXXXX or you@example.com"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    required
                    autoComplete="username"
                />

                <div className="flex flex-col gap-1.5">
                    <Field
                        label="Password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                    />
                    <div className="flex justify-end">
                        <Link href="/forgot-password" className="text-sm font-medium text-[#FF5A1F] hover:underline">
                            Forgot password?
                        </Link>
                    </div>
                </div>

                <SubmitButton loading={loading} className="mt-2">
                    Sign in
                </SubmitButton>
            </form>

            <p className="mt-6 text-center text-sm text-[#8893A3]">
                New to Moto Empirebd ?{" "}
                <Link href="/register" className="font-medium text-[#FF5A1F] hover:underline">
                    Create an account
                </Link>
            </p>
        </AuthShell>
    )
}