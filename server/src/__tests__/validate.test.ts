import { describe, it, expect, vi } from 'vitest';
import type { Request, Response } from 'express';
import { validateBody } from '../middleware/validate';
import { loginSchema } from '../validation/authSchemas';

function mockRes() {
  const res = {} as Response & { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> };
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('validateBody middleware', () => {
  it('извиква next() при валидни данни и подменя req.body с parsed данните', () => {
    const req = { body: { email: '  A@B.BG ', password: '123456' } } as Request;
    const res = mockRes();
    const next = vi.fn();

    validateBody(loginSchema)(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(req.body.email).toBe('a@b.bg'); // нормализиран
  });

  it('връща 400 със структуриран списък от грешки при невалидни данни', () => {
    const req = { body: { email: 'bad', password: '' } } as Request;
    const res = mockRes();
    const next = vi.fn();

    validateBody(loginSchema)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
    const payload = res.json.mock.calls[0][0];
    expect(payload.message).toBe('Validation failed');
    expect(Array.isArray(payload.errors)).toBe(true);
    expect(payload.errors.length).toBeGreaterThan(0);
    expect(payload.errors[0]).toHaveProperty('field');
    expect(payload.errors[0]).toHaveProperty('message');
  });
});
