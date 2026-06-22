import { z } from "zod";

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

export const ProfileSchema = z.object({
  first_name: z.string().min(1, "Ім'я обов'язкове").optional().nullable(),
  last_name: z.string().min(1, "Прізвище обов'язкове").optional().nullable(),
  phone: z.string().min(10, "Невірний формат телефону").optional().nullable(),
  solana_wallet: z.string().min(32, "Невірний формат Solana адреси").optional().nullable(),
});

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

export type ProfileData = z.infer<typeof ProfileSchema>;
export type ProfileUpdateData = z.infer<typeof ProfileUpdateSchema>;

// ── Settings: change password ───────────────────────────────────────────────
// All three fields are sent to the backend; the rules below mirror the
// server-side validation so the user gets immediate feedback.
export const ChangePasswordSchema = z
  .object({
    old_password: z.string().min(1, "Введіть поточний пароль"),
    new_password: z.string().min(6, "Мінімум 6 символів"),
    new_password_confirm: z.string().min(6, "Мінімум 6 символів"),
  })
  .refine((data) => data.new_password === data.new_password_confirm, {
    message: "Паролі не співпадають",
    path: ["new_password_confirm"],
  })
  .refine((data) => data.new_password !== data.old_password, {
    message: "Новий пароль має відрізнятися від поточного",
    path: ["new_password"],
  });

export type ChangePasswordData = z.infer<typeof ChangePasswordSchema>;
export type ChangePasswordPayload = ChangePasswordData;

// ── Forgot password: request a reset link ───────────────────────────────────
export const ForgotPasswordSchema = z.object({
  email: z.string().min(1, "Email обовʼязковий").email("Невірний формат email"),
});

export type ForgotPasswordData = z.infer<typeof ForgotPasswordSchema>;

// ── Forgot password: set a new password via the emailed link ────────────────
// Only `password` is validated by the backend (min length 6); `password_confirm`
// is a client-only check so the user can't typo their new password.
export const SetNewPasswordSchema = z
  .object({
    password: z.string().min(6, "Мінімум 6 символів"),
    password_confirm: z.string().min(6, "Мінімум 6 символів"),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Паролі не співпадають",
    path: ["password_confirm"],
  });

export type SetNewPasswordData = z.infer<typeof SetNewPasswordSchema>;

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
export const ChangeLoginSchema = z.object({
  email: z.string().min(1, "Email обовʼязковий").email("Невірний формат email"),
  password: z.string().min(1, "Введіть пароль для підтвердження"),
});

export type ChangeLoginData = z.infer<typeof ChangeLoginSchema>;

// ── Settings: delete account ────────────────────────────────────────────────
export const DeleteAccountSchema = z.object({
  password: z.string().min(1, "Введіть пароль для підтвердження"),
});

export type DeleteAccountData = z.infer<typeof DeleteAccountSchema>;