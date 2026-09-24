import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../auth-context.js';
import { LoginForm } from './LoginForm.js';
import { ApiError } from '../lib/api.js';

const loginMock = vi.fn();

vi.mock('../lib/api.js', async (orig) => {
  const actual = (await orig()) as Record<string, unknown>;
  return { ...actual, apiLogin: (...a: unknown[]) => loginMock(...a) };
});

beforeEach(() => {
  localStorage.clear();
  loginMock.mockReset();
});

describe('LoginForm', () => {
  it('shows friendly error on 401', async () => {
    loginMock.mockRejectedValue(new ApiError(401, 'bad'));
    render(<AuthProvider><LoginForm /></AuthProvider>);
    await userEvent.type(screen.getByLabelText('Usuario'), 'u');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'p');
    await userEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Sesión expirada');
  });
  it('logs in and switches to score view via App shell state', async () => {
    loginMock.mockResolvedValue({ token: 't', user: { id: '1', role: 'user', rut: '11111111-1' } });
    render(<AuthProvider><LoginForm /></AuthProvider>);
    await userEvent.type(screen.getByLabelText('Usuario'), 'user1@prontopago.cl');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'user123');
    await userEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(loginMock).toHaveBeenCalled();
    expect(localStorage.getItem('pp_token')).toBe('t');
  });
});
