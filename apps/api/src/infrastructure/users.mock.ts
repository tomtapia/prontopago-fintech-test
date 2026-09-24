export type Role = 'admin' | 'user';

export interface MockUser {
  id: string;
  username: string;
  password: string;
  role: Role;
  rut?: string;
}

/** Mock credentials — no DB. All RUTs pass mod-11. */
export const mockUsers: MockUser[] = [
  { id: 'admin-1', username: 'admin@prontopago.cl', password: 'admin123', role: 'admin' },
  { id: 'user-1', username: 'user1@prontopago.cl', password: 'user123', role: 'user', rut: '11.111.111-1' },
  { id: 'user-2', username: 'userk@prontopago.cl', password: 'userk123', role: 'user', rut: '8.765.432-K' }
];
