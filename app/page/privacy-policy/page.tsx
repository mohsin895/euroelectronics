
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

export default async function PrivacyPolicy() {
    const [ content] = await Promise.all([

        getPageContent("privacy-policy"),
    ])

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <PoliciesLayout title="Privacy Policy">
                {content ? (
                    <div
                        className="prose prose-neutral max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                ) : (
                    <p className="text-muted-foreground">Content not available.</p>
                )}
            </PoliciesLayout>
            <Footer />
            <FloatingButtons />
        </div>
    )
}