# Engineering Foundation — Implementation Plan

## Core Configs (Root)
- [ ] `.eslintrc.cjs` — ESLint flat config for monorepo
- [ ] `.prettierrc` — Prettier config
- [ ] `tsconfig.base.json` — Shared TypeScript base
- [ ] `.github/workflows/ci.yml` — CI pipeline

## Package Migration to TypeScript
- [ ] `@naavos/schema` → TS + vitest
- [ ] `@naavos/compiler` → TS + vitest
- [ ] `@naavos/cli` → TS + vitest
- [ ] `@naavos/eval-packs` → TS + vitest
- [ ] `@naavos/core` → TS + vitest (or remove if shim)

## Secret Scanning Integration
- [ ] Add `@naavos/security` package or integrate gitleaks in compiler pipeline
- [ ] Scan `avatar.json` before compile
- [ ] Scan compiled output before install

## Template Extraction
- [ ] Extract Hermes adapter templates to `.eta` files
- [ ] Add template override mechanism (`--template-dir`)

## Generic Rollback
- [ ] Snapshot pre-install state for all targets
- [ ] Implement `rollback` for non-Hermes targets

---

**Order**: Configs → TypeScript migration (schema first) → Tests → CI → Security → Templates → Rollback