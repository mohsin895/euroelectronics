interface FormMessageProps {
    tone: "error" | "success"
    children: React.ReactNode
}

export function FormMessage({ tone, children }: FormMessageProps) {
    const styles =
        tone === "error"
            ? "border-red-200 bg-red-50 text-red-600"
            : "border-emerald-200 bg-emerald-50 text-emerald-700"

    return <div className={`rounded-md border px-3 py-2 text-sm ${styles}`}>{children}</div>
}
