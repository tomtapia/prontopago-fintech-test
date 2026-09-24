import type { ReactNode } from 'react';
import { useAuth } from '../auth-context.js';
import { LoginForm } from './LoginForm.js';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  if (!token) return <LoginForm />;
  return <>{children}</>;
}
