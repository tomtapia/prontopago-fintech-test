import { describe, it, expect } from 'vitest';
import { normalizeRut, isValidRut } from './rut.js';

describe('rut client', () => {
  it('normalizes and validates incl K', () => {
    expect(normalizeRut('8.765.432-k')).toBe('8765432-K');
    expect(isValidRut('11.111.111-1')).toBe(true);
    expect(isValidRut('8.765.432-K')).toBe(true);
    expect(isValidRut('12.345.678-9')).toBe(false);
    expect(isValidRut('bad')).toBe(false);
  });
});
