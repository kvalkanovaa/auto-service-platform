import { describe, it, expect } from 'vitest';
import bcrypt from 'bcryptjs';

// Същият механизъм за хеширане, който се прилага в pre-save hook на модела User
describe('хеширане на пароли (bcrypt, 12 rounds)', () => {
  it('хешът се различава от оригиналната парола', async () => {
    const hash = await bcrypt.hash('tajnaParola123', 12);
    expect(hash).not.toBe('tajnaParola123');
    expect(hash.length).toBeGreaterThan(50);
  });

  it('вярната парола съвпада с хеша', async () => {
    const hash = await bcrypt.hash('tajnaParola123', 12);
    expect(await bcrypt.compare('tajnaParola123', hash)).toBe(true);
  });

  it('грешната парола не съвпада с хеша', async () => {
    const hash = await bcrypt.hash('tajnaParola123', 12);
    expect(await bcrypt.compare('drugaParola', hash)).toBe(false);
  });

  it('две хеширания на една и съща парола дават различни хешове (различна сол)', async () => {
    const a = await bcrypt.hash('eднаквА', 12);
    const b = await bcrypt.hash('eднаквА', 12);
    expect(a).not.toBe(b);
  });
});
