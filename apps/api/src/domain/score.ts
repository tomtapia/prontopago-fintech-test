import { createHash } from 'node:crypto';

/** Deterministic 0-100 score from a *normalized* RUT. */
export function computeDeterministicScore(normalizedRut: string): number {
  const hex = createHash('sha256').update(normalizedRut).digest('hex').slice(0, 8);
  return parseInt(hex, 16) % 101;
}
