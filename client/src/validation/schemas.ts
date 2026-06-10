import { z } from 'zod';

// Споделени схеми за валидация на формите от страна на клиента.
// Изнесени тук, за да са преизползваеми и да могат да се тестват изолирано.

export const loginSchema = z.object({
  email: z.string().email('Невалиден email'),
  password: z.string().min(6, 'Минимум 6 символа'),
});
export type LoginForm = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z.string().min(2, 'Минимум 2 символа').max(50, 'Максимум 50 символа'),
    lastName: z.string().min(2, 'Минимум 2 символа').max(50, 'Максимум 50 символа'),
    email: z.string().email('Невалиден email'),
    password: z.string().min(6, 'Минимум 6 символа').max(100, 'Максимум 100 символа'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Паролите не съвпадат',
    path: ['confirmPassword'],
  });
export type RegisterForm = z.infer<typeof registerSchema>;

export const phoneRegex = /^[0-9+\s()-]{6,20}$/;

export const applySchema = z.object({
  name: z.string().trim().min(2, 'Минимум 2 символа').max(100, 'Максимум 100 символа'),
  city: z.string().trim().min(2, 'Въведете град'),
  region: z.string().trim().min(2, 'Въведете регион/област'),
  address: z.string().trim().min(3, 'Въведете адрес'),
  phone: z.string().trim().regex(phoneRegex, 'Невалиден телефонен номер'),
  email: z.string().trim().email('Невалиден email адрес'),
  description: z.string().trim().min(10, 'Минимум 10 символа').max(1000, 'Максимум 1000 символа'),
  open: z.string(),
  close: z.string(),
  message: z.string().max(500, 'Максимум 500 символа').optional(),
});
export type ApplyForm = z.infer<typeof applySchema>;

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Въведете име'),
  email: z.string().trim().email('Невалиден email адрес'),
  message: z.string().trim().min(10, 'Минимум 10 символа').max(2000, 'Максимум 2000 символа'),
});
export type ContactForm = z.infer<typeof contactSchema>;
