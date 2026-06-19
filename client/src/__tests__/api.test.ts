import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import api, { ApiError, setAccessToken } from '../api/axios';

// Помощник за сглобяване на fetch-подобен отговор
function res(opts: { ok: boolean; status: number; body?: unknown; text?: string; statusText?: string }) {
  const text = opts.text ?? (opts.body !== undefined ? JSON.stringify(opts.body) : '');
  return {
    ok: opts.ok,
    status: opts.status,
    statusText: opts.statusText ?? '',
    text: async () => text,
    json: async () => (opts.body !== undefined ? opts.body : JSON.parse(text || '{}')),
  };
}

describe('fetch wrapper (api)', () => {
  beforeEach(() => setAccessToken(null));
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('връща parsed JSON при успешна заявка', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(res({ ok: true, status: 200, body: { a: 1 } })));
    expect(await api.get<{ a: number }>('/x')).toEqual({ a: 1 });
  });

  it('хвърля ApiError със статус и съобщение от JSON тялото', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(res({ ok: false, status: 409, body: { message: 'Има конфликт' } })));
    let err: unknown;
    try { await api.get('/x'); } catch (e) { err = e; }
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(409);
    expect((err as ApiError).message).toBe('Има конфликт');
  });

  it('използва суровия текст като съобщение, ако тялото не е JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(res({ ok: false, status: 500, text: 'Internal Error' })));
    let err: unknown;
    try { await api.get('/x'); } catch (e) { err = e; }
    expect((err as ApiError).status).toBe(500);
    expect((err as ApiError).message).toBe('Internal Error');
  });

  it('връща undefined при 204 (празно тяло)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(res({ ok: true, status: 204, text: '' })));
    expect(await api.get('/x')).toBeUndefined();
  });

  it('при 401 опреснява токена и повтаря оригиналната заявка', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(res({ ok: false, status: 401, text: '' }))            // оригинална → 401
      .mockResolvedValueOnce(res({ ok: true, status: 200, body: { token: 'new' } })) // refresh
      .mockResolvedValueOnce(res({ ok: true, status: 200, body: { ok: true } }));    // повторение
    vi.stubGlobal('fetch', fetchMock);
    expect(await api.get<{ ok: boolean }>('/protected')).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('при неуспешен refresh пренасочва към /login и хвърля грешка', async () => {
    vi.stubGlobal('window', { location: { href: '' } });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(res({ ok: false, status: 401, text: '' }))   // оригинална → 401
      .mockResolvedValueOnce(res({ ok: false, status: 401, text: '' }));  // refresh се проваля
    vi.stubGlobal('fetch', fetchMock);
    await expect(api.get('/protected')).rejects.toThrow('Session expired');
    expect((globalThis as unknown as { window: { location: { href: string } } }).window.location.href).toBe('/login');
  });
});
