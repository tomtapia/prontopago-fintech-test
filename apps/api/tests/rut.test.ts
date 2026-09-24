import { describe, it, expect } from 'vitest';
import { normalizeRut, isValidRut, assertValidRut } from '../src/domain/rut.js';

describe('rut', () => {
  it('normalizes without dots, uppercases K, trims', () => {
    expect(normalizeRut('12.345.678-k')).toBe('12345678-K');
    expect(normalizeRut(' 11.111.111-1 ')).toBe('11111111-1');
    expect(normalizeRut('8.765.432-k')).toBe('8765432-K');
  });
  it('validates known RUTs incl K', () => {
    expect(isValidRut('11.111.111-1')).toBe(true);
    expect(isValidRut('12.345.678-5')).toBe(true);
    expect(isValidRut('8.765.432-K')).toBe(true);
    expect(isValidRut('6.000.000-K')).toBe(true);
  });
  it('rejects bad digit and bad format', () => {
    expect(isValidRut('12.345.678-9')).toBe(false);
    expect(isValidRut('not-a-rut')).toBe(false);
    expect(isValidRut('12345678')).toBe(false);
    expect(isValidRut('')).toBe(false);
    expect(isValidRut('11.111.111-2')).toBe(false);
  });
  it('assertValidRut returns normalized or throws 400', () => {
    expect(assertValidRut('11.111.111-1')).toBe('11111111-1');
    try {
      assertValidRut('bad');
      expect.unreachable();
    } catch (e: unknown) {
      const err = e as { status: number; code: string };
      expect(err.status).toBe(400);
      expect(err.code).toBe('INVALID_RUT');
    }
  });
});
