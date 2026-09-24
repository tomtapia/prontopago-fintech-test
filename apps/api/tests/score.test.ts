import { describe, it, expect, beforeEach } from 'vitest';
import { computeDeterministicScore } from '../src/domain/score.js';
import { getOrComputeScore, scoreCache, clearScoreCache } from '../src/infrastructure/scoreCache.js';

describe('score domain + cache', () => {
  beforeEach(() => clearScoreCache());

  it('is deterministic and in range 0-100', () => {
    const a = computeDeterministicScore('11111111-1');
    expect(a).toBe(computeDeterministicScore('11111111-1'));
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThanOrEqual(100);
  });
  it('varies across RUTs', () => {
    expect(computeDeterministicScore('11111111-1')).not.toBe(computeDeterministicScore('22222222-2'));
  });
  it('caches by normalized key without dots (incl K lowercase)', () => {
    const r1 = getOrComputeScore('11.111.111-1');
    expect(r1.cached).toBe(false);
    const r2 = getOrComputeScore('11111111-1');
    expect(r2.cached).toBe(true);
    expect(r2.score).toBe(r1.score);
    expect(scoreCache.has('11111111-1')).toBe(true);
    const k1 = getOrComputeScore('8.765.432-k');
    const k2 = getOrComputeScore('8765432-K');
    expect(k2.cached).toBe(true);
    expect(k2.score).toBe(k1.score);
  });
});
