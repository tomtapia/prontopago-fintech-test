import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '../auth-context.js';
import { ProtectedRoute } from './ProtectedRoute.js';

beforeEach(() => localStorage.clear());

describe('ProtectedRoute', () => {
  it('renders login when logged out', () => {
    render(<AuthProvider><ProtectedRoute><p>secret</p></ProtectedRoute></AuthProvider>);
    expect(screen.getByText('Iniciar sesión')).toBeDefined();
  });
  it('renders children when token present', () => {
    localStorage.setItem('pp_token', 't');
    localStorage.setItem('pp_user', JSON.stringify({ id: '1', role: 'admin' }));
    render(<AuthProvider><ProtectedRoute><p>secret</p></ProtectedRoute></AuthProvider>);
    expect(screen.getByText('secret')).toBeDefined();
  });
});
