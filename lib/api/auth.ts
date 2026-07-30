import type {
    ApiEnvelope,
    CheckPhonePayload,
    ConfirmCodePayload,
    ConfirmResetPayload,
    ForgetPasswordPayload,
    LoginPayload,
    LoginResponseData,
    SignupPayload,
    SignupResponseData,
    UserResponseData,
} from "@/lib/types/auth"

const DOMAIN = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
const AUTH_BASE = `${DOMAIN}/auth`

/**
 * NOTE ON FIELD NAMES
 * These payload shapes (email_or_phone, f_name/l_name, reset_token, etc.)
 * follow the conventional field names for this auth route layout. If your
 * AuthController / PasswordResetController expect different keys, this is
 * the only file that needs to change — every page below calls through here.
 */

interface RequestOptions {
    method?: "GET" | "POST"
    body?: object   // ← was Record<string, unknown>; `object` accepts all typed payload interfaces
    token?: string
}

async function authRequest<T>(path: string, options: RequestOptions = {}): Promise<ApiEnvelope<T>> {
    const { method = "POST", body, token } = options

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
    }
    if (token) headers["Authorization"] = `Bearer ${token}`

    try {
        const res = await fetch(`${AUTH_BASE}/${path}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        })

        const json = (await res.json().catch(() => null)) as Record<string, unknown> | null

        if (!json) {
            return { success: false, message: "Unexpected response from server." }
        }

        // Shape 1: { result: true, access_token: "...", ...rest }
        if (json.success === undefined && json.result !== undefined) {
            const { result, message, errors, access_token, ...rest } = json
            return {
                success: result as boolean,
                message: message as string | undefined,
                errors: errors as ApiEnvelope<T>["errors"],
                data: {
                    ...rest,
                    ...(access_token ? { token: access_token } : {}),
                } as T,
            }
        }

        // Shape 2: { success: true/false, data?: ..., message?: ... }
        if (json.success !== undefined) {
            return json as unknown as ApiEnvelope<T>
        }

        // Shape 3: raw object with no success/result field (e.g. GET /auth/user)
        // If HTTP 200 and has an "id" field → treat as successful user data
        if (res.ok && json.id !== undefined) {
            return { success: true, data: json as unknown as T }
        }

        // HTTP error with no success field
        if (!res.ok) {
            return { success: false, message: (json.message as string) ?? "Something went wrong." }
        }

        return { success: true, data: json as unknown as T }

    } catch {
        return { success: false, message: "Could not reach the server. Check your connection and try again." }
    }
}
// ─── Login / Signup ──────────────────────────────────────────────────────────
export function loginUser(payload: LoginPayload) {
    return authRequest<LoginResponseData>("login", { body: payload })
}

export function signupUser(payload: SignupPayload) {
    return authRequest<SignupResponseData>("signup", { body: payload })
}

export function checkPhoneNumber(payload: CheckPhonePayload) {
    return authRequest<Record<string, never>>("check-phone-number", { body: payload })
}

// ─── Phone (OTP) verification — requires the token from login/signup ────────
export function confirmCode(payload: ConfirmCodePayload, token: string) {
    return authRequest<Record<string, never>>("confirm_code", { body: payload, token })
}

export function resendCode(token: string) {
    return authRequest<Record<string, never>>("resend_code", { method: "GET", token })
}

// ─── Current user ─────────────────────────────────────────────────────────────
export function getCurrentUser(token: string) {
    return authRequest<UserResponseData>("user", { method: "GET", token })
}

export function logoutUser(token: string) {
    return authRequest<Record<string, never>>("logout", { method: "GET", token })
}

// ─── Password reset (no token required) ─────────────────────────────────────
export function forgetPasswordRequest(payload: ForgetPasswordPayload) {
    return authRequest<Record<string, never>>("password/forget_request", { body: payload })
}

export function confirmPasswordReset(payload: ConfirmResetPayload) {
    return authRequest<Record<string, never>>("password/confirm_reset", { body: payload })
}

export function resendPasswordResetCode(payload: ForgetPasswordPayload) {
    return authRequest<Record<string, never>>("password/resend_code", { body: payload })
}

/** Pulls a readable message out of a failed envelope, including field-level validation errors. */
export function getErrorMessage(envelope: ApiEnvelope<unknown>, fallback = "Something went wrong. Please try again."): string {
    if (envelope.message) return envelope.message
    if (Array.isArray(envelope.errors) && envelope.errors.length > 0) {
        return envelope.errors[0].message
    }
    if (envelope.errors && !Array.isArray(envelope.errors)) {
        const firstKey = Object.keys(envelope.errors)[0]
        const firstMsg = envelope.errors[firstKey]?.[0]
        if (firstMsg) return firstMsg
    }
    return fallback
}