import { Mail, PhoneCall, ChevronRight, Send } from "lucide-react"
import type { Brand, Footer } from "@/lib/types"

const socialPaths: Record<string, string> = {
    facebook:
        "M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z",
    youtube:
        "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12z",
    instagram:
        "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
    twitter:
        "M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616c0 .02 0 .04.005.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.224.085 4.93 4.93 0 004.604 3.42 9.9 9.9 0 01-6.115 2.107c-.398 0-.79-.023-1.176-.069a13.978 13.978 0 007.557 2.213c9.054 0 14-7.496 14-13.986 0-.21 0-.42-.015-.63a9.935 9.935 0 002.46-2.548z",
    linkedin:
        "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 11.001-4.124 2.062 2.062 0 01-.001 4.124zM7.114 20.452H3.558V9h3.556v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
    tiktok:
        "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
}

export function SiteFooter({ brand, footer }: { brand: Brand; footer: Footer }) {
    const hasSocials = footer.socials.length > 0

    return (
        <footer className="mt-6 bg-secondary text-foreground">
            <div className="mx-auto max-w-7xl px-4 py-12">
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
                    {/* Brand column */}
                    <div>
                        <div className="flex flex-col leading-none">
                            <span className="font-mono text-3xl font-extrabold italic tracking-tight">{brand.name}</span>
                            <span className="text-[11px] font-semibold tracking-widest text-muted-foreground">{brand.subtitle}</span>
                        </div>
                        <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">{brand.address}</p>
                        <a href={`mailto:${brand.email}`} className="mt-4 flex items-center gap-2 text-sm font-medium">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-foreground text-background">
                <Mail className="h-4 w-4" />
              </span>
                            {brand.email}
                        </a>

                        <div className="mt-5 flex items-center gap-3 rounded-xl border border-border bg-card p-4">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-foreground text-background">
                <PhoneCall className="h-6 w-6" />
              </span>
                            <div>
                                <p className="text-xs text-muted-foreground">{footer.supportLabel}</p>
                                <p className="text-lg font-extrabold">{brand.phone}</p>
                            </div>
                        </div>
                    </div>

                    {/* Necessary links */}
                    <div>
                        <h3 className="mb-4 text-base font-bold">{footer.linksTitle}</h3>
                        <ul className="space-y-3">
                            {footer.links.map((l) => (
                                <li key={l.url}>
                                    <a href={l.url} className="flex items-start gap-1.5 text-sm text-muted-foreground hover:text-accent">
                                        <ChevronRight className="mt-0.5 h-4 w-4 shrink-0" /> {l.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Information */}
                    <div>
                        <h3 className="mb-4 text-base font-bold">{footer.infoTitle}</h3>
                        <ul className="space-y-3">
                            {footer.info.map((l) => (
                                <li key={l.url}>
                                    <a href={l.url} className="flex items-start gap-1.5 text-sm text-muted-foreground hover:text-accent">
                                        <ChevronRight className="mt-0.5 h-4 w-4 shrink-0" /> {l.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="mb-4 border-b-2 border-foreground pb-2 text-base font-bold tracking-wide">
                            {footer.newsletterTitle}
                        </h3>
                        <p className="text-sm text-muted-foreground">{footer.newsletterText}</p>
                        <form className="mt-4 flex items-center overflow-hidden rounded-full bg-card p-1 shadow-sm">
                            <input
                                type="email"
                                required
                                placeholder="Your Email"
                                aria-label="Email address"
                                className="h-11 flex-1 bg-transparent px-4 text-sm outline-none"
                            />
                            <button
                                type="submit"
                                aria-label="Subscribe"
                                className="grid h-11 w-12 shrink-0 place-items-center rounded-full bg-foreground text-background"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </form>

                        {/* Only rendered when at least one platform has a real, non-null link */}
                        {hasSocials && (
                            <>
                                <p className="mt-6 text-xs font-bold tracking-widest text-muted-foreground">{footer.socialTitle}</p>
                                <div className="mt-3 flex flex-wrap gap-3">
                                    {footer.socials
                                        .filter((s) => s?.platform && s?.url)
                                        .map((s) => {
                                            const path = socialPaths[s.platform]
                                            return (

                                             <a   key={s.platform}
                                            href={s.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={s.platform}
                                            className="grid h-9 w-9 place-items-center rounded-full bg-card text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                                                >
                                                {path ? (
                                                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                                                            <path d={path} />
                                                        </svg>
                                                    ) : (
                                                        <span className="text-[10px] font-bold uppercase">{s.platform.slice(0, 2)}</span>
                                                    )}
                                        </a>
                                        )
                                        })}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-10 flex flex-col gap-1 border-t border-border pt-5 text-xs text-muted-foreground">
                    <p>{footer.copyright}</p>
                    <p>
                        Developed by: <a className="font-bold text-foreground" href="https://nelsistech.com">{footer.developer}</a>
                    </p>
                </div>
            </div>
        </footer>
    )
}