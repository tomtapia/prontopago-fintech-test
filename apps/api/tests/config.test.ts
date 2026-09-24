import { describe, it, expect } from 'vitest';
import { getConfig } from '../src/config.js';

describe('config', () => {
  it('exposes jwtSecret and 1h expiry', () => {
    const c = getConfig();
    expect(c.jwtSecret.length).toBeGreaterThan(8);
    expect(c.jwtExpiresIn).toBe('1h');
    expect(c.port).toBeGreaterThan(0);
  });
});
