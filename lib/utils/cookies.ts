// Minimal cookie helpers — no external dependency.
// Used to persist the auth token so it can also be read by middleware
// for route protection if needed later.

const TOKEN_KEY = "dcs_token"
const TOKEN_MAX_AGE_DAYS = 30

export function setAuthToken(token: string) {
    if (typeof document === "undefined") return
    const maxAge = TOKEN_MAX_AGE_DAYS * 24 * 60 * 60
    document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; samesite=lax`
}

export function getAuthToken(): string | null {
    if (typeof document === "undefined") return null
    const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${TOKEN_KEY}=`))
    return match ? decodeURIComponent(match.split("=")[1]) : null
}

export function clearAuthToken() {
    if (typeof document === "undefined") return
    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`
}
