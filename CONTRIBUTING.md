# Contributing to ProntoPago — Financial Risk Inquiry

Thanks for contributing. This repo is spec-driven and test-driven — please follow the workflow below so reviews stay fast.

## Workflow

1. **Read the spec first** (SDD is mandatory): start at
   [docs/specs/README.md](docs/specs/README.md), then the
   `requirements.md` / `design.md` for the area you're changing. No code
   without a covering requirement ID.
2. **Create a branch** from `main`: `feat/<name>`, `fix/<name>`,
   `docs/<name>`, `chore/<name>`, `ci/<name>`.
3. **TDD**: write the failing test, implement the minimum, keep coverage at
   or above **80%** (statements, branches, functions, lines — enforced in CI).
4. **Commit** with [Conventional Commits](https://www.conventionalcommits.org/):
   `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`, `ci:`.
   One context per commit, small and stable.
5. **Open a PR** against `main`. CI (typecheck, tests, builds) must pass.
   Keep the diff focused; update `docs/specs/*` and `README.md` if behavior
   or contracts changed.

## Commands

```bash
pnpm install
pnpm dev    # api :3000 + web :5173
pnpm test   # all workspaces (coverage thresholds enforced)
pnpm build  # all workspaces
```

## Mock credentials

| user | pass | role |
| --- | --- | --- |
| `admin@prontopago.cl` | `admin123` | `admin` |
| `user1@prontopago.cl` | `user123` | `user` (`11.111.111-1`) |
| `userk@prontopago.cl` | `userk123` | `user` (`8.765.432-K`) |
