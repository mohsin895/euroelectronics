

export interface SocialLink {
    platform: string
    url: string
}

type SettingRow = { type: string; value: unknown }

interface BusinessSettingsResponse {
    data: SettingRow[]
    success: boolean
    status: number
}

const API_BASE = process.env.NEXT_PUBLIC_DOMAIN

// Map of API field name -> platform key used by the footer's icon lookup
const LINK_FIELD_TO_PLATFORM: Record<string, string> = {
    facebook_link: "facebook",
    twitter_link: "twitter",
    instagram_link: "instagram",
    youtube_link: "youtube",
    linkedin_link: "linkedin",
}

export async function getSocialLinks(): Promise<SocialLink[]> {
    if (!API_BASE) {
        console.warn("NEXT_PUBLIC_DOMAIN is not set; skipping social link fetch.")
        return []
    }

    let json: BusinessSettingsResponse

    try {
        const res = await fetch(`${API_BASE}/business-settings`, {
            // Settings change rarely; tune revalidate to taste (seconds).
            next: { revalidate: 300 },
        })

        if (!res.ok) {
            console.warn(`business-settings request failed: ${res.status}`)
            return []
        }

        json = await res.json()
    } catch (err) {
        console.warn("business-settings fetch error:", err)
        return []
    }

    if (!json?.success || !Array.isArray(json.data)) {
        return []
    }

    // The API returns a flat array of {type, value} rows, sometimes with
    // duplicate `type` keys (later rows win, matching API/admin-panel intent).
    const settingsMap: Record<string, unknown> = {}
    for (const row of json.data) {
        settingsMap[row.type] = row.value
    }

    const socials: SocialLink[] = []

    for (const [field, platform] of Object.entries(LINK_FIELD_TO_PLATFORM)) {
        const value = settingsMap[field]
        if (typeof value === "string" && value.trim().length > 0) {
            socials.push({ platform, url: value.trim() })
        }
        // null, undefined, "", or non-string values are skipped entirely —
        // that platform's icon will not render.
    }

    return socials
}