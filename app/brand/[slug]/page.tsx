import { BrandPageClient } from '@/components/brand-page'

export default async function BrandPage({
                                            params,
                                        }: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    return <BrandPageClient slug={slug} />
}