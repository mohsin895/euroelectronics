"use client"

import type { ButtonHTMLAttributes } from "react"
import { Loader2 } from "lucide-react"

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean
}

export function SubmitButton({ loading, children, disabled, className, ...props }: SubmitButtonProps) {
    return (
        <button
            type="submit"
            disabled={disabled || loading}
            className={`flex w-full items-center justify-center gap-2 rounded-md bg-[#FF5A1F] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#E64F18] disabled:cursor-not-allowed disabled:opacity-60 ${className ?? ""}`}
            {...props}
        >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {children}
        </button>
    )
}
