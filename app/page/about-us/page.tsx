
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

        getPageContent("about-us"),
    ])

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <PoliciesLayout title="About Us">
                <div className="space-y-8">
                    {/* Store info block */}
                    <div className="rounded-lg border bg-card p-6">
                        <h2 className="text-xl font-semibold mb-2">Eggs & Spices</h2>
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
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3650.691279825216!2d90.36529039999999!3d23.7940054!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c117471793b9%3A0x8289f5a4b935df0a!2sMoto%20Empire!5e0!3m2!1sen!2sbd!4v1782643030029!5m2!1sen!2sbd"
                            width="100%"
                            height="450"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="strict-origin-when-cross-origin"
                            title="Moto Empire location map"
                        />
                    </div>

                    {/* Dynamic CMS content, if present */}
                    {content && (
                        <div
                            className="prose prose-neutral max-w-none dark:prose-invert"
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    )}
                </div>
            </PoliciesLayout>
            <Footer />
            <FloatingButtons />
        </div>
    )
}