# ProntoPago — Financial Risk Inquiry MVP

Secure MVP: JWT auth + RBAC (`admin`/`user`) + deterministic financial score by Chilean RUT.

## Run locally

```bash
pnpm install
pnpm dev        # api :3000 + web :5173 (parallel)
```

Separate:

```bash
pnpm --filter @prontopago/api dev    # http://localhost:3000
pnpm --filter @prontopago/web dev    # http://localhost:5173
```

Env (backend): copy `apps/api/.env.example` to `apps/api/.env` and set
`JWT_SECRET` (min 32 chars in prod). Frontend: `VITE_API_URL` (default
`http://localhost:3000`).

## Tests

```bash
pnpm test                                  # all workspaces
pnpm --filter @prontopago/api test         # Vitest + Supertest + v8 coverage
pnpm --filter @prontopago/web test         # Vitest + Testing Library
```

Coverage (verified): API ~96% stmts / ~85% branches (17 tests),
Web ~97% stmts / ~89% branches (13 tests). Threshold enforced at 80%.

## API

- `POST /login` `{username,password}` → `{token,user}`. JWT HS256 1h,
  payload `{sub, role, rut?}` (`rut` only for `user`, normalized no-dots).
- `GET /score/:rut` `Authorization: Bearer` → `{rut, score 0-100, fecha ISO}`.
- Errors `{error:{code,message}}`: 400 `INVALID_RUT`, 401
  `UNAUTHORIZED|INVALID_TOKEN|TOKEN_EXPIRED|INVALID_CREDENTIALS`,
  403 `OWN_RUT_ONLY`, 404 `NOT_FOUND`.

Mock users (see `docs/specs/financial-risk-inquiry/requirements.md`):

| user                 | pass     | role  | rut          |
| -------------------- | -------- | ----- | ------------ |
| admin@prontopago.cl  | admin123 | admin | —            |
| user1@prontopago.cl  | user123  | user  | 11.111.111-1 |
| userk@prontopago.cl  | userk123 | user  | 8.765.432-K  |

Score: `normalizeRut` (trim, strip dots, uppercase `K`) → `Map<string,number>`
cache keyed without dots → miss computes `sha256(key)[0:8] % 101`.
Same RUT (any format/case) always returns the same score (Req-7).

## Structure

```
apps/api  Express + TS (DDD: domain/application/infrastructure/presentation)
apps/web  Vite + React 18 + TS + Tailwind + shadcn-style primitives + RHF + Zod
docs/specs  SDD requirements/design/tasks (read before coding)
```

## Tools

Node 20+, pnpm 9, TypeScript 5 strict, Express, jsonwebtoken, Zod, helmet,
cors, express-rate-limit, Vitest, Supertest, Vite, React, Tailwind,
react-hook-form, Testing Library.

## AI-assisted parts

- Scaffold of monorepo, DDD file layout and Tailwind config.
- Drafts of RUT mod-11 validator, `scoreCache` Map, JWT middlewares and
  Zod schemas; all reviewed and verified with tests + live curl E2E.
- Frontend `api.ts`/`rut.ts` mirrors, `LoginForm`/`ScoreInquiry` drafts and
  RTL tests. The `forwardRef` fix on `Input` and `globals:true` test-env fix
  were diagnosed from failing tests.
- This README and `docs/specs/*` wording.
