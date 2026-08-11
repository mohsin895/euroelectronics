"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Search, X } from "lucide-react"
import type { ApiProduct } from "@/components/product-card"
import Image from "next/image"
const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN ?? ""
const IMAGE = process.env.NEXT_PUBLIC_PATH ?? ""
interface SearchBarProps {
    placeholder?: string
}

function parsePrice(str: string): number {
    return parseFloat(str.replace(/[^\d.]/g, "")) || 0
}

export function SearchBar({ placeholder = "পণ্য খুঁজুন..." }: SearchBarProps) {
    const [query, setQuery]         = useState("")
    const [results, setResults]     = useState<ApiProduct[]>([])
    const [loading, setLoading]     = useState(false)
    const [open, setOpen]           = useState(false)
    const [highlighted, setHighlighted] = useState(-1)

    const inputRef      = useRef<HTMLInputElement>(null)
    const containerRef  = useRef<HTMLDivElement>(null)
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    // ── fetch suggestions ──────────────────────────────────────────────────
    const fetchResults = useCallback(async (q: string) => {
        if (!q.trim()) { setResults([]); setOpen(false); return }
        setLoading(true)
        try {
            const res  = await fetch(`${DOMAIN}/products/search?q=${encodeURIComponent(q)}`)
            const json = await res.json()
            const hits: ApiProduct[] = json.success && Array.isArray(json.data) ? json.data : []
            setResults(hits.slice(0, 8))          // cap dropdown at 8
            setOpen(true)
            setHighlighted(-1)
        } catch {
            setResults([])
        } finally {
            setLoading(false)
        }
    }, [])

    // ── debounce input ─────────────────────────────────────────────────────
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const q = e.target.value
        setQuery(q)
        if (debounceTimer.current) clearTimeout(debounceTimer.current)
        if (!q.trim()) { setResults([]); setOpen(false); return }
        debounceTimer.current = setTimeout(() => fetchResults(q), 280)
    }

    // ── keyboard navigation ────────────────────────────────────────────────
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!open) return
        if (e.key === "ArrowDown") {
            e.preventDefault()
            setHighlighted(h => Math.min(h + 1, results.length))   // +1 for "see all"
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setHighlighted(h => Math.max(h - 1, -1))
        } else if (e.key === "Enter") {
            e.preventDefault()
            if (highlighted === results.length) {
                // "See all results" row
                goToSearch()
            } else if (highlighted >= 0 && results[highlighted]) {
                window.location.href = `/product/${results[highlighted].slug}`
            } else {
                goToSearch()
            }
        } else if (e.key === "Escape") {
            setOpen(false)
            inputRef.current?.blur()
        }
    }

    const goToSearch = () => {
        if (query.trim()) window.location.href = `/search?q=${encodeURIComponent(query.trim())}`
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        goToSearch()
    }

    // ── close on outside click ─────────────────────────────────────────────
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    const clearQuery = () => {
        setQuery("")
        setResults([])
        setOpen(false)
        inputRef.current?.focus()
    }

    return (
        <div ref={containerRef} className="relative flex-1">
            <form onSubmit={handleSubmit}>
                <input
                    ref={inputRef}
                    type="search"
                    value={query}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => { if (results.length) setOpen(true) }}
                    placeholder={placeholder}
                    aria-label="Search products"
                    aria-autocomplete="list"
                    aria-expanded={open}
                    aria-controls="search-dropdown"
                    autoComplete="off"
                    className="h-11 w-full rounded-full border border-border bg-secondary/60 pl-5 pr-20 text-sm outline-none focus:border-[#EE2430] focus:ring-2 focus:ring-[#EE2430]/30 transition-all"
                />

                {/* Clear button */}
                {query && (
                    <button
                        type="button"
                        onClick={clearQuery}
                        aria-label="Clear search"
                        className="absolute right-10 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}

                {/* Search button */}
                <button
                    type="submit"
                    aria-label="Search"
                    className="absolute right-1 top-1 grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:text-foreground transition-colors"
                >
                    {loading
                        ? <span className="h-4 w-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                        : <Search className="h-5 w-5" />
                    }
                </button>
            </form>

            {/* ── Dropdown ── */}
            {open && (
                <div
                    id="search-dropdown"
                    role="listbox"
                    className="absolute left-0 right-0 top-[calc(100%+6px)] z-[70] overflow-hidden rounded-xl border border-border bg-white shadow-[0_8px_40px_rgba(0,0,0,0.13)] animate-search-drop"
                >
                    {results.length === 0 && !loading && (
                        <div className="px-5 py-6 text-center text-sm text-muted-foreground">
                            কোনো পণ্য পাওয়া যায়নি।
                        </div>
                    )}

                    <ul>
                        {results.map((product, i) => {
                            const mainPrice   = product.has_discount ? parsePrice(product.stroked_price) : parsePrice(product.main_price)
                            const offerPrice  = product.has_discount ? parsePrice(product.main_price) : null
                            const isHighlight = highlighted === i

                            return (
                                <li
                                    key={product.id}
                                    role="option"
                                    aria-selected={isHighlight}
                                    onMouseEnter={() => setHighlighted(i)}
                                    onMouseLeave={() => setHighlighted(-1)}
                                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-border/50 last:border-0 transition-colors ${
                                        isHighlight ? "bg-[#FFF5F6]" : "hover:bg-gray-50"
                                    }`}
                                    onClick={() => { window.location.href = `/product/${product.slug}` }}
                                >
                                    {/* Thumbnail */}
                                    {/* Thumbnail */}
                                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary">
                                        {product.thumbnail_image ? (
                                            <Image
                                                src={`${product.thumbnail_image}`}
                                                alt={product.name}
                                                fill
                                                className="object-cover"
                                                sizes="48px"
                                            />
                                        ) : (
                                            <div className="h-full w-full bg-secondary" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="min-w-0 flex-1">
                                        <p className={`truncate text-[13px] font-semibold leading-snug ${isHighlight ? "text-[#EE2430]" : "text-foreground"}`}>
                                            {product.name}
                                        </p>
                                        <div className="mt-1 flex items-baseline gap-2">
        <span className="text-[13px] font-bold text-foreground">
            {product.main_price}
        </span>
                                            {product.has_discount && (
                                                <span className="text-[11px] text-muted-foreground line-through">
                {product.stroked_price}
            </span>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>

                    {/* "See all results" footer */}
                    {results.length > 0 && (
                        <div
                            role="option"
                            aria-selected={highlighted === results.length}
                            onMouseEnter={() => setHighlighted(results.length)}
                            onMouseLeave={() => setHighlighted(-1)}
                            onClick={goToSearch}
                            className={`flex cursor-pointer items-center justify-center gap-1.5 px-4 py-3 text-sm font-semibold text-[#EE2430] border-t border-border transition-colors ${
                                highlighted === results.length ? "bg-[#FFF5F6]" : "hover:bg-[#FFF5F6]"
                            }`}
                        >
                            See all results for &ldquo;{query}&rdquo;
                        </div>
                    )}
                </div>
            )}

            <style>{`
        @keyframes searchDrop {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-search-drop { animation: searchDrop 0.14s ease-out forwards; }
      `}</style>
        </div>
    )
}