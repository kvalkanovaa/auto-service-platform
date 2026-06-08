import { describe, it, expect } from 'vitest';
import { buildSlots } from '../controllers/serviceCenterController';

describe('buildSlots — генериране на свободни часове', () => {
  it('генерира по 7 часа за всеки работен ден', () => {
    const slots = buildSlots('000000000000000000000000', 6);
    const byDate = new Map<string, number>();
    for (const s of slots) byDate.set(s.date, (byDate.get(s.date) ?? 0) + 1);
    for (const [, count] of byDate) expect(count).toBe(7);
  });

  it('за 14 дни напред дава точно 12 дни (прескача 2-те недели)', () => {
    const slots = buildSlots('000000000000000000000000', 14);
    const dates = new Set(slots.map((s) => s.date));
    expect(dates.size).toBe(12);
    expect(slots.length).toBe(12 * 7);
  });

  it('всички генерирани часове са свободни и сочат правилния сервиз', () => {
    const slots = buildSlots('center-123', 4);
    for (const s of slots) {
      expect(s.isBooked).toBe(false);
      expect(s.serviceCenterId).toBe('center-123');
    }
  });

  it('всички дати са в бъдещето', () => {
    const today = new Date().toISOString().split('T')[0];
    const slots = buildSlots('x', 10);
    for (const s of slots) expect(s.date >= today).toBe(true);
  });

  it('по-голям период дава повече часове', () => {
    expect(buildSlots('x', 10).length).toBeGreaterThan(buildSlots('x', 3).length);
  });
});
