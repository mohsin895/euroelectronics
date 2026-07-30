"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthShell } from "@/components/auth/auth-shell"
import { Field } from "@/components/auth/field"
import { SubmitButton } from "@/components/auth/submit-button"
import { FormMessage } from "@/components/auth/form-message"
import { OtpInput } from "@/components/auth/otp-input"
import { confirmPasswordReset, forgetPasswordRequest, getErrorMessage, resendPasswordResetCode } from "@/lib/api/auth"

type Step = "request" | "reset"

export default function ForgotPasswordPage() {
    const router = useRouter()

    const [step, setStep] = useState<Step>("request")
    const [phone, setPhone] = useState("")
    const [otp, setOtp] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const [error, setError] = useState<string | null>(null)
    const [notice, setNotice] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleRequest(e: FormEvent) {
        e.preventDefault()
        setError(null)
        setLoading(true)

        const res = await forgetPasswordRequest({ phone: phone.trim() })
        setLoading(false)

        if (!res.success) {
            setError(getErrorMessage(res, "We couldn't find an account with that phone number."))
            return
        }

        setNotice(`We've sent a reset code to ${phone.trim()}.`)
        setStep("reset")
    }

    async function handleReset(e: FormEvent) {
        e.preventDefault()
        setError(null)

        if (otp.length < 4) {
            setError("Enter the code we sent to your phone.")
            return
        }
        if (password !== confirmPassword) {
            setError("Passwords don't match.")
            return
        }

        setLoading(true)
        const res = await confirmPasswordReset({
            phone: phone.trim(),
            reset_token: otp,
            password,
            password_confirmation: confirmPassword,
        })
        setLoading(false)

        if (!res.success) {
            setError(getErrorMessage(res, "That code didn't work. Please try again."))
            return
        }

        router.push("/login")
    }

    async function handleResend() {
        setError(null)
        setNotice(null)
        const res = await resendPasswordResetCode({ phone: phone.trim() })
        setNotice(res.success ? "We've sent a new code to your phone." : getErrorMessage(res, "Couldn't resend the code. Try again shortly."))
    }

    if (step === "reset") {
        return (
            <AuthShell
                eyebrow="Recovery // 02"
                title="Set a new password."
                description="Enter the code we sent you, then choose a new password to get back on the road."
                gaugeLabel="Reset"
                gaugeValue={0.85}
            >
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-[#11151B]">Reset your password</h2>
                    <p className="mt-1 text-sm text-[#8893A3]">Check your SMS inbox for a 6-digit code.</p>
                </div>

                <form onSubmit={handleReset} className="flex flex-col gap-4">
                    {error && <FormMessage tone="error">{error}</FormMessage>}
                    {notice && !error && <FormMessage tone="success">{notice}</FormMessage>}

                    <OtpInput value={otp} onChange={setOtp} error={Boolean(error)} disabled={loading} />

                    <Field
                        label="New password"
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
                        label="Confirm new password"
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
                        Reset password
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
            eyebrow="Recovery // 01"
            title="Forgot your password?"
            description="No problem. Tell us the phone number on your account and we'll send you a reset code."
            gaugeLabel="Locate"
            gaugeValue={0.6}
        >
            <div className="mb-8">
                <h2 className="text-2xl font-semibold text-[#11151B]">Reset your password</h2>
                <p className="mt-1 text-sm text-[#8893A3]">We'll text you a code to confirm it's you.</p>
            </div>

            <form onSubmit={handleRequest} className="flex flex-col gap-4">
                {error && <FormMessage tone="error">{error}</FormMessage>}

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

                <SubmitButton loading={loading} className="mt-2">
                    Send reset code
                </SubmitButton>
            </form>

            <p className="mt-6 text-center text-sm text-[#8893A3]">
                Remembered your password?{" "}
                <Link href="/login" className="font-medium text-[#FF5A1F] hover:underline">
                    Back to sign in
                </Link>
            </p>
        </AuthShell>
    )
}
