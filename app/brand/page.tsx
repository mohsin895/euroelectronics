import siteData from "@/data/site.json"
import type { SiteData } from "@/lib/types"
import type { ApiCategory } from "@/app/page"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { FloatingButtons } from "@/components/floating-buttons"
import { BrandHistoryHero } from "@/components/brand-history-hero"
import { BrandHistorySection } from "@/components/brand-history-section"
import { BrandHistoryPager } from "@/components/brand-history-pager"
import type { BrandHistoryEntry } from "@/lib/brand-history-types"

const data = siteData as SiteData
const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN ?? ""

async function getBrands(): Promise<ApiCategory[]> {
    try {
        const res = await fetch(`${DOMAIN}/categories`, { next: { revalidate: 60 } })
        if (!res.ok) return []
        const json = await res.json()
        return json.success && Array.isArray(json.data) ? json.data : []
    } catch {
        return []
    }
}

// Replace with a fetch from your CMS/API once brand history copy lives there.
const brandHistoryEntries: BrandHistoryEntry[] = [
    {
        id: "bosch-siemens",
        brand: "BOSCH-SIEMENS",
        image: "/images/brand-history/bosch-siemens.jpg",
        paragraphs: [
            "BSH Hausgerate GmbH (or BSH Home Appliances) is the largest manufacturer of home appliances in Europe and one of the leading companies in the sector worldwide. The group stemmed from a joint venture set up in May 1967 between Robert Bosch GmbH (Stuttgart) and Siemens AG (Munich) and posted annual sales of 13.2 billion euros in the year 2019. Today, BSH operates some 40 factories in Europe, the USA, Latin America and Asia. Together with a global network of sales, production, and service companies, the BSH conglomerate today is made up of about 80 companies in 50 countries, with a total workforce of about 58,200 people.",
            "In September 2014, Robert Bosch GmbH agreed to purchase Siemens' 50% stake in the joint venture for 3 billion euros. The BSH product range includes large home appliances for cooking, dish-washing, laundry (washing and drying), refrigeration and freezing, as well as a multitude of small appliances, such as fully automatic espresso machines, floor care and hot water appliances (consumer products).",
        ],
    },
    {
        id: "electrolux",
        brand: "Electrolux",
        image: "/images/brand-history/electrolux.jpg",
        linkHref: "https://www.electroluxgroup.com",
        linkLabel: "www.electroluxgroup.com",
        paragraphs: [
            "Electrolux, a well-known Swedish appliance company, whose name is firmly entrenched in many consumers' minds, was founded by Swedish entrepreneur, Axel Wenner-Gren. Electrolux is a leading global appliance company that has shaped living for the better for more than 100 years by reinventing taste, care and wellbeing experiences, making life more enjoyable and sustainable for millions of people. As a leading global appliance company, Electrolux place the consumer at the heart of everything they do. Through their brands, including Electrolux, AEG, Anova, Frigidaire, Westinghouse and Zanussi, Electrolux sell more than 60 million household and professional products in more than 150 markets every year.",
            "In Europe, Electrolux has factories located in Italy, Germany, Sweden, the UK and France, and is currently growing fast in Eastern and Central Europe. Electrolux recently celebrated the opening of a new, state-of-the-art refrigeration plant, which is the largest one in the Asia Pacific, marking the third and largest expansion of its operations in Thailand. In South East Asia, the Electrolux brand is well known for high-quality kitchen, laundry and floor care products. In China, Electrolux focuses on the premium segment within kitchen, laundry and floor care products. Electrolux has production units in Australia, China, and Thailand. China is important to Stockholm-headquartered Electrolux as both an end market and a manufacturing source.",
        ],
    },
]

export default async function BrandHistoryPage() {
    const categories = await getBrands()
    const sectionIds = brandHistoryEntries.map((entry) => entry.id)

    return (
        <div className="min-h-screen bg-background">
            <SiteHeader brand={data.brand} categories={categories} />

            <BrandHistoryHero image="/brand.webp" />

            {brandHistoryEntries.map((entry, index) => (
                <div key={entry.id} id={entry.id}>
                    <BrandHistorySection
                        entry={entry}
                        imagePosition={index % 2 === 0 ? "right" : "left"}
                        tone={index % 2 === 0 ? "white" : "gray"}
                    />
                </div>
            ))}

            <BrandHistoryPager ids={sectionIds} />

            <SiteFooter brand={data.brand} footer={data.footer} />
            <FloatingButtons />
        </div>
    )
}