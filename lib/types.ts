export interface Brand {
    name: string
    subtitle: string
    phone: string
    email: string
    address: string
}

export interface NavLeaf {
    label: string
    href: string
}

export interface NavChild {
    label: string
    href: string
    children?: NavLeaf[]
}

export interface NavItem {
    label: string
    href: string
    hasDropdown?: boolean
    children?: NavChild[]
}

export interface HeroSlide {
    id: string
    title: string
    highlight: string
    discount: string
    phone: string
    location: string
    website: string
    bg: string
}

export interface SideBanner {
    title: string
    subtitle: string
    image: string
}

export interface Category {
    name: string
    image: string
}

export interface ProductVariant {
    label: string
    options: string[]
}

export interface Product {
    id: string
    name: string
    image: string
    price: number
    oldPrice: number
    save: number
    variant?: ProductVariant
}

export interface FlashSale {
    endsInSeconds: number
    products: Product[]
}

export interface ProductSection {
    id: string
    title: string
    products: Product[]
}

export interface Feature {
    icon: string
    title: string
    subtitle: string
}

export interface SocialLink {
    platform: string
    url: string
}

export interface Footer {
    linksTitle: string
    links: { label: string; url: string }[]
    info: { label: string; url: string }[]
    infoTitle: string

    newsletterTitle: string
    newsletterText: string
    socialTitle: string
    socials: SocialLink[]
    supportLabel: string
    copyright: string
    developer: string
}
export interface SiteData {
    brand: Brand
    nav: NavItem[]
    heroSlides: HeroSlide[]
    sideBanner: SideBanner
    categories: Category[]
    flashSale: FlashSale
    sections: ProductSection[]
    features: Feature[]
    footer: Footer
}

export interface ShippingArea {
    id: number
    label: string
    value: number
}

export interface AdvanceRule {
    id: number
    cart_setting_id: number
    min_order_amount: number
    max_order_amount: number | null
    advance_payment_type: "full" | "half" | string
    advance_percentage: number
    fixed_delivery_charge: number
    label: string
    delivery_charge_advance_enabled: number
    delivery_advance_type: string
    sort_order: number
    is_active: boolean
}

export interface CartSettings {
    id: number
    online_payment_discount_enabled: boolean
    online_payment_discount_percent: number
    discount_valid_from: string
    discount_valid_until: string
    delivery_charge_advance_required: boolean
    delivery_charge_amount: number
    delivery_charge_free: string
    free_delivery_min_order: string
    default_delivery_charge: string
    delivery_charge_advance_enabled: number
    delivery_advance_type: string
    advance_rules: AdvanceRule[]
}