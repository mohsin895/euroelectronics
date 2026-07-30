'use client'

import Link from 'next/link'
import { Mail, MapPin, Phone, Share2, Send } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL

interface Subcategory {
    id: number
    name: string
    slug: string
}

interface Category {
    id: number
    name: string
    slug: string
    parent_id: number
    status: string
    subcategory: Subcategory[]
}

interface GeneralSettings {
    logo: string
    company_name: string
    phone: string
    email: string
    address: string
}

export function Footer() {
    const [settings, setSettings] = useState<GeneralSettings | null>(null)
    const [categories, setCategories] = useState<Category[]>([])

    useEffect(() => {
        async function loadFooterData() {
            try {
                const [settingsRes, categoriesRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/general-settings`),
                    fetch(`${API_BASE_URL}/category`),
                ])

                const settingsJson = await settingsRes.json()
                const categoriesJson = await categoriesRes.json()

                if (settingsJson?.success) {
                    setSettings(settingsJson.data)
                }
                if (categoriesJson?.success) {
                    // Only active, top-level categories, capped at 4 for the footer
                    const active = categoriesJson.data
                        .filter((c: Category) => c.status === 'Active' && c.parent_id === 0)
                        .slice(0, 4)
                    setCategories(active)
                }
            } catch (error) {
                console.error('Failed to load footer data:', error)
            }
        }

        loadFooterData()
    }, [])

    const logoSrc = settings?.logo ? `${IMAGE_BASE_URL}${settings.logo}` : '/logo.jpeg'
    const companyName = settings?.company_name || 'Eggs & Spice'

    return (
        <footer className="bg-secondary text-white py-12">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                    {/* Brand Info */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                                <Image src="/logo.jpeg" alt="logo" width={90} height={75} />
                            </Link>
                        </div>
                        <p className="text-sm opacity-80">
                            An e-commerce platform dedicated to providing safe and reliable food to every home.
                        </p>
                    </div>

                    {/* Information */}
                    <div>
                        <h4 className="font-semibold mb-4">Information</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/page/about-us" className="hover:text-primary opacity-80 hover:opacity-100">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/page/contact" className="hover:text-primary opacity-80 hover:opacity-100">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/page/company" className="hover:text-primary opacity-80 hover:opacity-100">
                                    Company Info
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Shop By */}
                    <div>
                        <h4 className="font-semibold mb-4">Shop By</h4>
                        <ul className="space-y-2 text-sm">
                            {categories.length > 0 ? (
                                categories.map((cat) => (
                                    <li key={cat.id}>
                                        <Link
                                            href={`/category/${cat.slug}`}
                                            className="hover:text-primary opacity-80 hover:opacity-100"
                                        >
                                            {cat.name}
                                        </Link>
                                    </li>
                                ))
                            ) : (
                                <li className="opacity-60">Loading categories...</li>
                            )}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-semibold mb-4">Support</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/page/faq" className="hover:text-primary opacity-80 hover:opacity-100">
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link href="/page/privacy-policy" className="hover:text-primary opacity-80 hover:opacity-100">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/page/terms-conditions" className="hover:text-primary opacity-80 hover:opacity-100">
                                    Terms & Conditions
                                </Link>
                            </li>
                            <li>
                                <Link href="/page/return-policy" className="hover:text-primary opacity-80 hover:opacity-100">
                                    Return Policy
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="grid md:grid-cols-3 gap-6 mb-8 py-8 border-t border-white/20">
                    <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div>
                            <div className="font-semibold">Address</div>
                            <div className="text-sm opacity-80">{settings?.address || 'Rampura, Dhaka, Bangladesh'}</div>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div>
                            <div className="font-semibold">Phone</div>
                            <div className="text-sm opacity-80">{settings?.phone || '+880 1712345678'}</div>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div>
                            <div className="font-semibold">Email</div>
                            <div className="text-sm opacity-80">{settings?.email || 'contact@eggsspices.com'}</div>
                        </div>
                    </div>
                </div>

                {/* Social Links */}
                <div className="flex justify-center gap-6 py-6 border-t border-white/20">
                    <a href="#" className="hover:text-primary opacity-80 hover:opacity-100">
                        <Share2 className="w-5 h-5" />
                    </a>
                    <a href="#" className="hover:text-primary opacity-80 hover:opacity-100">
                        <Send className="w-5 h-5" />
                    </a>
                    <a href="#" className="hover:text-primary opacity-80 hover:opacity-100">
                        <Mail className="w-5 h-5" />
                    </a>
                </div>

                {/* Copyright */}
                <div className="text-center text-sm opacity-70 pt-6">
                    <p>&copy; 2026 {companyName}. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}