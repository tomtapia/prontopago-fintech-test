import { useState } from 'react';
import { apiScore, friendlyError, type ScoreResult } from '../lib/api.js';
import { isValidRut } from '../lib/rut.js';
import { useAuth } from '../auth-context.js';
import { Button, Card, Input, Alert } from './ui.js';

export function ScoreInquiry() {
  const { token, user, logout } = useAuth();
  const [rut, setRut] = useState(user?.rut ?? '');
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const query = async () => {
    setError(null);
    setResult(null);
    if (!isValidRut(rut)) {
      setError('RUT inválido. Usa formato 12.345.678-5 o 8.765.432-K.');
      return;
    }
    if (!token) {
      setError('Sesión expirada o credenciales inválidas. Inicia sesión nuevamente.');
      return;
    }
    setLoading(true);
    try {
      setResult(await apiScore(rut, token));
    } catch (e: unknown) {
      const msg = friendlyError(e);
      setError(msg);
      if (e instanceof Error && 'status' in e && (e as { status: number }).status === 401) logout();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">Consulta de score</h1>
        <button className="text-xs underline" onClick={logout}>Cerrar sesión</button>
      </div>
      <p className="text-xs text-slate-500 mb-3">Rol: {user?.role}{user?.rut ? ` · RUT: ${user.rut}` : ''}</p>
      <div className="flex gap-2">
        <Input aria-label="RUT" placeholder="11.111.111-1" value={rut} onChange={(e) => setRut(e.target.value)} />
        <Button onClick={query} disabled={loading}>{loading ? '…' : 'Consultar'}</Button>
      </div>
      {error && <div className="mt-3"><Alert>{error}</Alert></div>}
      {result && (
        <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm">
          <p><strong>RUT:</strong> {result.rut}</p>
          <p><strong>Score:</strong> {result.score} / 100</p>
          <p><strong>Fecha:</strong> {result.fecha}</p>
        </div>
      )}
    </Card>
  );
}
