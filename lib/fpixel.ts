// lib/fpixel.ts
declare global {
    interface Window {
        fbq?: (...args: any[]) => void
    }
}

/**
 * Fires a Meta Pixel standard event. Safe to call anywhere —
 * no-ops on the server or if the pixel hasn't loaded yet.
 */
export function fbqTrack(event: string, params?: Record<string, any>) {
    if (typeof window === "undefined" || typeof window.fbq !== "function") return
    if (params) {
        window.fbq("track", event, params)
    } else {
        window.fbq("track", event)
    }
}