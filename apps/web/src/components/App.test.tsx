import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '../auth-context.js';
import App from '../App.js';

describe('App', () => {
  it('renders login when logged out', () => {
    localStorage.clear();
    render(<AuthProvider><App /></AuthProvider>);
    expect(screen.getByText('Iniciar sesión')).toBeDefined();
  });
});
