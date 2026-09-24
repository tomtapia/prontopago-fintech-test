# ProntoPago — Financial Risk Inquiry

**Secure MVP that scores credit risk by Chilean RUT behind JWT auth and role-based access control.**

[![CI](https://github.com/tomtapia/prontopago-fintech-test/actions/workflows/ci.yml/badge.svg)](https://github.com/tomtapia/prontopago-fintech-test/actions)
![version](https://img.shields.io/badge/version-0.1.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933)
![pnpm](https://img.shields.io/badge/pnpm-9-F69220)
![TypeScript](https://img.shields.io/badge/TypeScript-5_strict-3178C6)
![coverage API](https://img.shields.io/badge/coverage_API-96%25-brightgreen)
![coverage Web](https://img.shields.io/badge/coverage_Web-97%25-brightgreen)
![license](https://img.shields.io/badge/license-TBD-lightgrey)

## About / What It Does

Evaluating someone's financial risk should be a single authenticated call — not a
spreadsheet emailed around. This monorepo delivers a **secure REST API**
(Node.js + TypeScript) that issues signed JWTs and returns a deterministic
financial score (0–100) for a Chilean RUT, plus a **responsive SPA**
(React + TypeScript) to log in and query scores. Role-based authorization is
enforced server-side: `user`s can only see their own score, `admin`s can query
any RUT. Scores are reproducible per RUT via a normalized in-memory cache, so
demos and tests never flake.

## Key Features

- **JWT auth + RBAC out of the box** — HS256 tokens (`sub`, `role`, `rut` for
  `user`s, 1h expiry) with `401` / `403 OWN_RUT_ONLY` enforcement.
- **Deterministic scoring** — `sha256(normalized RUT)[0:8] % 101` behind a
  `Map` cache keyed by dotless RUT; same RUT (any format or case) always
  returns the same score.
- **Real Chilean RUT validation** — mod-11 check digit including `K`
  (`8.765.432-K`), normalization (strip dots, uppercase).
- **Hardened API surface** — Zod validation on every input, helmet, CORS
  allowlist, JSON limits, login rate-limiting, typed error envelope
  `{ error: { code, message } }`.
- **Tested beyond the bar** — 30 tests, API ~96% stmts / ~85% branches and web
  ~97% stmts / ~89% branches (80% enforced in CI).
- **DDD backend, clean frontend** — Express layered as
  `domain / application / infrastructure / presentation`; Vite + Tailwind +
  shadcn-style primitives with `react-hook-form` + Zod.
- **CI on every push/PR** — typecheck, tests, and builds for both workspaces.

## Getting Started

### Prerequisites

- **Node.js 20+** and **pnpm 9** (`packageManager: pnpm@9.0.0`).
- No database. No external services.

### Installation

```bash
pnpm install
cp apps/api/.env.example apps/api/.env   # set JWT_SECRET (min 32 chars in prod)
```

> The frontend needs no setup: `VITE_API_URL` defaults to
> `http://localhost:3000` (see `apps/web/.env.example`).

### Quickstart (under 2 minutes)

```bash
pnpm dev   # api http://localhost:3000 + web http://localhost:5173, in parallel
```

Then log in and score a RUT:

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"user1@prontopago.cl","password":"user123"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")

curl -s http://localhost:3000/score/11.111.111-1 -H "Authorization: Bearer $TOKEN"
# {"rut":"11111111-1","score":46,"fecha":"2026-09-24T17:43:16.917Z"}
```

Or open `http://localhost:5173` and use the UI.

## Usage & Examples

**Log in** — `POST /login` with `{ username, password }` returns
`{ token, user }`. The JWT payload carries `sub`, `role`, and `rut` (only when
`role` is `user`, normalized without dots):

```bash
curl -s -X POST http://localhost:3000/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin@prontopago.cl","password":"admin123"}'
```

**Query a score** — `GET /score/:rut` with `Authorization: Bearer <token>`
returns `{ rut, score, fecha }`:

```bash
curl -s http://localhost:3000/score/8.765.432-K -H "Authorization: Bearer $TOKEN"
# {"rut":"8765432-K","score":13,"fecha":"..."}
```

**Authorization in action** (as `user1`, whose RUT is `11.111.111-1`):

```bash
curl -s -w "\nHTTP:%{http_code}\n" http://localhost:3000/score/12.345.678-5 \
  -H "Authorization: Bearer $TOKEN"
# {"error":{"code":"OWN_RUT_ONLY","message":"Forbidden: can only query own RUT"}}
# HTTP:403
```

**Mock users:**

| user | password | role | RUT |
| --- | --- | --- | --- |
| `admin@prontopago.cl` | `admin123` | `admin` | any RUT |
| `user1@prontopago.cl` | `user123` | `user` | `11.111.111-1` |
| `userk@prontopago.cl` | `userk123` | `user` | `8.765.432-K` |

Error codes: `400 INVALID_RUT` (bad format/check digit) ·
`401 UNAUTHORIZED / INVALID_TOKEN / TOKEN_EXPIRED / INVALID_CREDENTIALS` ·
`403 OWN_RUT_ONLY` · `404 NOT_FOUND`.
Full contracts live in [`docs/specs/financial-risk-inquiry/design.md`](docs/specs/financial-risk-inquiry/design.md).

## Project Structure

```text
apps/api   Express + TS — domain/ (RUT, score) · application/ (auth, score services)
           · infrastructure/ (mock users, score Map cache) · presentation/ (routes, middlewares, Zod schemas)
apps/web   Vite + React 18 + TS + Tailwind — LoginForm · ScoreInquiry · AuthContext (localStorage pp_token) · api/rut clients
docs/specs SDD requirements / design / tasks — read before coding (see docs/specs/README.md)
.github    CI workflow (typecheck, tests with coverage gates, builds)
```

Per-workspace details: [`apps/api/README.md`](apps/api/README.md),
[`apps/web/README.md`](apps/web/README.md).

## Testing

```bash
pnpm test                          # all workspaces
pnpm --filter @prontopago/api test # Vitest + Supertest + v8 coverage
pnpm --filter @prontopago/web test # Vitest + Testing Library
```

Verified: **API 17/17** (~96% stmts / ~85% branches), **web 13/13** (~97%
stmts / ~89% branches), `tsc --noEmit` clean, `vite build` OK, plus live E2E
(200 own-RUT, repeat determinism, 403 foreign-RUT, 401 no-token, 400 bad-RUT).

## Roadmap / Status

**Status: working MVP (v0.1.0)** — auth, RBAC, deterministic scoring, SPA, CI,
and docs are done and green.

Proposed next milestones:

- [ ] `httpOnly`-cookie sessions (replace `localStorage` JWT — XSS hardening)
- [ ] Refresh-token rotation + logout revocation list
- [ ] Persistent score store (replace in-memory `Map`) + admin audit log
- [ ] Real bureau integration behind the score service port
- [ ] E2E suite (Playwright) against preview environments

## Community & Ecosystem

- **Specs & design:** [`docs/specs/`](docs/specs/) (requirements, API design, tasks)
- **Contributing:** [`CONTRIBUTING.md`](CONTRIBUTING.md) — SDD-first, TDD, Conventional Commits, PR flow
- **Issues & feedback:** [GitHub Issues](https://github.com/tomtapia/prontopago-fintech-test/issues)
- **CI:** [Actions runs](https://github.com/tomtapia/prontopago-fintech-test/actions)

## Built With AI Assistance

- Monorepo/DDD scaffolding, Tailwind config, and `docs/specs/*` wording.
- Drafts of the RUT mod-11 validator, `scoreCache` Map, JWT middlewares, and
  Zod schemas — all reviewed and verified with tests + live `curl` E2E.
- Frontend `api.ts`/`rut.ts` clients, `LoginForm`/`ScoreInquiry` drafts, and
  Testing Library tests (including diagnosing the `forwardRef` fix on `Input`
  and the `globals: true` test-env fix from failing tests).

## License

No `LICENSE` file is declared yet — all rights reserved by default. Add one
(e.g. MIT) before distributing this project publicly.
