import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiLogin, friendlyError } from '../lib/api.js';
import { useAuth } from '../auth-context.js';
import { Button, Card, Input, Alert } from './ui.js';

const schema = z.object({ username: z.string().min(1, 'Requerido'), password: z.string().min(1, 'Requerido') });
type Form = z.infer<typeof schema>;

export function LoginForm() {
  const { loginSuccess } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (v: Form) => {
    setError(null);
    try {
      loginSuccess(await apiLogin(v.username, v.password));
    } catch (e) {
      setError(friendlyError(e));
    }
  };

  return (
    <Card>
      <h1 className="text-lg font-semibold mb-4">Iniciar sesión</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="text-sm" htmlFor="username">Usuario</label>
          <Input id="username" placeholder="user1@prontopago.cl" {...register('username')} />
        </div>
        <div>
          <label className="text-sm" htmlFor="password">Contraseña</label>
          <Input id="password" type="password" {...register('password')} />
        </div>
        {error && <Alert>{error}</Alert>}
        <Button type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? 'Ingresando…' : 'Ingresar'}
        </Button>
      </form>
      <p className="mt-3 text-xs text-slate-500">Demo: admin/admin123 · user1/user123 · userk/userk123</p>
    </Card>
  );
}
