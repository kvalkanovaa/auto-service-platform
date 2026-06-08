import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema,
} from '../validation/authSchemas';

describe('registerSchema', () => {
  it('приема валидни данни', () => {
    const r = registerSchema.safeParse({
      email: 'ivan@example.bg', password: '123456', firstName: 'Иван', lastName: 'Иванов',
    });
    expect(r.success).toBe(true);
  });

  it('отхвърля невалиден имейл', () => {
    const r = registerSchema.safeParse({
      email: 'notanemail', password: '123456', firstName: 'Иван', lastName: 'Иванов',
    });
    expect(r.success).toBe(false);
  });

  it('отхвърля парола под 6 символа', () => {
    const r = registerSchema.safeParse({
      email: 'ivan@example.bg', password: '123', firstName: 'Иван', lastName: 'Иванов',
    });
    expect(r.success).toBe(false);
  });

  it('нормализира имейла (trim + lowercase)', () => {
    const r = registerSchema.safeParse({
      email: '  IVAN@Example.BG  ', password: '123456', firstName: 'Иван', lastName: 'Иванов',
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe('ivan@example.bg');
  });
});

describe('loginSchema', () => {
  it('изисква непразна парола', () => {
    expect(loginSchema.safeParse({ email: 'ivan@example.bg', password: '' }).success).toBe(false);
  });
});

describe('changePasswordSchema', () => {
  it('новата парола трябва да е поне 6 символа', () => {
    expect(changePasswordSchema.safeParse({ currentPassword: 'old', newPassword: '123' }).success).toBe(false);
    expect(changePasswordSchema.safeParse({ currentPassword: 'old', newPassword: '123456' }).success).toBe(true);
  });
});

describe('updateProfileSchema', () => {
  it('приема празен низ за avatarUrl', () => {
    expect(updateProfileSchema.safeParse({ avatarUrl: '' }).success).toBe(true);
  });

  it('отхвърля невалиден URL за avatarUrl', () => {
    expect(updateProfileSchema.safeParse({ avatarUrl: 'невалиден url' }).success).toBe(false);
  });
});
