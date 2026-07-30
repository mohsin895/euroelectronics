"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthShell } from "@/components/auth/auth-shell"
import { Field } from "@/components/auth/field"
import { SubmitButton } from "@/components/auth/submit-button"
import { FormMessage } from "@/components/auth/form-message"
import { OtpInput } from "@/components/auth/otp-input"
import { confirmCode, getErrorMessage, resendCode, signupUser } from "@/lib/api/auth"
import { useAuth } from "@/contexts/auth-context"

type Step = "details" | "verify"



export default function RegisterPage() {
    const router = useRouter()
    const { setSession } = useAuth()

    const [step, setStep] = useState<Step>("details")
    const [token, setToken] = useState<string | null>(null)

    const [name, setFullName] = useState("")
    const [phone, setPhone] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const [otp, setOtp] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [notice, setNotice] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSignup(e: FormEvent) {
        e.preventDefault()
        setError(null)

        if (password !== confirmPassword) {
            setError("Passwords don't match.")
            return
        }

        setLoading(true)

        const res = await signupUser({
            name,

            phone: phone.trim(),
            email: email.trim() || undefined,
            password,
            password_confirmation: confirmPassword,
        })
        setLoading(false)

        if (!res.success || !res.data?.token) {
            setError(getErrorMessage(res, "Could not create your account. Please check your details."))
            return
        }

        if (!res.data.is_phone_verified) {
            setToken(res.data.token)
            setStep("verify")
            setNotice(`We've sent a verification code to ${phone.trim()}.`)
            return
        }


        setSession(res.data.token)
        router.push("/")
    }

    async function handleVerify(e: FormEvent) {
        e.preventDefault()
        if (!token) return
        setError(null)

        if (otp.length < 4) {
            setError("Enter the code we sent to your phone.")
            return
        }

        setLoading(true)
        const res = await confirmCode({ phone: phone.trim(), otp }, token)
        setLoading(false)

        if (!res.success) {
            setError(getErrorMessage(res, "That code didn't match. Please try again."))
            return
        }

        setSession(token)
        router.push("/")
    }

    async function handleResend() {
        if (!token) return
        setError(null)
        setNotice(null)
        const res = await resendCode(token)
        setNotice(res.success ? "We've sent a new code to your phone." : getErrorMessage(res, "Couldn't resend the code. Try again shortly."))
    }

    if (step === "verify") {
        return (
            <AuthShell
                eyebrow="Member access // 02"
                title="Confirm it's you."
                description="Enter the code sent to your phone to activate your account and start ordering."
                gaugeLabel="Verify"
                gaugeValue={0.75}
            >
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-[#11151B]">Enter verification code</h2>
                    <p className="mt-1 text-sm text-[#8893A3]">Check your SMS inbox for a 6-digit code.</p>
                </div>

                <form onSubmit={handleVerify} className="flex flex-col gap-4">
                    {error && <FormMessage tone="error">{error}</FormMessage>}
                    {notice && !error && <FormMessage tone="success">{notice}</FormMessage>}

                    <OtpInput value={otp} onChange={setOtp} error={Boolean(error)} disabled={loading} />

                    <SubmitButton loading={loading} className="mt-2">
                        Verify &amp; continue
                    </SubmitButton>

                    <button
                        type="button"
                        onClick={handleResend}
                        className="text-sm font-medium text-[#FF5A1F] hover:underline"
                    >
                        Resend code
                    </button>
                </form>
            </AuthShell>
        )
    }

    return (
        <AuthShell
            eyebrow="Member access // 02"
            title="Join  Eggs & Spices."
            description="Create an account to track orders, save your gear sizes and get early access to new drops."
            gaugeLabel="Sign-up"
            gaugeValue={0.5}
        >
            <div className="mb-8">
                <h2 className="text-2xl font-semibold text-[#11151B]">Create your account</h2>
                <p className="mt-1 text-sm text-[#8893A3]">It only takes a minute.</p>
            </div>

            <form onSubmit={handleSignup} className="flex flex-col gap-4">
                {error && <FormMessage tone="error">{error}</FormMessage>}

                <Field
                    label="Full name"
                    name="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    autoComplete="name"
                />

                <Field
                    label="Phone number"
                    name="phone"
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    autoComplete="tel"
                />

                <Field
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                />

                <Field
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                />

                <Field
                    label="Confirm password"
                    name="password_confirmation"
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                />

                <SubmitButton loading={loading} className="mt-2">
                    Create account
                </SubmitButton>
            </form>

            <p className="mt-6 text-center text-sm text-[#8893A3]">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-[#FF5A1F] hover:underline">
                    Sign in
                </Link>
            </p>
        </AuthShell>
    )
}
