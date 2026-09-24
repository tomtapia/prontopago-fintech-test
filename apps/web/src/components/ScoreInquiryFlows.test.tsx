import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../auth-context.js';
import { ScoreInquiry } from './ScoreInquiry.js';
import { ApiError } from '../lib/api.js';

const scoreMock = vi.fn();

vi.mock('../lib/api.js', async (orig) => {
  const actual = (await orig()) as Record<string, unknown>;
  return { ...actual, apiScore: (...a: unknown[]) => scoreMock(...a) };
});

function loggedAs(user: unknown) {
  localStorage.setItem('pp_token', 't');
  localStorage.setItem('pp_user', JSON.stringify(user));
}

beforeEach(() => {
  localStorage.clear();
  scoreMock.mockReset();
});

describe('ScoreInquiry flows', () => {
  it('shows result on success', async () => {
    loggedAs({ id: '1', role: 'user', rut: '11.111.111-1' });
    scoreMock.mockResolvedValue({ rut: '11111111-1', score: 73, fecha: '2025-06-27T14:35:00.000Z' });
    render(<AuthProvider><ScoreInquiry /></AuthProvider>);
    await userEvent.click(screen.getByRole('button', { name: 'Consultar' }));
    expect(await screen.findByText(/73 \/ 100/)).toBeDefined();
  });
  it('shows unauthorized message on 403', async () => {
    loggedAs({ id: '1', role: 'user', rut: '11.111.111-1' });
    scoreMock.mockRejectedValue(new ApiError(403, 'forbidden', 'OWN_RUT_ONLY'));
    render(<AuthProvider><ScoreInquiry /></AuthProvider>);
    await userEvent.clear(screen.getByLabelText('RUT'));
    await userEvent.type(screen.getByLabelText('RUT'), '12.345.678-5');
    await userEvent.click(screen.getByRole('button', { name: 'Consultar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('No autorizado');
  });
  it('logs out on 401', async () => {
    loggedAs({ id: '1', role: 'user', rut: '11.111.111-1' });
    scoreMock.mockRejectedValue(new ApiError(401, 'expired', 'TOKEN_EXPIRED'));
    render(<AuthProvider><ScoreInquiry /></AuthProvider>);
    await userEvent.click(screen.getByRole('button', { name: 'Consultar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Sesión expirada');
    expect(localStorage.getItem('pp_token')).toBeNull();
  });
});
