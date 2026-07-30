'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface Category {
    id: number
    name: string
    image: string | null
    parent_id: number
    status: string
    slug:string
    code: string | null
    subcategory?: Category[]
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export function CategoryMenu() {
    const [categories, setCategories] = useState<Category[]>([])
    const [openId, setOpenId] = useState<number | null>(null)

    useEffect(() => {
        fetch(`${API_BASE_URL}/category`)
            .then((res) => res.json())
            .then((res) => {
                const data: Category[] = res?.data ?? []
                // Only show active, top-level categories in the nav
                const topLevel = data.filter((c) => c.parent_id === 0 && c.status === 'Active')
                setCategories(topLevel)
            })
            .catch((err) => console.error('[v0] Failed to fetch categories:', err))
    }, [])

    if (categories.length === 0) return null

    return (
        <nav className="hidden md:flex px-6 bg-[#c22f17] justify-center py-3 overflow-visible relative z-40">
            <div className="flex gap-8">
                {categories.map((category) => {
                    const slug = category.slug
                    const children = (category.subcategory ?? []).filter((c) => c.status === 'Active')
                    const hasChildren = children.length > 0
                    const isOpen = openId === category.id

                    return (
                        <div
                            key={category.id}
                            className="relative"
                            onMouseEnter={() => setOpenId(category.id)}
                            onMouseLeave={() => setOpenId(null)}
                        >
                            <Link
                                href={`/category/${slug}`}
                                className={`flex items-center gap-1 text-sm font-medium whitespace-nowrap transition-colors ${
                                    isOpen ? 'text-[#E8722C]' : 'text-white hover:text-[#E8722C]'
                                }`}
                            >
                                {category.name}
                                {hasChildren && (
                                    <ChevronDown
                                        className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                    />
                                )}
                            </Link>

                            {hasChildren && isOpen && (
                                <div className="absolute left-0 top-full pt-2 z-50">
                                    <div className="bg-white rounded-md shadow-xl border border-border py-2 min-w-[180px]">
                                        {children.map((child) => (
                                            <Link
                                                key={child.id}
                                                href={`/subcategory/${child.slug}`}
                                                className="block px-4 py-2 text-sm text-foreground hover:text-[#E8722C] transition-colors"
                                            >
                                                {child.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </nav>
    )
}