# Financial Risk Inquiry — Requirements

## Problem & scope

Secure MVP to evaluate a financial score (0–100) by Chilean RUT, with JWT auth
and RBAC (`admin` / `user`). Mock auth, no DB. In-memory score cache.

Out of scope: real credit bureau, persistence, refresh tokens, signup.

## User stories

- As `user` I log in and query only my own score.
- As `admin` I log in and query any valid RUT score.
- As a user I see clear errors on 401 / 403 / 400.

## Acceptance criteria (EARS)

- Req-1: When `POST /login` receives valid mock credentials, the system shall
  return a signed JWT (`sub`, `role`, `rut` only if `user`) plus user info.
- Req-2: When `GET /score/:rut` receives a valid Bearer token and a valid RUT,
  the system shall return `{ rut, score 0-100, fecha ISO8601 }`.
- Req-3: While `role=user`, when `:rut` normalized differs from token `rut`
  normalized, the system shall reject with 403 `OWN_RUT_ONLY`.
- Req-4: While `role=admin`, when any valid RUT is queried, the system shall
  return 200.
- Req-5: When token is missing/invalid/expired, the system shall return 401.
- Req-6: When RUT format or check-digit (mod-11, supports `K`) is invalid,
  the system shall return 400 `INVALID_RUT`.
- Req-7: When the same RUT is queried twice (any format variant), the system
  shall return the same score (Map cache hit on normalized key without dots).

## Business rules

- RUT normalization: trim, remove dots, uppercase → `12345678-K`.
- Cache key: normalized RUT without dots (hyphen kept).
- Deterministic fallback: `parseInt(sha256(key)[0:8],16) % 101`.
- JWT: HS256, `JWT_SECRET` env, expiry `1h`.
- Mock users (all pass mod-11):
  - `admin@prontopago.cl` / `admin123` → `admin`
  - `user1@prontopago.cl` / `user123` → `user`, RUT `11.111.111-1`
  - `userk@prontopago.cl` / `userk123` → `user`, RUT `8.765.432-K`
