"use client"

import { useId, useState } from "react"
import type { InputHTMLAttributes } from "react"
import { Eye, EyeOff } from "lucide-react"

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
    label: string
    error?: string
}

export function Field({ label, error, type = "text", className, ...props }: FieldProps) {
    const id = useId()
    const [show, setShow] = useState(false)
    const isPassword = type === "password"

    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className="text-sm font-medium text-[#11151B]">
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    type={isPassword && show ? "text" : type}
                    className={`w-full rounded-md border bg-white px-3 py-2.5 text-sm text-[#11151B] outline-none transition-colors placeholder:text-[#A6AEBA] focus:border-[#FF5A1F] focus:ring-2 focus:ring-[#FF5A1F]/20 ${
                        error ? "border-red-400" : "border-[#D7DBE2]"
                    } ${isPassword ? "pr-10" : ""} ${className ?? ""}`}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShow((s) => !s)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-[#8893A3] hover:text-[#11151B]"
                        aria-label={show ? "Hide password" : "Show password"}
                    >
                        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                )}
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    )
}
