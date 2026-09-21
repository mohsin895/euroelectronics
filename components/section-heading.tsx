export function SectionHeading({
                                   title,
                                   href,
                                   showMore = true,
                               }: {
    title: string
    href?: string
    showMore?: boolean
}) {
    return (
        <div className="mb-6 flex items-center border-b border-border pb-3">
            <h2 className="dynamic-section-title font-encode-sans text-lg lg:text-3xl text-coarse-wool font-semibold text-left normal-case">
                {title}
            </h2>

            {showMore && (
                <a
                    href={href}
                    className="ml-auto text-sm font-semibold text-muted-foreground hover:text-accent tracking-wide uppercase"
                >
                    VIEW MORE &gt;
                </a>
            )}
        </div>
    )
}