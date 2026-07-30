"use client"

import { useState, useRef, type FormEvent, type ChangeEvent } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getAuthToken } from "@/lib/utils/cookies"

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN ?? ""

export function ProfileEditPanel() {
    const { user, refreshUser } = useAuth()

    const [name, setName]         = useState(user?.f_name ?? "")
    const [phone, setPhone]       = useState(user?.phone?.replace(/^880/, "0") ?? "")
    const [email, setEmail]       = useState(user?.email ?? "")
    const [address, setAddress]   = useState("")
    const [district, setDistrict] = useState("")
    const [area, setArea]         = useState("")
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [loading, setLoading]   = useState(false)
    const [success, setSuccess]   = useState<string | null>(null)
    const [error, setError]       = useState<string | null>(null)
    const fileRef = useRef<HTMLInputElement>(null)

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        setLoading(true)
        setSuccess(null)
        setError(null)

        const token = getAuthToken()
        if (!token) return

        try {
            // Update profile info
            const formData = new FormData()
            formData.append("name", name)
            formData.append("phone", phone.startsWith("0") ? `880${phone.slice(1)}` : phone)
            formData.append("email", email)
            formData.append("address", address)
            formData.append("city", district)
            formData.append("state", area)

            const res = await fetch(`${DOMAIN}/profile/update`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
                body: formData,
            })

            // Upload image separately if selected
            if (imageFile) {
                const imgData = new FormData()
                imgData.append("image", imageFile)
                await fetch(`${DOMAIN}/profile/update-image`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
                    body: imgData,
                })
            }

            if (res.ok) {
                await refreshUser()
                setSuccess("Profile updated successfully.")
            } else {
                const json = await res.json().catch(() => null)
                setError(json?.message ?? "Failed to update profile.")
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
                <h1 className="text-2xl font-extrabold">Profile Edit</h1>
                <p className="mt-1 text-sm text-muted-foreground">Update your personal account information</p>
            </div>

            {success && <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>}
            {error   && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                        <label className={labelCls}>Full Name *</label>
                        <input className={inputCls} value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div>
                        <label className={labelCls}>Phone Number *</label>
                        <input className={inputCls} value={phone} onChange={e => setPhone(e.target.value)} required />
                    </div>
                    <div>
                        <label className={labelCls}>Email Address *</label>
                        <input className={inputCls} type="email" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div>
                        <label className={labelCls}>Address *</label>
                        <input className={inputCls} value={address} onChange={e => setAddress(e.target.value)} />
                    </div>
                    <div>
                        <label className={labelCls}>District *</label>
                        <input className={inputCls} placeholder="e.g. Dhaka" value={district} onChange={e => setDistrict(e.target.value)} />
                    </div>
                    <div>
                        <label className={labelCls}>Area *</label>
                        <input className={inputCls} placeholder="e.g. Mirpur" value={area} onChange={e => setArea(e.target.value)} />
                    </div>
                </div>

                <div>
                    <label className={labelCls}>Image</label>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border file:border-border file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setImageFile(e.target.files?.[0] ?? null)}
                    />
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