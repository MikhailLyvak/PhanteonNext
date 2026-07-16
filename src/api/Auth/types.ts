import { z } from "zod";
import type { MessageShapes } from '@/i18n/t-keys'

type ValidationT = MessageShapes['validation']

export interface LoginResponse {
  token: string;
}

export interface UserLoginData {
  email: string;
  password: string;
  referalId?: string;
}

interface UserEmail {
  email: string;
}

export interface RegisterResponse {
  user: UserEmail;
  token: string;
}

export interface User {
  id: number;
  email: string;
  avatar: string;
  slug: string;
}

export interface MyContactData {
  "email": "string",
  "first_name": "string",
  "last_name": "string",
  "phone": "string",
  "solana_wallet": "string",
}

// ProfileSchema → factory
export const createProfileSchema = (t: ValidationT) => z.object({
  first_name: z.string().min(1, t.firstNameRequired).optional().nullable(),
  last_name: z.string().min(1, t.lastNameRequired).optional().nullable(),
  phone: z.string().min(10, t.phoneInvalid).optional().nullable(),
  solana_wallet: z.string().min(32, t.solanaInvalid).optional().nullable(),
})

const OptionalString = z
  .string()
  .transform((val) => (val.trim() === "" ? undefined : val))
  .optional();

export const ProfileUpdateSchema = z.object({
  first_name: OptionalString,
  last_name: OptionalString,
  phone: OptionalString,
  solana_wallet: OptionalString,
});

export type ProfileData = z.infer<ReturnType<typeof createProfileSchema>>;
export type ProfileUpdateData = z.infer<typeof ProfileUpdateSchema>;

// ── Settings: change password ───────────────────────────────────────────────
export const createChangePasswordSchema = (t: ValidationT) =>
  z.object({
    old_password: z.string().min(1, t.currentPasswordRequired),
    new_password: z.string().min(6, t.minChars({ count: 6 })),
    new_password_confirm: z.string().min(6, t.minChars({ count: 6 })),
  })
  .refine((data) => data.new_password === data.new_password_confirm, {
    message: t.passwordsMismatch,
    path: ['new_password_confirm'],
  })
  .refine((data) => data.new_password !== data.old_password, {
    message: t.newPasswordMustDiffer,
    path: ['new_password'],
  })

export type ChangePasswordData = z.infer<ReturnType<typeof createChangePasswordSchema>>
export type ChangePasswordPayload = ChangePasswordData

// ── Forgot password: request a reset link ───────────────────────────────────
export const createForgotPasswordSchema = (t: ValidationT) => z.object({
  email: z.string().min(1, t.emailRequired).email(t.emailInvalid),
})
export type ForgotPasswordData = z.infer<ReturnType<typeof createForgotPasswordSchema>>

// ── Forgot password: set a new password via the emailed link ────────────────
export const createSetNewPasswordSchema = (t: ValidationT) =>
  z.object({
    password: z.string().min(6, t.minChars({ count: 6 })),
    password_confirm: z.string().min(6, t.minChars({ count: 6 })),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: t.passwordsMismatch,
    path: ['password_confirm'],
  })
export type SetNewPasswordData = z.infer<ReturnType<typeof createSetNewPasswordSchema>>

// Sent to PATCH /auth/api/set-new-password/. uidb64/token are forwarded
// verbatim from the reset link URL.
export interface SetNewPasswordPayload {
  password: string;
  uidb64: string;
  token: string;
}

// 200 response of GET /auth/api/password-reset-confirm/{uidb64}/{token}/
export interface PasswordResetConfirmResponse {
  success: boolean;
  uidb64: string;
  token: string;
}

// ── Settings: change login (email) ──────────────────────────────────────────
export const createChangeLoginSchema = (t: ValidationT) => z.object({
  email: z.string().min(1, t.emailRequired).email(t.emailInvalid),
  password: z.string().min(1, t.passwordConfirmationRequired),
})
export type ChangeLoginData = z.infer<ReturnType<typeof createChangeLoginSchema>>

// ── Settings: delete account ────────────────────────────────────────────────
export const createDeleteAccountSchema = (t: ValidationT) => z.object({
  password: z.string().min(1, t.passwordConfirmationRequired),
})
export type DeleteAccountData = z.infer<ReturnType<typeof createDeleteAccountSchema>>
