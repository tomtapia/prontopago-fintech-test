# @prontopago/api

Express + TypeScript REST API (DDD layers).

```bash
pnpm install
cp .env.example .env   # set JWT_SECRET
pnpm dev               # tsx watch src/server.ts :3000
pnpm test              # vitest run --coverage (thresholds 80)
pnpm build && pnpm start
```

Endpoints: `POST /login`, `GET /score/:rut`. See root README + `docs/specs`.
