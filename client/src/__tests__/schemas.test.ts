import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema, applySchema, contactSchema } from '../validation/schemas';

describe('loginSchema', () => {
  it('приема валидни данни', () => {
    expect(loginSchema.safeParse({ email: 'a@b.bg', password: '123456' }).success).toBe(true);
  });
  it('отхвърля невалиден имейл и къса парола', () => {
    expect(loginSchema.safeParse({ email: 'bad', password: '123' }).success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('приема валидни данни със съвпадащи пароли', () => {
    const r = registerSchema.safeParse({
      firstName: 'Иван', lastName: 'Иванов', email: 'a@b.bg',
      password: '123456', confirmPassword: '123456',
    });
    expect(r.success).toBe(true);
  });
  it('отхвърля при несъвпадащи пароли', () => {
    const r = registerSchema.safeParse({
      firstName: 'Иван', lastName: 'Иванов', email: 'a@b.bg',
      password: '123456', confirmPassword: 'razlichna',
    });
    expect(r.success).toBe(false);
  });
});

describe('applySchema (заявка за сервиз)', () => {
  const valid = {
    name: 'Авто Сервиз', city: 'Варна', region: 'Варна', address: 'ул. Тест 1',
    phone: '+359 888 123 456', email: 'shop@b.bg',
    description: 'Описание с поне десет символа', open: '09:00', close: '18:00',
  };

  it('приема валидна заявка (без съобщение)', () => {
    expect(applySchema.safeParse(valid).success).toBe(true);
  });
  it('отхвърля невалиден телефонен номер', () => {
    expect(applySchema.safeParse({ ...valid, phone: 'телефон' }).success).toBe(false);
  });
  it('отхвърля невалиден имейл', () => {
    expect(applySchema.safeParse({ ...valid, email: 'notmail' }).success).toBe(false);
  });
  it('отхвърля твърде късо описание', () => {
    expect(applySchema.safeParse({ ...valid, description: 'кратко' }).success).toBe(false);
  });
});

describe('contactSchema', () => {
  it('приема валидно съобщение', () => {
    expect(contactSchema.safeParse({ name: 'Иван', email: 'a@b.bg', message: 'Здравейте, имам въпрос.' }).success).toBe(true);
  });
  it('отхвърля твърде късо съобщение', () => {
    expect(contactSchema.safeParse({ name: 'Иван', email: 'a@b.bg', message: 'кратко' }).success).toBe(false);
  });
});
