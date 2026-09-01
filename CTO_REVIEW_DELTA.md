# NAAvOS — CTO Review: Delta Update

**Author:** Copaw (AI CTO Review)
**Date:** 2026-08-31
**Previous review:** CTO_REVIEW_NOTE.md (Aug 26, 2026 cycle)
**Current state:** Synced with `origin/main`, last 3 commits examined

---

## Executive Summary

Since the initial CTO review, the project has undergone **substantial foundational work**. The most critical gaps identified — missing linting, formatting, TypeScript config, CI pipeline, and secret scanning — have all been **addressed on GitHub `origin/main`**.

**What changed:** 57 files modified, ~1,760 insertions, ~900 deletions since my initial review. The engineering foundation has shifted from **"theoretical prototype"** to **"serious engineering discipline."**

**What remains:** The core packages are still plain JavaScript. Tests exist only as Node assertions (`node test.js`), not Vitest. Secret scanning runs in CI but not inside the compiler pipeline.

---

## Progress Tracker: My Original Recommendations vs Current State

| # | Original Finding | Status | Evidence |
|---|-----|--------|----------|
| 1 | **Add ESLint + Prettier** | ✅ **DONE** | `.eslintrc.cjs` (81 rules, TypeScript-aware), `.prettierrc` (with import-organize plugin) |
| 2 | **Add TypeScript base config** | ✅ **DONE** | `tsconfig.base.json` (strict, NodeNext, verbatimModuleSyntax) |
| 3 | **CI pipeline with gates** | ✅ **DONE** | `.github/workflows/ci.yml` — 5 jobs: lint+format, typecheck, test, build, secrets-scan + manual source-release |
| 4 | **Secret scanning integration** | ✅ **CI-LEVEL** — ❌ **COMPILER PIPELINE NOT DONE** | Gitleaks runs in CI via `gitleaks-action@v2`. Does NOT scan `avatar.json` during `naavos compile` |
| 5 | **Migrate core packages to TS** | ⏳ **INFRA READY** — ❌ **MIGRATION NOT STARTED** | `tsconfig.base.json` + `tsconfig.json` exist. But `packages/*/src/*.js` are still `.js`. `build-schema.mjs` just `copyFileSync` |
| 6 | **Vitest + first tests** | ⏳ **CONFIG READY** — ❌ **NO .test.ts FILES** | `vitest.config.ts` exists in schema. But **zero** `.test.ts` files. Tests are still `node test.js` |
| 7 | **Template extraction (Hermes adapter)** | ❌ **NOT STARTED** | `hermes.js` remains 180 lines of inline template strings |
| 8 | **Generic rollback (non-Hermes)** | ❌ **NOT STARTED** | CLI still throws for non-Hermes rollback |

---

## What Was Done (Since Initial Review)

### 1. Engineering Foundation (All ✅)

| File | What | Key Details |
|------|------|-------------|
| `.eslintrc.cjs` | ESLint flat config | `@typescript-eslint` recommended + stylistic, import ordering, unused-imports, `no-console: warn` |
| `.prettierrc` | Prettier config | 2-space indent, single quotes, 100-char print width, `prettier-plugin-organize-imports` |
| `tsconfig.base.json` | TypeScript base | `strict`, `noUncheckedIndexedAccess`, `noPropertyAccessFromIndexSignature`, `verbatimModuleSyntax` |
| `.github/workflows/ci.yml` | Full CI pipeline | 5 jobs + manual source-release. Uses `fetch-depth: 0` for gitleaks |
| `.husky/` + `lint-staged` | Pre-commit hooks | `eslint --fix` + `prettier --write` on `.{ts,tsx,js,jsx}`, `prettier` on config files |
| `package.json` | DevDeps expanded | Added 12 devDependencies: eslint ecosystem, prettier plugins, husky, lint-staged, typescript, vitest |

### 2. New Scripts

| Script | Purpose |
|--------|---------|
| `scripts/check-format.mjs` | Release-surface Prettier checker — only formats tracked release files (`.github/`, `apps/`, `packages/`, `docs/qa/`, `docs/reviews/` + specific named files) |
| `scripts/verify-live-tenants.mjs` | **Live tenant acceptance probe** — validates `https://mcp.naavos.radoss.agency/mcp` endpoint with bearer tokens (never prints tokens), checks HTTP status codes, rejects retired/local URLs |
| `scripts/build-schema.mjs` | Copies `schema/src/index.js` → `schema/dist/index.js` |

### 3. Documentation & Release Governance (Major Addition)

| File | Purpose |
|------|---------|
| `docs/PRODUCT_REQUEST_AND_RELEASE_CHARTER.md` | **Non-negotiable delivery rules** — defines source-public vs customer-ready release claims |
| `docs/qa/RELEASE_EVIDENCE_CURRENT.json` | Aggregate QA evidence (JSON) |
| `docs/qa/ROUTE_MATRIX.json` | Route verification matrix |
| `docs/qa/NAAS_PUBLIC_AVATAR_QA_RUNBOOK.md` | QA runbook |
| `docs/reviews/NAAS_PUBLIC_AVATAR_REVIEW_2026-08-23.md` | Public avatar review |
| `docs/contracts/capability-status.json` | **Honest capability assessment** — uses `observed`, `partial`, `target`, `blocked`, `not-started` vocabulary |
| `docs/PUBLIC_RELEASE.md` | Public release documentation |
| `docs/DEPLOYMENT_EVIDENCE.md` | Deployment evidence |
| `CODE_OF_CONDUCT.md` | Contributor covenant |
| `SECURITY.md` | Security policy |
| `ENGINEERING_FOUNDATION_TODO.md` | Engineering roadmap (my review validated this was needed) |
| `README.md` (rewritten) | Now says "public development baseline" — no longer claims production readiness |

### 4. Key Behavioral Changes

- **`format` script**: Changed from raw Prettier glob to `scripts/check-format.mjs` — only checks *release-surface* files, not the entire repo
- **`verify:live-tenants` script**: Added live acceptance probe for the MCP endpoint
- **README**: Removed the "0 stars, 0 forks" from local display, added release status warnings
- **package.json**: `secrets:scan` now uses `gitleaks detect` (was just a script, now wired to CI)

### 5. Package Updates

| Package | Change |
|---------|--------|
| `@naavos/schema/package.json` | Added: `build: scripts/build-schema.mjs`, `test:watch` script, `vitest` + `@types/node` devDeps, `exports` field |
| `@naavos/compiler/package.json` | Updated lint script: `eslint . --ext .js` |
| `@naavos/cli/package.json` | Same lint script update |
| `@naavos/eval-packs/package.json` | Same lint script update |
| `@naavos/core/package.json` | Same lint script update |
| All packages | `typecheck` is still `node --check` — **not actual TypeScript typechecking** |

### 6. Capability Status (Honest Assessment)

From `docs/contracts/capability-status.json` (as of 2026-08-25):

| Capability | Status | Honest? |
|-----------|--------|---------|
| compile | `partial` | ✅ — local tests pass, not certified for public release |
| safeInstall | `partial` | ✅ — local backup/rollback, target-by-target evidence incomplete |
| hermesTarget | `partial` | ✅ — local, not certified for public bundle release |
| claudeCodeTarget | `target` | ✅ — design only, no host acceptance |
| geminiTarget | `partial` | ✅ — local, unverified for public release |
| openclawTarget / cursorTarget | `target` | ✅ — source exists, no behavioral acceptance |
| remeTarget | `partial` | ✅ — local, optional projection only |
| conformance | `partial` | ✅ — local fixtures, not proven across all hosts |
| profileBundle | `partial` | ✅ — bundle code exists, no clean-install evidence |
| cogneeIntegration | `not-started` | ✅ — honest |
| memuAdapter | `not-started` | ✅ — honest |
| cloudSync | `not-started` | ✅ — honest |

**Assessment:** The capability status is remarkably honest — it uses `partial` and `target` instead of claiming `complete`. This is the right discipline.

---

## What Still Needs To Be Done

### Priority 1 (Before Next Review)

```markdown
✅ DONE: Root configs (ESLint, Prettier, TypeScript base)
✅ DONE: CI pipeline
⏳ PARTIAL: Vitest configured but no test files written
⏳ PARTIAL: Schema package has TypeScript infra but source is still .js
❌ TODO: Write first vitest test files (at minimum: schema parse, adapter compile)
❌ TODO: Migrate @naavos/schema to .ts source files
```

### Priority 2 (Next Sprint)

```markdown
❌ TODO: Secret scanning in compile pipeline (scan avatar.json + output before write)
❌ TODO: Template extraction (Hermes adapter → .eta files)
❌ TODO: Generic rollback for non-Hermes targets
❌ TODO: Update schema for knowledge_sources/projects (z.object instead of z.array(z.string))
```

### Priority 3 (Future)

```markdown
❌ TODO: Migrate compiler, cli, eval-packs to TypeScript
❌ TODO: Remove or upgrade @naavos/core (it's a compatibility shim)
❌ TODO: Implement MCP server (currently a stub)
❌ TODO: Dashboard product UI (still marketing-only)
```

---

## Code-Level Updates

### `packages/schema/src/index.js`
- Still plain JS (6,030 bytes). Zod schemas are unchanged structurally.
- New: `package.json` build script uses `scripts/build-schema.mjs`
- New: `tsconfig.json` extends `../../tsconfig.base.json`
- New: `vitest.config.ts` configured but no `.test.ts` files

### `packages/cli/index.js`
- Import order has been alphabetized (matches ESLint `import/order` rule)
- `createTarGz` function still uses manual tar buffer construction (my recommendation to use `archiver` is NOT yet applied)
- Rollback still Hermes-only

### `packages/compiler/src/adapters/hermes.js`
- Still 180 lines of inline templates (template extraction not done)
- `rules.indexOf(r)` inside `.map()` still O(n²)

### `package.json` (root)
- `"format"` and `"format:check"` now use release-surface script
- Added `"verify:live-tenants": "node scripts/verify-live-tenants.mjs"`
- Added `prepare: husky install`
- Added `lint-staged` config

---

## Engineering Discipline Maturity

| Discipline | Before | After | Gap |
|-----------|--------|-------|-----|
| **Linting** | ✗ Echo stubs | ✅ Real ESLint config + pre-commit | None |
| **Formatting** | ✗ No config | ✅ Prettier + release-surface checker | None |
| **Types** | ✗ JS only, no tsconfig | ✅ TS base config + per-package tsconfig | ❌ Source migration not started |
| **CI** | ✗ None | ✅ 5-job pipeline + secrets scan + source release | None |
| **Tests** | ✗ `node test.js` only | ✅ Vitest configured | ❌ No .test.ts files written |
| **Git hooks** | ✗ None | ✅ Husky + lint-staged | None |
| **Security scan** | ✗ None | ✅ Gitleaks in CI | ❌ Not in compile/install pipeline |
| **Release governance** | ✗ README claims ready | ✅ Charter + capability status + QA evidence | Ongoing documentation |
| **Secrets policy** | ✗ Theoretical | ✅ Live tenant probe + URL validation | ❌ Not enforced at compile time |

**Overall discipline grade: B+** (was D- at initial review)

---

## Key Takeaway

The project has transitioned from **"prototype with big ideas"** to **"serious engineering discipline with honest status reporting."** The foundational work is complete.

The remaining gap is **execution velocity on the TypeScript migration and test coverage**. The infrastructure is in place — someone just needs to write the migration and tests.

The most important next step is: **migrate `@naavos/schema` to `.ts` and write `schema.test.ts`** (as your `ENGINEERING_FOUNDATION_TODO.md` already prescribes). Everything else cascades from there.

---

*Generated by Copaw on 2026-08-31. Based on git diff of 57 files across 20 commits since initial review.*