import { z } from 'zod';

const email = z.string().trim().toLowerCase().email('Невалиден имейл');
const password = z.string().min(6, 'Паролата трябва да е поне 6 символа').max(128);
const name = z.string().trim().min(1, 'Полето е задължително').max(60);

export const registerSchema = z.object({
  email,
  password,
  firstName: name,
  lastName: name,
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Паролата е задължителна'),
});

export const forgotPasswordSchema = z.object({
  email,
});

export const resetPasswordSchema = z.object({
  password,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Текущата парола е задължителна'),
  newPassword: password,
});

export const updateProfileSchema = z.object({
  firstName: name.optional(),
  lastName: name.optional(),
  email: email.optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
});
