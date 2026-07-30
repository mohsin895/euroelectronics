"use client"

import { useRef } from "react"
import type { ClipboardEvent, KeyboardEvent } from "react"

interface OtpInputProps {
    length?: number
    value: string
    onChange: (value: string) => void
    disabled?: boolean
    error?: boolean
}

export function OtpInput({ length = 6, value, onChange, disabled, error }: OtpInputProps) {
    const inputsRef = useRef<Array<HTMLInputElement | null>>([])
    const digits = Array.from({ length }, (_, i) => value[i] ?? "")

    function setDigit(index: number, digit: string) {
        const next = digits.slice()
        next[index] = digit
        onChange(next.join(""))
    }

    function handleChange(index: number, raw: string) {
        const digit = raw.replace(/\D/g, "").slice(-1)
        setDigit(index, digit)
        if (digit && index < length - 1) {
            inputsRef.current[index + 1]?.focus()
        }
    }

    function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Backspace" && !digits[index] && index > 0) {
            inputsRef.current[index - 1]?.focus()
        }
    }

    function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length)
        if (!pasted) return
        e.preventDefault()
        onChange(pasted.padEnd(length, "").slice(0, length).trimEnd() || pasted)
        const focusIndex = Math.min(pasted.length, length - 1)
        inputsRef.current[focusIndex]?.focus()
    }

    return (
        <div className="flex justify-between gap-2" role="group" aria-label="One-time verification code">
            {digits.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => {
                        inputsRef.current[index] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    value={digit}
                    disabled={disabled}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className={`font-mono h-12 w-11 rounded-md border bg-[#F4F5F7] text-center text-lg font-semibold text-[#11151B] outline-none transition-colors focus:border-[#FF5A1F] focus:ring-2 focus:ring-[#FF5A1F]/25 sm:h-14 sm:w-12 ${
                        error ? "border-red-400" : "border-[#D7DBE2]"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                />
            ))}
        </div>
    )
}
