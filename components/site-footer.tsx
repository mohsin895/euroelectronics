import { MapPin, PhoneCall, Mail } from "lucide-react"
import type { Brand, Footer } from "@/lib/types"

/* ---------------------------------------------------------------------- */
/*  Icon paths (kept inline so the component has zero extra dependencies) */
/* ---------------------------------------------------------------------- */

const socialPaths: Record<string, string> = {
    facebook:
        "M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z",
    youtube:
        "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12z",
    instagram:
        "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
    linkedin:
        "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 11.001-4.124 2.062 2.062 0 01-.001 4.124zM7.114 20.452H3.558V9h3.556v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
    whatsapp:
        "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z M12.001 2C6.478 2 2 6.477 2 12c0 1.876.512 3.633 1.404 5.145L2 22l4.994-1.36A9.945 9.945 0 0012.001 22c5.522 0 10-4.477 10-10S17.523 2 12.001 2z",
}

/* Generic, non-trademarked payment badges — flat monogram tiles rather than
   reproductions of any card network's or wallet's actual logo artwork. */
const paymentBadges = [
    { label: "AMEX", bg: "#1F72B6" },
    { label: "MC", bg: "#EB6238" },
    { label: "VISA", bg: "#2A3990" },
    { label: "বিকাশ", bg: "#E2136E" },
    { label: "নগদ", bg: "#F7941D" },
    { label: "ROCKET", bg: "#8B2E8C" },
]

export function SiteFooter({ brand, footer }: { brand: Brand; footer: Footer }) {
    const hasSocials = footer.socials.length > 0

    return (
        <footer className="mt-6" style={{ backgroundColor: "#454C5C", color: "#F4F5F7" }}>
            <div className="mx-auto max-w-7xl px-6 py-12">
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
                    {/* Brand / address / socials */}
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-2xl font-extrabold italic tracking-tight" style={{ color: "#E2001A" }}>
                                {brand.name}
                            </span>
                            {brand.subtitle && (
                                <span className="border-l border-white/30 pl-2 text-sm font-semibold tracking-wide text-white">
                                    {brand.subtitle}
                                </span>
                            )}
                        </div>

                        <h3 className="mt-5 text-sm font-bold">{footer.addressTitle ?? "Corporate Address"}</h3>
                        <p className="mt-1 max-w-xs text-sm leading-relaxed text-white/70">{brand.address}</p>

                        {hasSocials && (
                            <>
                                <h3 className="mt-6 text-sm font-bold">{footer.socialTitle ?? "Connect with Us"}</h3>
                                <div className="mt-3 flex flex-wrap items-center gap-2.5">
                                    {footer.socials
                                        .filter((s) => s?.platform && s?.url)
                                        .map((s) => {
                                            const path = socialPaths[s.platform]
                                            return (
                                                <a
                                                    key={s.platform}
                                                    href={s.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label={s.platform}
                                                    className="grid h-9 w-9 place-items-center rounded-full text-white transition-opacity hover:opacity-80"
                                                    style={{ backgroundColor: "#E2001A" }}
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

                        {footer.storeLocatorUrl && (
                            <a
                                href={footer.storeLocatorUrl}
                                className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                            >
                                <MapPin className="h-4 w-4" />
                                {footer.storeLocatorLabel ?? "Store & Service Locations"}
                            </a>
                        )}
                    </div>

                    {/* Necessary links */}
                    <div>
                        <h3 className="mb-4 text-sm font-bold">{footer.linksTitle}</h3>
                        <ul className="space-y-3">
                            {footer.links.map((l) => (
                                <li key={l.url}>
                                    <a href={l.url} className="text-sm text-white/75 transition-colors hover:text-white">
                                        {l.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Help services */}
                    <div>
                        <h3 className="mb-4 text-sm font-bold">{footer.infoTitle}</h3>
                        <ul className="space-y-3">
                            {footer.info.map((l) => (
                                <li key={l.url}>
                                    <a href={l.url} className="text-sm text-white/75 transition-colors hover:text-white">
                                        {l.label}
                                    </a>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-5 border-t border-white/15 pt-5">
                            <p className="flex items-center gap-2 text-sm font-bold">
                                <PhoneCall className="h-4 w-4" style={{ color: "#E2001A" }} />
                                {footer.supportLabel ?? "Got Question? Reach us 24/7!"}
                            </p>
                            <div className="mt-2 space-y-1 text-sm">
                                {footer.phones?.map((p) => (
                                    <p key={p.number}>
                                        <a href={`tel:${p.number}`} className="font-bold underline decoration-white/40 underline-offset-2">
                                            {p.number}
                                        </a>{" "}
                                        <span className="text-white/60">{p.note}</span>
                                    </p>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4">
                            <p className="flex items-center gap-2 text-sm font-bold">
                                <Mail className="h-4 w-4" style={{ color: "#E2001A" }} />
                                Email Us
                            </p>
                            <a href={`mailto:${brand.email}`} className="mt-1 block text-sm text-white/75 hover:text-white">
                                {brand.email}
                            </a>
                        </div>
                    </div>

                    {/* Payment methods */}
                    <div>
                        <h3 className="mb-4 text-sm font-bold">{footer.paymentTitle ?? "Payment Methods"}</h3>
                        <div className="flex flex-col gap-2.5">
                            <span className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold" style={{ backgroundColor: "#5B6376" }}>
                                <span className="grid h-5 w-7 place-items-center rounded-sm" style={{ backgroundColor: "#E2001A" }}>
                                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                </span>
                                Cash On Delivery
                            </span>
                            <span className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold" style={{ backgroundColor: "#5B6376" }}>
                                <span className="grid h-5 w-5 place-items-center rounded-sm" style={{ backgroundColor: "#3FA9F5" }}>
                                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                </span>
                                Easy monthly installments
                            </span>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-2.5">
                            {paymentBadges.map((b) => (
                                <span
                                    key={b.label}
                                    className="flex h-9 items-center justify-center rounded-md text-[10px] font-extrabold tracking-wide text-white"
                                    style={{ backgroundColor: b.bg }}
                                >
                                    {b.label}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-10 flex flex-col gap-1 border-t border-white/15 pt-5 text-xs text-white/60">
                    <p>{footer.copyright}</p>
                    <p>
                        Developed by:{" "}
                        <a className="font-bold text-white" href="https://nelsistech.com">
                            {footer.developer}
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    )
}