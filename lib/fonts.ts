import { Rajdhani } from "next/font/google"

/**
 * Rajdhani is a condensed, technical/industrial face — used sparingly for
 * eyebrows, the wordmark, and gauge labels on the auth screens to give them
 * a "dashboard" feel that matches the motorsport-gear brand.
 *
 * It's scoped to the auth pages via this CSS variable rather than added to
 * the root layout, so it doesn't affect the rest of the site.
 */
export const rajdhani = Rajdhani({
    variable: "--font-rajdhani",
    subsets: ["latin"],
    weight: ["500", "600", "700"],
})
