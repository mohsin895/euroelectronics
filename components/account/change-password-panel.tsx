"use client"

import { useState, type FormEvent } from "react"
import { getAuthToken } from "@/lib/utils/cookies"

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN ?? ""

export function ChangePasswordPanel() {
    const [oldPassword, setOldPassword]         = useState("")
    const [newPassword, setNewPassword]         = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading]                 = useState(false)
    const [success, setSuccess]                 = useState<string | null>(null)
    const [error, setError]                     = useState<string | null>(null)

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        setSuccess(null)
        setError(null)

        if (newPassword !== confirmPassword) {
            setError("New password and confirm password do not match.")
            return
        }
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters.")
            return
        }

        setLoading(true)
        const token = getAuthToken()
        if (!token) return

        try {
            const res = await fetch(`${DOMAIN}/auth/password/change`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    current_password: oldPassword,
                    new_password: newPassword,
                    new_password_confirmation: confirmPassword,
                }),
            })

            const json = await res.json().catch(() => null)
            if (res.ok && (json?.success || json?.result)) {
                setSuccess("Password changed successfully.")
                setOldPassword("")
                setNewPassword("")
                setConfirmPassword("")
            } else {
                setError(json?.message ?? "Failed to change password.")
            }
        } catch {
            setError("Could not reach the server.")
        } finally {
            setLoading(false)
        }
    }

    const inputCls = "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
    const labelCls = "mb-1 block text-sm font-medium text-foreground"

    return (
        <div className="rounded-2xl border border-border bg-card p-8">
            <div className="mb-6">
                <h1 className="text-2xl font-extrabold">Change Password</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Ensure your account is using a long, random password to stay secure
                </p>
            </div>

            {success && <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>}
            {error   && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className={labelCls}>Old Password *</label>
                    <input className={inputCls} type="password" value={oldPassword}
                           onChange={e => setOldPassword(e.target.value)} required />
                </div>
                <div>
                    <label className={labelCls}>New Password *</label>
                    <input className={inputCls} type="password" value={newPassword}
                           onChange={e => setNewPassword(e.target.value)} required />
                </div>
                <div>
                    <label className={labelCls}>Confirm Password *</label>
                    <input className={inputCls} type="password" value={confirmPassword}
                           onChange={e => setConfirmPassword(e.target.value)} required />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg border border-border px-8 py-2 text-sm font-semibold transition-colors hover:bg-accent disabled:opacity-50"
                >
                    {loading ? "Updating..." : "Update"}
                </button>
            </form>
        </div>
    )
}