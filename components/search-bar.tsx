'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, X } from 'lucide-react'
import { searchProducts, type UiProduct } from '@/lib/products'

interface SearchBarProps {
    placeholder?: string
    className?: string
    // Lets the mobile menu / drawer close itself when a result is picked
    onNavigate?: () => void
}

export function SearchBar({ placeholder = 'Search products...', className = '', onNavigate }: SearchBarProps) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<UiProduct[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    // Debounce the API call so we're not firing a request on every keystroke
    useEffect(() => {
        if (!query.trim()) {
            setResults([])
            setIsOpen(false)
            return
        }

        setIsLoading(true)
        const timeout = setTimeout(() => {
            searchProducts(query)
                .then((data) => {
                    setResults(data)
                    setIsOpen(true)
                })
                .catch((err) => {
                    console.error('[SearchBar] search failed:', err)
                    setResults([])
                })
                .finally(() => setIsLoading(false))
        }, 300)

        return () => clearTimeout(timeout)
    }, [query])

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    function handleClear() {
        setQuery('')
        setResults([])
        setIsOpen(false)
    }

    function handleClose() {
        setIsOpen(false)
    }

    function handleSelect(slug: string) {
        setIsOpen(false)
        setQuery('')
        onNavigate?.()
        router.push(`/product/${slug}`)
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!query.trim()) return
        setIsOpen(false)
        onNavigate?.()
        router.push(`/search?search=${encodeURIComponent(query)}`)
    }

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <form onSubmit={handleSubmit} className="w-full relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.trim() && setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full pl-4 pr-20 py-2.5 border-2 border-border focus:border-primary rounded-full bg-white text-sm outline-none transition-colors"
                />

                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {query && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Clear search"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    {isOpen && (
                        <button
                            type="button"
                            onClick={handleClose}
                            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Close search results"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        type="submit"
                        className="p-1 text-muted-foreground hover:text-primary transition-colors"
                        aria-label="Search"
                    >
                        <Search className="w-4 h-4" />
                    </button>
                </div>
            </form>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-border rounded-lg shadow-lg max-h-[420px] overflow-y-auto z-50">
                    {isLoading ? (
                        <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                            Searching...
                        </div>
                    ) : results.length === 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                            No products found for &quot;{query}&quot;
                        </div>
                    ) : (
                        results.map((product) => (
                            <button
                                key={product.id}
                                onClick={() => handleSelect(product.slug)}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left border-b border-border last:border-b-0"
                            >
                                <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden bg-muted">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                        sizes="48px"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                        {product.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-sm font-semibold text-primary">
                                            ৳{product.price.toLocaleString()}
                                        </span>
                                        {product.originalPrice > product.price && (
                                            <span className="text-xs text-muted-foreground line-through">
                                                ৳{product.originalPrice.toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}