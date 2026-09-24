# Financial Risk Inquiry — Design

## Architecture

pnpm monorepo: `apps/api` (Express, layered DDD) + `apps/web` (Vite React).
`domain/` has no I/O. `application/` orchestrates. `infrastructure/` holds
mocks + Map cache. `presentation/` holds routes/middlewares/schemas.

## API contracts

### POST /login

Request: `{ "username": string, "password": string }` (Zod).
Success 200: `{ "token": "<jwt>", "user": { "id": string, "role": "admin"|"user", "rut"?: string } }`.
Errors: 400 `INVALID_BODY`, 401 `INVALID_CREDENTIALS`, 429 rate-limited.

JWT payload: `{ sub: userId, role, rut?: normalizedRut, iat, exp }`.
`rut` present only when `role=user`.

### GET /score/:rut

Auth: `Authorization: Bearer <jwt>`.
Success 200: `{ "rut": "<normalized>", "score": 0-100, "fecha": "ISO8601" }`.
Errors: 400 `INVALID_RUT`, 401 `UNAUTHORIZED|TOKEN_EXPIRED|INVALID_TOKEN`,
403 `OWN_RUT_ONLY` (user querying foreign RUT).

Generic error shape: `{ "error": { "code": string, "message": string } }`.

## Domain details

- `normalizeRut`: trim → remove `.` → uppercase.
- `isValidRut`: `/^(\d{1,8})-([\dK])$/` on normalized + mod-11 (factors 2..7).
- `computeDeterministicScore`: `sha256(normalized).hex[0:8] % 101`.
- `scoreCache: Map<string,number>` keyed by normalized RUT.

## Security

helmet, CORS allowlist `http://localhost:5173`, JSON limit, login rate-limit
(60 req / 5 min per IP for MVP-demo), JWT secret from env, no password logging.

## Frontend

Vite + React + TS + Tailwind + shadcn-style UI primitives (local, no heavy dep
for MVP), `react-hook-form` + Zod login form, `AuthContext` with
`localStorage pp_token`, `ProtectedRoute`, `ScoreInquiry` view. Error mapping:
401 → "Sesión expirada…", 403 → "No autorizado para consultar este RUT",
400 → "RUT inválido".

## Testing

Backend: Vitest + Supertest, v8 coverage thresholds 80. Frontend: Vitest +
Testing Library. TDD per feature.
