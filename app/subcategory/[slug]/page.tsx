
import {SubCategoryPageClient} from "@/components/sub-category-page";

export default async function SubCategoryPage({
                                               params,
                                           }: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    return <SubCategoryPageClient slug={slug} />
}