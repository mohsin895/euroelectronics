
import { FloatingButtons } from "@/components/floating-buttons"
import { PoliciesLayout } from "@/components/policies-layout"
import {Header} from "@/components/header";
import {Footer} from "@/components/footer";


const DOMAIN = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""


async function getPageContent(slug: string): Promise<string | null> {
    try {
        const res = await fetch(`${DOMAIN}/settings`)
        if (!res.ok) return null
        const json = await res.json()
        const pages: { slug: string; content: string | null }[] = json.data ?? []
        const page = pages.find((p) => p.slug === slug)
        return page?.content ?? null
    } catch { return null }
}

export default async function ContactUsPage() {
    const [ content] = await Promise.all([

        getPageContent("contact"),
    ])

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <PoliciesLayout title="Contact Us">
                <div className="space-y-8">
                    {/* Store info block */}
                    <div className="rounded-lg border bg-card p-6">
                        <h2 className="text-xl font-semibold mb-2">Moto Empire</h2>
                        <p className="flex items-start gap-2 mb-2">
                            <span aria-hidden="true">📍</span>
                            <span>২৭৪/৩, খন্দকার প্লাজা, ৬০ ফিট মেইন রোড, মিরপুর, ঢাকা – ১২১৬</span>
                        </p>
                        <p className="flex items-start gap-2 mb-2 text-muted-foreground">
                            <span aria-hidden="true">✅</span>
                            <span>ইয়ামাহা শোরুম এর এক বিল্ডিং পর অথবা হোন্ডা শোরুমের ঠিক বিপরীতে</span>
                        </p>
                        <p className="flex items-center gap-2">
                            <span aria-hidden="true">📞</span>

                           <a href="https://wa.me/8801732206841"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium hover:underline"
                            >
                            Call/WhatsApp: +880 1732-206841
                        </a>
                    </p>
                </div>

                {/* Map embed */}
                    <div className="overflow-hidden rounded-lg border">

                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3652.161571953256!2d90.38890577533569!3d23.741617078676324!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8bfabd3f9eb%3A0xc9a1a118d82250cf!2sJoydul%20Manor%2C%20159%20New%20Elephant%20Rd%2C%20Dhaka%201205!5e0!3m2!1sen!2sbd!4v1783246196951!5m2!1sen!2sbd"
                            width="100%"
                            height="450"
                            style={{border: 0}}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="strict-origin-when-cross-origin"
                           ></iframe>
                    </div>

                    {/* Dynamic CMS content, if present */}
                    {content && (
                        <div
                            className="prose prose-neutral max-w-none dark:prose-invert"
                            dangerouslySetInnerHTML={{__html: content}}
                        />
                    )}
                </div>
            </PoliciesLayout>
            <Footer/>
            <FloatingButtons/>
        </div>
    )
}