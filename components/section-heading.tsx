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
        <div className="mb-6 flex items-center justify-between border-b border-border pb-3">
            <h2 className="flex items-center gap-3 text-lg font-extrabold tracking-wide text-foreground md:text-xl">
                <span className="h-6 w-1.5 rounded-full bg-accent" />
                {title}
            </h2>
            {showMore && (
                <a
                    href={href}
                    className="text-sm font-semibold text-muted-foreground hover:text-accent tracking-wide uppercase"
                >
                    VIEW MORE &gt;
                </a>
            )}
        </div>
    )
}