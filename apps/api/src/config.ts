export function getConfig() {
  return {
    port: Number(process.env.PORT ?? 3000),
    jwtSecret: process.env.JWT_SECRET ?? 'dev-only-super-secret-change-me-12345',
    jwtExpiresIn: '1h' as const
  };
}
