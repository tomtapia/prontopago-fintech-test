import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../auth-context.js';
import { ScoreInquiry } from './ScoreInquiry.js';

describe('ScoreInquiry errors', () => {
  it('shows RUT inválido on bad input without calling API', async () => {
    localStorage.setItem('pp_token', 't');
    localStorage.setItem('pp_user', JSON.stringify({ id: 'u', role: 'user', rut: '11.111.111-1' }));
    render(<AuthProvider><ScoreInquiry /></AuthProvider>);
    await userEvent.clear(screen.getByLabelText('RUT'));
    await userEvent.type(screen.getByLabelText('RUT'), 'bad');
    await userEvent.click(screen.getByRole('button', { name: 'Consultar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('RUT inválido');
    localStorage.clear();
    vi.unstubAllGlobals();
  });
});
