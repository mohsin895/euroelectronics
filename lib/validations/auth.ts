// lib/validations/auth.ts
import { z } from "zod"

// ─── Reusable field schemas ───────────────────────────────────────────────────

const phoneSchema = z
    .string()
    .min(1, "ফোন নম্বর দিন")
    .regex(/^(?:\+8801|01)[3-9]\d{8}$/, "সঠিক বাংলাদেশি ফোন নম্বর দিন (01XXXXXXXXX)")

const emailSchema = z
    .string()
    .email("সঠিক ইমেইল ঠিকানা দিন")

const emailOrPhoneSchema = z
    .string()
    .min(1, "ইমেইল অথবা ফোন নম্বর দিন")
    .refine(
        val =>
            /^[\w.+-]+@[\w-]+\.[a-z]{2,}$/i.test(val) ||
            /^(?:\+8801|01)[3-9]\d{8}$/.test(val),
        { message: "সঠিক ইমেইল অথবা ফোন নম্বর দিন" }
    )

const passwordSchema = z
    .string()
    .min(6,  "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে")
    .max(64, "পাসওয়ার্ড সর্বোচ্চ ৬৪ অক্ষরের হতে পারবে")

const nameSchema = (field: string) =>
    z
        .string()
        .min(1, `${field} দিন`)
        .max(50, `${field} সর্বোচ্চ ৫০ অক্ষরের হতে পারবে`)
        .regex(/^[a-zA-Z\u0980-\u09FF\s'.,-]+$/, `${field} সঠিক নয়`)

const otpSchema = z
    .string()
    .length(6, "OTP কোড ৬ সংখ্যার হতে হবে")
    .regex(/^\d{6}$/, "OTP শুধুমাত্র সংখ্যা হতে হবে")

const refCodeSchema = z
    .string()
    .max(20, "রেফারেল কোড সর্বোচ্চ ২০ অক্ষরের হতে পারবে")
    .regex(/^[a-zA-Z0-9_-]+$/, "রেফারেল কোড সঠিক নয়")
    .optional()
    .or(z.literal(""))

// ─── LoginPayload ─────────────────────────────────────────────────────────────
// { email_or_phone, password }

export const loginSchema = z.object({
    email_or_phone: emailOrPhoneSchema,
    password:       passwordSchema,
})

export type LoginFormValues = z.infer<typeof loginSchema>

// ─── SignupPayload ────────────────────────────────────────────────────────────
// { f_name, l_name?, phone, email?, password, password_confirmation, ref_code? }

export const signupSchema = z
    .object({
        f_name:                nameSchema("প্রথম নাম"),
        l_name:                nameSchema("শেষ নাম").optional().or(z.literal("")),
        phone:                 phoneSchema,
        email:                 emailSchema.optional().or(z.literal("")),
        password:              passwordSchema,
        password_confirmation: z.string().min(1, "পাসওয়ার্ড নিশ্চিত করুন"),
        ref_code:              refCodeSchema,
    })
    .refine(data => data.password === data.password_confirmation, {
        message: "পাসওয়ার্ড মিলছে না",
        path:    ["password_confirmation"],
    })

export type SignupFormValues = z.infer<typeof signupSchema>

// ─── CheckPhonePayload ────────────────────────────────────────────────────────
// { phone }

export const checkPhoneSchema = z.object({
    phone: phoneSchema,
})

export type CheckPhoneFormValues = z.infer<typeof checkPhoneSchema>

// ─── ConfirmCodePayload ───────────────────────────────────────────────────────
// { phone, otp }

export const confirmCodeSchema = z.object({
    phone: phoneSchema,
    otp:   otpSchema,
})

export type ConfirmCodeFormValues = z.infer<typeof confirmCodeSchema>

// ─── ForgetPasswordPayload ────────────────────────────────────────────────────
// { phone }

export const forgetPasswordSchema = z.object({
    phone: phoneSchema,
})

export type ForgetPasswordFormValues = z.infer<typeof forgetPasswordSchema>

// ─── ConfirmResetPayload ──────────────────────────────────────────────────────
// { phone, reset_token, password, password_confirmation }

export const confirmResetSchema = z
    .object({
        phone:                 phoneSchema,
        reset_token:           otpSchema,
        password:              passwordSchema,
        password_confirmation: z.string().min(1, "পাসওয়ার্ড নিশ্চিত করুন"),
    })
    .refine(data => data.password === data.password_confirmation, {
        message: "পাসওয়ার্ড মিলছে না",
        path:    ["password_confirmation"],
    })

export type ConfirmResetFormValues = z.infer<typeof confirmResetSchema>

// ─── Generic runtime validator ────────────────────────────────────────────────

export type ValidationResult<T> =
    | { success: true;  data: T;    errors: null }
    | { success: false; data: null; errors: Partial<Record<string, string>> }

export function validate<T>(
    schema: z.ZodSchema<T>,
    input: unknown
): ValidationResult<T> {
    const result = schema.safeParse(input)
    if (result.success) return { success: true, data: result.data, errors: null }

    const errors: Partial<Record<string, string>> = {}
    for (const issue of result.error.issues) {
        const key = issue.path.join(".")
        if (!errors[key]) errors[key] = issue.message
    }
    return { success: false, data: null, errors }
}