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
// confirm_new_password is validated on the client only; the backend receives
// just { old_password, new_password }.
export const ChangePasswordSchema = z
  .object({
    old_password: z.string().min(1, "Введіть поточний пароль"),
    new_password: z.string().min(6, "Мінімум 6 символів"),
    confirm_new_password: z.string().min(6, "Мінімум 6 символів"),
  })
  .refine((data) => data.new_password === data.confirm_new_password, {
    message: "Паролі не співпадають",
    path: ["confirm_new_password"],
  });

export type ChangePasswordData = z.infer<typeof ChangePasswordSchema>;
export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
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