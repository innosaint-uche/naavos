# Engineering Foundation — Implementation Plan

## Core Configs (Root)

- [x] `.eslintrc.cjs` — ESLint flat config for monorepo
- [x] `.prettierrc` — Prettier config
- [x] `tsconfig.base.json` — Shared TypeScript base
- [x] `.github/workflows/ci.yml` — CI pipeline

## Package Migration to TypeScript

- [x] `@naavos/schema` → TS + vitest
  - Migrated `src/index.js` → `src/index.ts` (Zod schemas with explicit `z.infer` type exports)
  - `dist/index.js` + `dist/index.d.ts` built via `tsc`
  - 40 Vitest tests covering all schemas (Metadata, Identity, Communication, Rule, Mode, Route, Privacy, AdapterTarget, AvatarPackage, KnowledgeSource)
  - `prepare` script auto-compiles on `pnpm install`
  - `exports` field points to `dist/` with `types` resolution
  - **Added `KnowledgeSourceSchema`** — `knowledge_sources` and `projects` now accept `z.union([z.string(), KnowledgeSourceSchema])` (backward-compatible with plain strings)
- [x] `@naavos/compiler` → TS + vitest
  - Migrated `src/index.js` → `src/index.ts` (typed `compile`/`listTargets`, `FileMap` type export)
  - Migrated all 6 adapter files: `hermes.ts`, `claude-code.ts`, `gemini.ts`, `openclaw.ts`, `cursor.ts`, `reme.ts`
  - `dist/` output with type declarations
  - 29 Vitest tests covering all 6 adapters + edge cases
  - `prepare` script auto-compiles on `pnpm install`
  - **Bug fix #1**: O(n²) `rules.indexOf(r)` in all adapters → replaced with `rules.map((r, i) => ...)` or `rules.map((r) => ...)` (index param or stable bullet format)
  - **Bug fix #2**: `knowledge_sources` type mismatch in `reme.ts` — original code called `.find(ks => ks.type === 'connector-reme')` on `z.array(z.string())` (always returned undefined → silent bug). Fixed by updating schema to `z.union([z.string(), KnowledgeSourceSchema])` and adding proper type narrowing in `extractReMeConfig()`
  - **Bug fix #3**: Removed unused `communication` variable in `gemini.ts`, removed unused `identity` variable in `reme.ts`
  - ESLint + TypeScript resolver for `.js`-in-TS imports configured at root
- [x] `@naavos/cli` → TS + vitest
  - Migrated `src/index.js` → `src/index.ts`, `src/types.ts`, `src/inquirer.d.ts`
  - `cli/tsconfig.json`, `cli/package.json` (keywords: `["naavos","cli","avatar"]`, MIT), `cli/bin/naavos.js` shim
  - `inquirer.d.ts` ambient declaration (no bundled types)
  - 6 Vitest tests covering `listTargets` re-export, `createTarGz` gzip output, compile integration
  - Lint clean (0 errors, 0 warnings), typecheck clean
  - Added CLI-specific ESLint override (`no-console: off` in `packages/cli/**/*.ts`)
  - Fixed `noUncheckedIndexedAccess` error: `backups[0].id` → `backups[0]?.id`
  - Fixed lint errors: `Array<T>` → `T[]`, removed unused `__dirname`/`fileURLToPath`/`TarEntry`/`TarHeader`
  - Removed unused `FileMap` import from `types.ts`, fixed import order in test
  - `listTargets` re-exported for test import
- [x] `@naavos/eval-packs` → TS + vitest
  - Migrated `src/index.js` → `src/index.ts`
  - 9 Vitest tests covering `listPacks`, `loadPack`, `runEval` (core + safety packs)
  - `runScenario` restructured to not pre-parse input (schema_valid scenario tests schema validity)
  - `default` case uses `as ScenarioType` type assertion (union type not discriminant)
  - `process.env.HOME` / `process.env.HERMES_HOME` use bracket notation
  - Lint clean, typecheck clean, all tests passing
- [ ] `@naavos/core` → TS + vitest (or remove if shim)

## Secret Scanning Integration

- [ ] Add `@naavos/security` package or integrate gitleaks in compiler pipeline
- [ ] Scan `avatar.json` before compile
- [ ] Scan compiled output before install
- [x] Gitleaks configured in CI (`.gitleaks.toml` + `gitleaks-action`)

## Template Extraction

- [ ] Extract Hermes adapter templates to `.eta` files
- [ ] Add template override mechanism (`--template-dir`)

## Generic Rollback

- [ ] Snapshot pre-install state for all targets
- [ ] Implement `rollback` for non-Hermes targets

---

**Order**: Configs → TypeScript migration (schema first) → Tests → CI → Security → Templates → Rollback
