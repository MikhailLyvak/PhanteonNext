import { z } from "zod";

export interface LoginResponse {
  token: string;
}

export interface UserLoginData {
  email: string;
  password: string;
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
}

export const ProfileSchema = z.object({
  first_name: z.string().min(1, "Ім'я обов'язкове").optional().nullable(),
  last_name: z.string().min(1, "Прізвище обов'язкове").optional().nullable(),
  phone: z.string().min(10, "Невірний формат телефону").optional().nullable(),
});

const OptionalString = z
  .string()
  .transform((val) => (val.trim() === "" ? undefined : val))
  .optional();

export const ProfileUpdateSchema = z.object({
  first_name: OptionalString,
  last_name: OptionalString,
  phone: OptionalString,
});

export type ProfileData = z.infer<typeof ProfileSchema>;
export type ProfileUpdateData = z.infer<typeof ProfileUpdateSchema>;