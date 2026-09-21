import siteData from "@/data/site.json"
import type { SiteData } from "@/lib/types"
import { SiteHeader } from "@/components/site-header"
import { HeroSection } from "@/components/hero-section"
import { CategoriesSection } from "@/components/categories-section"
import { ProductSectionBlock, type ApiProductSection } from "@/components/product-section-block"
import { FeaturesBar } from "@/components/features-bar"
import { SiteFooter } from "@/components/site-footer"
import { FloatingButtons } from "@/components/floating-buttons"
import { Brand } from "@/components/brand"

import { getSocialLinks } from "@/lib/getSocials"
import type { Footer } from "@/lib/types"
import {HotOfferProduct, HotOfferSectopn} from "@/components/HotOffer";

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN ?? ""
const data = siteData as SiteData

// ─── Types ─────────────────────────────────────────────────────────────────────
interface ChildCategory {
    id: number
    name: string
    slug: string
}

interface SubCategory {
    id: number
    name: string
    slug: string
    child_categories: ChildCategory[]
}

export interface ApiCategory {
    id: number
    name: string
    slug: string
    order_level: number
    icon: string | null
    cover_image: string | null
    banner: string | null
    sub_categories: SubCategory[]
}

export interface BrandLinks {
    website?: string | null
    facebook?: string | null
    instagram?: string | null
    [key: string]: string | null | undefined
}

export interface Brand {
    id: number
    name: string
    slug: string
    logo: string | null
    links?: BrandLinks
}

export interface Slider {
    photo: string
    url: string
}

export interface Banner {
    photo: string
    url: string
}

// Static parts of the footer (link lists, newsletter copy, etc.) still come
// from site.json / hardcoded copy. Only `socials` is resolved dynamically
// from business-settings at request time — see getSocialLinks().
const staticFooterData: Omit<Footer, "socials"> = {
    linksTitle: "প্রয়োজনীয় লিংক",
    links: [
        { label: "আমাদের সাথে যোগাযোগ করুন", url: "/page/contact" },
        { label: "Order Procedure", url: "/page/order-procedure" },
        { label: "Delivery Rules", url: "/page/delivery-rules" },
        { label: "Return Policy", url: "/page/return-policy" },
    ],
    infoTitle: "INFORMATION",
    info: [
        { label: "সব পণ্য", url: "/shop" },
        { label: "Delivery Rules", url: "/page/delivery-rules" },
        { label: "Warranty", url: "/page/warranty" },
        { label: "Terms & Conditions", url: "/page/terms-conditions" },
        { label: "Privacy Policy", url: "/page/privacy-policy" },
    ],
    newsletterTitle: "NEWSLETTER",
    newsletterText: "Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.",
    socialTitle: "FOLLOW US ON",
    supportLabel: "কাস্টমার সাপোর্ট",
    copyright: "Copyright © 2026 Euro Electronics BD. All Rights Reserved.",
    developer: "Nelsistech",
}

const brand = {
    name: "Euro Electronics",
    subtitle: "Euro Electronics.",
    phone: "01732206841",
    email: "bdmotoempire@gmail.com",
    address: "274/3, Khandaker Plaza, 60 Feet Main Road, Mirpur, Dhaka-1216",
}

// ─── Generic fetcher ───────────────────────────────────────────────────────────
async function apiFetch<T>(path: string, fallback: T): Promise<T> {
    const url = `${DOMAIN}/${path}`
    try {
        console.log(`[fetch] ${url}`)
        const res = await fetch(url, { next: { revalidate: 60 } })
        if (!res.ok) {
            console.error(`[fetch] ${url} → ${res.status} ${res.statusText}`)
            return fallback
        }
        const json = await res.json()
        console.log(`[fetch] ${url} → success:${json.success}`)
        return json
    } catch (err) {
        console.error(`[fetch] ${url} → ERROR:`, err)
        return fallback
    }
}

// ─── Server-side fetchers ───────────────────────────────────────────────────────
async function getCategories(): Promise<ApiCategory[]> {
    const json = await apiFetch<{ success: boolean; data: ApiCategory[] }>(
        "categories", { success: false, data: [] }
    )
    console.log(json);
    return json.success && Array.isArray(json.data) ? json.data : []
}

async function getBrands(): Promise<Brand[]> {
    const json = await apiFetch<{ success: boolean; data: Brand[] }>(
        "brands", { success: false, data: [] }
    )
    return json.success && Array.isArray(json.data) ? json.data : []
}
async function getSliders(): Promise<Slider[]> {
    const json = await apiFetch<{ success: boolean; data: Slider[] }>(
        "sliders", { success: false, data: [] }
    )
    return json.success && Array.isArray(json.data) ? json.data : []
}

async function getBanner(): Promise<Banner | null> {
    const json = await apiFetch<{ success: boolean; data: Banner[] }>(
        "banners-one", { success: false, data: [] }
    )
    return json.success && json.data?.length ? json.data[0] : null
}

async function getFlashDeals(): Promise<HotOfferProduct[]> {
    const json = await apiFetch<{ success: boolean; data: HotOfferProduct[] }>(
        "products/todays-deal", { success: false, data: [] }
    )
    return json.success && Array.isArray(json.data) ? json.data : []
}

async function getProductSections(): Promise<ApiProductSection[]> {
    const json = await apiFetch<{ success: boolean; data: ApiProductSection[] }>(
        "categories/products", { success: false, data: [] }
    )

    return json.success && Array.isArray(json.data)
        ? json.data.filter((s) => s.products.length > 0)
        : []
}

// ─── Page ───────────────────────────────────────────────────────────────────────
export default async function HomePage() {
    const [categories, sliders, banner, flashDeals, sections, brands, socials] = await Promise.all([
        getCategories(),
        getSliders(),
        getBanner(),
        getFlashDeals(),
        getProductSections(),
        getBrands(),
        getSocialLinks(),
    ])

    const footer: Footer = {
        ...staticFooterData,
        socials,
    }

    return (
        <div className="min-h-screen bg-background">
            <SiteHeader brand={data.brand} categories={categories} />
            <main>
                <HeroSection sliders={sliders} banner={banner} />

                <CategoriesSection categories={categories} />
             <HotOfferSectopn deals={flashDeals} />

                <Brand brands={brands} />
                {sections.map((section) => (
                    <ProductSectionBlock key={section.name} section={section} />
                ))}


            </main>
            <SiteFooter brand={data.brand} footer={footer} />
            <FloatingButtons />
        </div>
    )
}