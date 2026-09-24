import { assertValidRut } from '../domain/rut.js';
import { getOrComputeScore } from '../infrastructure/scoreCache.js';

export function queryScore(rutParam: string): { rut: string; score: number; fecha: string } {
  const rut = assertValidRut(rutParam);
  const { score } = getOrComputeScore(rut);
  return { rut, score, fecha: new Date().toISOString() };
}
