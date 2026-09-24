/** Chilean RUT helpers. Normalized form: no dots, uppercase, hyphen kept. */

export function normalizeRut(input: string): string {
  return input.trim().replace(/\./g, '').toUpperCase();
}

export function isValidRut(input: string): boolean {
  const n = normalizeRut(input);
  const m = /^(\d{1,8})-([\dK])$/.exec(n);
  if (!m) return false;
  const body = m[1];
  const dv = m[2];
  let sum = 0;
  let mult = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * mult;
    mult = mult === 7 ? 2 : mult + 1;
  }
  const r = 11 - (sum % 11);
  const expected = r === 11 ? '0' : r === 10 ? 'K' : String(r);
  return expected === dv;
}

export function assertValidRut(input: string): string {
  const n = normalizeRut(input);
  if (!isValidRut(n)) {
    throw Object.assign(new Error(`Invalid RUT: ${input}`), {
      status: 400,
      code: 'INVALID_RUT'
    });
  }
  return n;
}
