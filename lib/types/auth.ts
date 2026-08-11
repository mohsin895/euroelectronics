// ─── Shared API envelope ────────────────────────────────────────────────────
// Matches the Laravel API's standard response shape:
// { success: boolean, message?: string, errors?: [{code, message}], ...data }
export interface ApiError {
    code: string
    message: string
}

export interface ApiEnvelope<T = Record<string, unknown>> {
    success: boolean
    message?: string
    errors?: ApiError[] | Record<string, string[]>
    data?: T
}

// ─── User ────────────────────────────────────────────────────────────────────
export interface AuthUser {
    id: number
    f_name: string
    l_name: string | null
    phone: string
    email: string | null
    image: string | null
    is_phone_verified?: 0 | 1 | boolean
}

// ─── Payloads ────────────────────────────────────────────────────────────────
export interface LoginPayload {
    email_or_phone: string
    password: string
}

export interface SignupPayload {
    f_name: string
    l_name?: string
    phone: string
    email?: string
    password: string
    password_confirmation: string
    ref_code?: string
}

export interface CheckPhonePayload {
    phone: string
}

export interface ConfirmCodePayload {
    phone: string
    otp: string
}

export interface ForgetPasswordPayload {
    phone: string
}

export interface ConfirmResetPayload {
    phone: string
    reset_token: string
    password: string
    password_confirmation: string
}

// ─── Responses ───────────────────────────────────────────────────────────────
export interface LoginResponseData {
    token: string
    is_phone_verified?: 0 | 1 | boolean
    is_personal_info_added?: 0 | 1 | boolean
}

export type SignupResponseData = LoginResponseData

export interface UserResponseData {
    user?: AuthUser   // keep for safety
    // top-level fields (what the API actually returns)
    id?: number
    name?: string
    phone?: string
    email?: string
    avatar?: string | null
    avatar_original?: string | null
}