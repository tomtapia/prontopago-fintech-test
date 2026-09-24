const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function parseError(res: Response): Promise<never> {
  let code: string | undefined;
  let message = `Request failed (${res.status})`;
  try {
    const data = (await res.json()) as { error?: { code?: string; message?: string } };
    if (data?.error?.message) message = data.error.message;
    code = data?.error?.code;
  } catch {
    /* keep default */
  }
  throw new ApiError(res.status, message, code);
}

export interface LoginResult {
  token: string;
  user: { id: string; role: 'admin' | 'user'; rut?: string };
}

export async function apiLogin(username: string, password: string): Promise<LoginResult> {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) await parseError(res);
  return (await res.json()) as LoginResult;
}

export interface ScoreResult {
  rut: string;
  score: number;
  fecha: string;
}

export async function apiScore(rut: string, token: string): Promise<ScoreResult> {
  const res = await fetch(`${API_URL}/score/${encodeURIComponent(rut)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) await parseError(res);
  return (await res.json()) as ScoreResult;
}

export function friendlyError(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.status === 401) return 'Sesión expirada o credenciales inválidas. Inicia sesión nuevamente.';
    if (e.status === 403) return 'No autorizado para consultar este RUT (solo tu propio RUT).';
    if (e.status === 400) return 'RUT inválido. Usa formato 12.345.678-5 o 8.765.432-K.';
    return e.message;
  }
  return 'Error inesperado. Intenta nuevamente.';
}
