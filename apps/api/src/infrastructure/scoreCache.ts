import { computeDeterministicScore } from '../domain/score.js';
import { normalizeRut } from '../domain/rut.js';

/**
 * In-memory cache: key = normalized RUT without dots (e.g. 12345678-K),
 * value = score. Guarantees Req-7 (same RUT -> same score).
 */
export const scoreCache = new Map<string, number>();

export function getOrComputeScore(input: string): { score: number; cached: boolean } {
  const key = normalizeRut(input);
  const hit = scoreCache.get(key);
  if (hit !== undefined) return { score: hit, cached: true };
  const score = computeDeterministicScore(key);
  scoreCache.set(key, score);
  return { score, cached: false };
}

export function clearScoreCache(): void {
  scoreCache.clear();
}
