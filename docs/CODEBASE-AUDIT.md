# NAAvOS Codebase Audit

**Date:** 2026-08-17  
**Auditor:** Kilo (Automated Code Review)  
**Repository:** `/Users/radossagency/Documents/NAAS/`  
**Scope:** Full codebase, docs, configs, and Hermes alignment  
**Status:** NO-GO for public release in current state  
**Recommendation:** Controlled rebuild following Phase 0 → Phase 1 plan below  

---

## 1. EXECUTIVE SUMMARY

The project is a **Phase 0 prototype wrapped in a production-grade documentation shell.**

The documentation (`DEVELOPMENT_DOCUMENTATION.md`, `CTO_REPORT.md`, ADRs) describes a sophisticated compiler and conformance platform. The actual codebase delivers a stubbed CLI, a non-compliant MCP server, a working but brand-confused Next.js landing page, and a monorepo that cannot be installed fresh.

**Verdict:** NO-GO for public release. GO for controlled rebuild.

---

## 2. FILE INVENTORY

### Canonical Structure (Intended)

```
NAAS/
├── apps/
│   ├── dashboard/                  # Next.js public landing page
│   └── mcp-server/                 # Cloudflare Worker MCP prototype
├── packages/
│   ├── cli/                        # Commander CLI (prototype)
│   ├── core/                       # Basic schema + validation
│   └── kb-starter/                 # Starter KB template
├── docs/
│   ├── TEMPLATES/                  # Host instruction templates
│   ├── CTO_REPORT.md
│   ├── DEVELOPMENT_DOCUMENTATION.md
│   ├── avatar.ts                   # Zod schema (target)
│   └── avatar.json                 # Sanitized fixture
├── package.json                    # Root monorepo
├── pnpm-workspace.yaml
├── turbo.json
└── .gitleaks.toml
```

### Actual Structure (Observed)

```
NAAS/
├── apps/
│   └── dashboard/                  # Next.js - NAAvOS branding ✓
├── dashboard/                      # ROOT-LEVEL DUPLICATE - N-A-A-S branding ✗
├── naavos-mcp-server/              # ROOT-LEVEL DUPLICATE ✗
├── packages/
│   ├── cli/                        # Prototype stubs
│   ├── core/                       # Simple placeholder schema
│   └── kb-starter/                 # Empty placeholder
├── docs/
│   ├── TEMPLATES/
│   │   ├── CLAUDE.md               # CORRUPTED (embedded GEMINI.md)
│   │   ├── GEMINI.md
│   │   └── AGENT.md
│   └── (no design/ or contracts/ dirs)
├── package.json                    # pnpm monorepo
├── pnpm-workspace.yaml             # Only globs apps/* and packages/*
├── turbo.json
└── .gitleaks.toml                  # Unused
```

### Missing Files

| File | Purpose |
|------|---------|
| `pnpm-lock.yaml` | Lockfile for reproducible installs |
| `apps/mcp-server/package.json` | MCP server workspace config |
| `docs/contracts/capability-status.json` | Public claim gating |
| `.github/workflows/` | CI/CD |
| `LICENSE` | Root license file |
| `CHANGELOG.md` | Version history |
| `CODE_OF_CONDUCT.md` | Community standards |
| `SECURITY.md` | Security policy |
| `.prettierrc`, `.eslintrc` | Lint/format configs |

### Artifacts That Should Not Be In Git

| Artifact | Location | Action |
|----------|----------|--------|
| Swap file | `dashboard/src/app/.page.tsx.swp` | Delete, add to .gitignore |
| `.next/` build output | `dashboard/.next/` | Already in .gitignore, verify |
| `node_modules/` | Various | Already in .gitignore, verify |

---

## 3. MONOREPO HYGIENE — CRITICAL

### 3.1 Duplicate Directories

| Duplicate | Canonical | Action |
|-----------|-----------|--------|
| `apps/dashboard/` | Keep | NAAvOS branding, complete config |
| `dashboard/` (root) | Delete | Stale "N-A-A-S" branding, missing configs |
| `apps/mcp-server/` | Keep | Part of declared workspace |
| `naavos-mcp-server/` (root) | Delete | Byte-identical duplicate, outside workspace |

### 3.2 Workspace Configuration

**Current:** `pnpm-workspace.yaml` only globs `apps/*` and `packages/*`  
**Problem:** Root-level `dashboard/` and `naavos-mcp-server/` are excluded  
**Fix:** After deleting duplicates, workspace is correct. Add missing `package.json` files if new packages are created.

### 3.3 Package Manager

| Item | Declared | Actual | Fix |
|------|----------|--------|-----|
| Package manager | `pnpm@9.15.9` | `CONTRIBUTING.md` says `npm install` | Update CONTRIBUTING.md |
| Lockfile | `pnpm-lock.yaml` | Missing | Run `pnpm install`, commit |
| Turborepo | `turbo.json` + scripts | `turbo` not in devDependencies | Add `turbo: ^2.0.0` to root |
| Root scripts | `build`, `dev`, `lint`, `test` | All fail (`turbo: command not found`) | Verify after adding turbo |

### 3.4 Package Scripts

| Package | build | lint | typecheck | test |
|---------|-------|------|-----------|------|
| `@naavos/core` | `echo 'No build step'` | `echo 'Lint not configured'` | `echo 'No TypeScript'` | `node test.js` ✓ |
| `@naavos/cli` | `echo 'No build step'` | `echo 'Lint not configured'` | `echo 'No TypeScript'` | `node --check` |
| `@naavos/kb-starter` | `echo 'No build step'` | `echo 'Lint not configured'` | `echo 'No TypeScript'` | `echo 'No tests yet'` |
| `naavos-dashboard` | `next build` | `echo 'Lint not configured'` | `tsc --noEmit` | `echo 'No tests yet'` |
| `@naavos/mcp-server` | `echo 'No build step'` | `echo 'Lint not configured'` | `echo 'No TypeScript'` | `node --check` |

**Issue:** Only `core/test.js` contains real tests. All other "test" scripts are syntax checks or stubs.

---

## 4. CLI IMPLEMENTATION vs DOCUMENTATION — CRITICAL

### 4.1 Documented vs Actual Commands

| Documented Command | Actual Implementation | Status |
|--------------------|----------------------|--------|
| `naavos compile` | Does not exist | Missing |
| `naavos install` | Does not exist | Missing |
| `naavos validate` | Does not exist | Missing |
| `naavos doctor` | Hard-coded `pass: true` | Fake |
| `naavos connect <agent>` | Prints success, writes nothing | Fake |
| `naavos sync` | `setTimeout(1000)` then "Synced!" | Fake |
| `naavos log` | `console.log('Logged: ...')` | Stub |
| `naavos init` | Creates `~/.naavos/avatar.json` with 4 fields | Partial |

### 4.2 Specific Issues

**`packages/cli/index.js:94-101` — `sync`:**
```javascript
const spinner = ora('Syncing...').start();
await new Promise(r => setTimeout(r, 1000));
spinner.succeed(chalk.green('Synced!'));
```
No actual sync occurs.

**`packages/cli/index.js:104-122` — `connect`:**
```javascript
const agentPaths = {
  'claude-code': path.join(process.env.HOME, '.claude/CLAUDE.md'),
  // ...
};
if (agentPaths[agent]) {
  spinner.succeed(chalk.green(`${agent} connected!`));
}
```
No files are created or modified. No verification occurs.

**`packages/cli/index.js:124-146` — `doctor`:**
```javascript
const checks = [
  { name: 'Avatar Schema', pass: true },
  { name: 'Knowledge Base', pass: true },
  // ...
];
```
Hard-coded passing. No filesystem or process checks.

**`packages/cli/index.js:33-92` — `init`:**
- Creates `~/.naavos/avatar.json` with `avatar_api.version`, `owner`, `mbti`, `email`
- Does not use `@naavos/core`'s `createAvatar` or `validateSchema`
- Schema diverges from `docs/avatar.ts`

**Impact:** README and SETUP.md advertise `compile` and `install` as primary commands. This is a capability-status violation per `DEVELOPMENT_DOCUMENTATION.md §21.2`.

---

## 5. SCHEMA INCONSISTENCIES — HIGH

Three schema definitions exist, none aligned:

| File | Schema Shape | Status |
|------|-------------|--------|
| `packages/core/index.js:14-52` | Simple `avatar_api` object | Implemented but incomplete |
| `docs/avatar.ts:100-123` | Full Zod `AvatarPackageSchema` | Documented target only |
| `docs/avatar.json` | Matches Zod schema | Fixture only |

**Required fix:** Move Zod schemas from `docs/avatar.ts` into `@naavos/schema` package. Update `packages/core/index.js` to use the canonical schema.

---

## 6. MCP SERVER — NON-COMPLIANT & INSECURE — HIGH

`apps/mcp-server/src/index.js` (and duplicate):

### 6.1 Protocol Non-Compliance
- Custom REST routes, not JSON-RPC 2.0
- No lifecycle initialization
- No capability negotiation
- Project docs mandate official TypeScript SDK with STDIO transport

### 6.2 Security Issues
| Issue | Location | Detail |
|-------|----------|--------|
| Public CORS wildcard | `src/index.js:11` | `Access-Control-Allow-Origin: *` |
| Unauthenticated header | `src/index.js:55` | `X-NAAVOS-User-ID` trusted without verification |
| Cloudflare-incompatible code | `src/index.js:115` | `process.uptime?.()` does not exist in Workers |

### 6.3 Functional Issues
- Hard-coded mock data in `handleLoad`
- No D1, R2, or persistence
- Duplicate server in `naavos-mcp-server/`

**Decision for v1:** Remove MCP server from MVP scope. Rebuild on official SDK in post-MVP.

---

## 7. SECURITY FINDINGS — MEDIUM/HIGH

| Finding | Location | Detail | Priority |
|---------|----------|--------|----------|
| Public CORS wildcard | `apps/mcp-server/src/index.js:11` | `*` allows any origin | High |
| Unauthenticated user ID header | `apps/mcp-server/src/index.js:55` | Trusted without validation | High |
| Personal data in templates | `docs/TEMPLATES/CLAUDE.md`, `GEMINI.md`, `AGENT.md` | Hard-coded Coolify/Vercel/Doppler stack | Medium |
| Corrupted template | `docs/TEMPLATES/CLAUDE.md:53-101` | Entire GEMINI.md embedded at end | Medium |
| Secret scanner unused | `.gitleaks.toml` exists | No CI/pre-commit integration | Medium |
| No secret redaction in MCP | `apps/mcp-server/src/index.js` | Returns full avatar objects | Medium |

---

## 8. FRONTEND / DASHBOARD — MEDIUM

### 8.1 `apps/dashboard/` (Canonical)
- **Overlapping motion libraries:** `@gsap/react`, `gsap`, `framer-motion` all installed
- **Unused MUI/Emotion:** `@mui/material`, `@emotion/react`, `@emotion/styled` in package.json but not imported
- **No accessibility pass:** No WCAG 2.2 AA evidence
- **Brand:** Uses "NAAvOS"; historical `naavos.io` references in this audit
  are not current routing authority and must not be used for deployment.

### 8.2 `dashboard/` (Root — Stale)
- **Different package name:** `naass-dashboard` vs `naavos-dashboard`
- **Stale branding:** "N-A-A-S" and `https://naass.io`
- **Missing configs:** No `tsconfig.json`, `tailwind.config.js`, `next-env.d.ts`

### 8.3 Library Conflicts
`DEVELOPMENT_DOCUMENTATION.md §7.8` says: "Reduce the UI stack to Tailwind CSS, CSS custom properties and a small accessible primitive layer. Remove MUI/Emotion and GSAP unless approved."

Current state violates this directive.

---

## 9. HERMES ALIGNMENT ANALYSIS

### 9.1 Hermes Runtime Requirements

| Hermes Concept | Hermes File/Pattern | NAAvOS Equivalent | Status |
|----------------|---------------------|-------------------|--------|
| Core identity | `SOUL.md` | Compiler output | Not implemented |
| Mode overlays | `sub-agents/*.md` | Compiler output | Not implemented |
| Reusable skills | `skills/*/SKILL.md` | Compiler output | Not implemented |
| Persistent memory | `memories/MEMORY.md`, `USER.md` | Compiler output | Not implemented |
| Avatar profiles | `profiles/avatar/` | Compiler output | Not implemented |
| Managed blocks | `<!-- NAAVOS:BEGIN/END -->` | Installer managed blocks | Not implemented |
| Backup + rollback | `.bak` files + journal | Safe installer | Not implemented |
| Structural validation | `avatar-check.sh` | `naavos doctor` | Fake implementation |
| Memory providers | `plugins/memory/<name>/` | Post-MVP | Not started |
| MCP catalog | `plugins/` + MCP client | Post-MVP | Non-compliant prototype |

### 9.2 Local Reference System Review

**Path:** `/Users/radossagency/Documents/Uchenna Innocent - AVATAR/Uchenna-Avatar-OS/`

This is the **reference implementation** proving the Hermes integration pattern:

- `SOUL.md` = frozen core identity (213 lines)
- `sub-agents/*.md` = 9 mode overlays (CTO, CCO, CMO, etc.)
- `skills/` = shared skill packages via `~/.shared-ai-skills/`
- `host-adapters/` = per-agent file generators
- `automations/avatar-check.sh` = structural validation across all surfaces
- `automations/validate-growth.js` = semantic validation
- `knowledge/creative-os/functions/*.json` = 3 function definitions (creative, technical, strategic)
- `system_prompts/*.md` = mode-specific prompts with guardrails

**Key insight:** The local system works. It is hand-maintained, not compiler-driven. NAAvOS must **compiler-generate** these artifacts, not reinvent the runtime.

### 9.3 Hermes Runtime Architecture (Fact-Checked)

**Sources:** https://hermes-agent.nousresearch.com/, https://github.com/NousResearch/hermes-agent, local `~/.hermes/` installation

Hermes is an **AI agent orchestrator** — the same core agent runs across CLI, TUI, Desktop App, and Messaging Gateway. It is NOT a competitor to NAAVOS. It is the **runtime** NAAVOS compiles for.

#### Key Hermes facts (verified):

| Concept | Hermes Implementation | NAAvOS Implication |
|---------|----------------------|-------------------|
| Home directory | `~/.hermes/` (macOS/Linux) or `%LOCALAPPDATA%\hermes` (Windows) | NAAVOS writes output here |
| Core identity | `SOUL.md` at Hermes home root | Compiler output |
| Mode overlays | `sub-agents/*.md` | Compiler output |
| Reusable skills | `~/.hermes/skills/*/SKILL.md` and `~/.shared-ai-skills/*/SKILL.md` | Compiler output |
| Persistent memory | `memories/MEMORY.md`, `USER.md` | Compiler output |
| Avatar profiles | `profiles/avatar/` or `profiles/<name>/` | Compiler output |
| Configuration | `config.yaml` (settings) + `.env` (secrets only) | Installer manages |
| Profile distribution | **Export/import as `.tar.gz`** via GUI (`⌘K → Import profile…`) or CLI (`hermes profile import`) | **PRIMARY INTEGRATION MODE** |
| Migration | `hermes claw migrate` imports from OpenClaw | Pattern to replicate |
| Skills discovery | Auto-scans `~/.hermes/skills/` and `~/.shared-ai-skills/` | Drop-in skill packages |
| Desktop app | Electron shell + React UI, drives same backend as CLI (`hermes serve`) | NAAVOS output works in all surfaces |
| Installation | `curl -fsSL https://hermes-agent.nousresearch.com/install.sh \| bash` | Hermes-first onboarding |

#### What Hermes does NOT have:
- Native "execute instructions from file on boot" mechanism
- Built-in avatar compiler or schema validation
- Managed block markers or rollback journal (that's NAAVOS's value-add)
- NAAVOS-specific integration points (yet)

### 9.4 Hermes-First Onboarding Path

**The absolute simplest path for users who choose Hermes as their runtime:**

**Mode A: Profile Bundle (Easiest — zero Hermes CLI needed)**
1. User installs Hermes (one-liner or desktop app DMG)
2. User runs `naavos compile --target hermes --format tar.gz` → produces `avatar-profile.tar.gz`
3. User drops file into Hermes desktop import (`⌘K → Import profile…`) OR runs `hermes profile import avatar-profile.tar.gz`
4. Hermes applies the profile — skills, memories, SOUL.md, sub-agents all loaded
5. Done. No manual file placement, no NAAVOS CLI needed after compile.

**Mode B: Direct Install (Developer)**
1. User has Hermes installed (`~/.hermes/` exists)
2. User runs `naavos install --target hermes`
3. NAAVOS detects Hermes home, backs up existing files, writes compiled output directly to `~/.hermes/`
4. Hermes picks up changes on next session
5. Rollback available via `naavos rollback <tx-id>`

**Mode C: Hermes Skill (Chat-driven)**
1. NAAVOS installs as a Hermes skill: `~/.hermes/skills/naavos/SKILL.md`
2. User opens Hermes and runs `/naavos compile` or `/naavos init`
3. Skill invokes NAAVOS compiler, produces output, installs it
4. This is the "drop a line of instruction" pattern — user never leaves Hermes chat

**Mode D: Drop-in instruction file (Simplest for non-technical)**
1. NAAVOS produces a single file: `~/.hermes/skills/naavos-onboard/SKILL.md`
2. File contains instructions for Hermes to load the avatar from `~/.naavos/compiled/hermes/`
3. Hermes auto-discovers the skill on next launch
4. User activates with `/naavos-onboard` or similar
5. Result: One drop, zero commands beyond initial Hermes install

**Recommended default:** Mode A (Profile Bundle) as primary, with Mode B (Direct Install) as the CLI alternative. Mode C/D is a v1.1 skill wrapper.

### 9.5 Integration Model Summary

| User Type | Path | Commands | Time |
|-----------|------|----------|------|
| **Hermes-first (non-techie, desktop)** | Install Hermes app → import NAAVOS `.tar.gz` via GUI | 1 click + 1 import | 2 minutes |
| **Hermes-first (developer)** | `naavos install --target hermes` | 3 commands | 60 seconds |
| **Hermes-first (chat-driven)** | Drop NAAVOS skill into `~/.hermes/skills/` → `/naavos init` in chat | 1 drop + 1 command | 1 minute |
| **Non-Hermes (non-techie)** | Copy-paste generated files into Claude/Gemini/Cursor | 2-3 copy-pastes | 5 minutes |
| **Non-Hermes (developer)** | `naavos install --target claude` | 3 commands | 60 seconds |
| **Contributor** | `git clone` → `pnpm install` | 4 commands | 5 minutes |

**Key principle:** Hermes is the easiest path, not the hardest. The compiler produces portable artifacts. The installer (or manual drop) places them. Hermes consumes them natively. No Hermes code changes required — NAAVOS is a compiler, not a plugin.

---

## 10. OPEN SOURCE BEST PRACTICES GAPS

| Practice | Current State | Required |
|----------|--------------|----------|
| Contributing guide | Says `npm install` | Change to `pnpm install` |
| Issue templates | None | Add `.github/ISSUE_TEMPLATE/` |
| PR template | None | Add `.github/PULL_REQUEST_TEMPLATE.md` |
| Code of Conduct | None | Add `CODE_OF_CONDUCT.md` |
| Security policy | None | Add `SECURITY.md` with gitleaks integration |
| License | MIT in package.jsons | Add root `LICENSE` file |
| Changelog | None | Add `CHANGELOG.md` |
| Versioning | All at 1.0.0 | Implement semver with git tags |
| Capability status | Not enforced | Add `docs/contracts/capability-status.json` |
| CI/CD | None | Add GitHub Actions workflows |
| Pre-commit hooks | None | Add `lint-staged` + `husky` or similar |
| Neutral defaults | Templates contain personal stack | Replace with placeholders |

---

## 11. M.C.I.A. STRATEGIC ASSESSMENT

### Map
- **Arena:** No mature "avatar compiler" product exists. Problem validated by local system, unfilled in open-source market.
- **Competitors:** None direct. Hermes is the runtime, not a competitor.
- **Position:** "The open-source compiler that produces Hermes-compatible avatars." Differentiated and achievable.

### Connect
- **Hermes-first (primary):** User installs Hermes (one-liner or desktop app) → drops NAAVOS output → Hermes picks it up natively. This is the EASIEST path.
- **Non-Hermes (secondary):** Copy-paste generated files into Claude Code, Gemini, Cursor, OpenClaw. Same compiler, different targets.
- **Developers:** `git clone` → `pnpm install` → extend adapters.

### Implement
**Ship the simplest possible version of one feature that works.**

The 7-step sequence is the destination architecture. Building it before proving adoption is building on sand. The MVP is a **static-context compiler** that produces text files for AI agents.

### Analyse
Measure: "How many users compiled a working profile?" That is the only v1 metric.

---

## 12. IMPLEMENTATION PATH

### Phase 0: Repository Truth (Week 1)
**Goal:** `git clone` + `pnpm install` + `pnpm run build` works.

| Action | Detail |
|--------|--------|
| Delete root `dashboard/` | Keep only `apps/dashboard/` |
| Delete root `naavos-mcp-server/` | Remove duplicate |
| Fix `pnpm-workspace.yaml` | Ensure all packages included |
| Generate `pnpm-lock.yaml` | Run `pnpm install`, commit |
| Pin `turbo` in root devDependencies | Add `turbo: ^2.0.0` |
| Fix root `package.json` scripts | Ensure `turbo` commands work |
| Remove fake CLI commands | Remove `connect`, `sync`, fake `doctor` |
| Fix `docs/TEMPLATES/CLAUDE.md` | Remove embedded GEMINI.md |
| Add `docs/contracts/capability-status.json` | Gate all public claims |
| Update `CONTRIBUTING.md` | `pnpm install` not `npm install` |
| Add root `LICENSE` | MIT license file |
| Remove swap file | `dashboard/src/app/.page.tsx.swp` |
| Add `.gitignore` entries | `.next/`, `*.swp`, `.DS_Store` |

**Exit criteria:** Fresh clone installs and builds with `pnpm install && pnpm run build`.

### Phase 1: Schema + Hermes Compiler (Week 2)
**Goal:** Deterministic generation of Hermes-compatible artifacts.

| Action | Detail |
|--------|--------|
| Create `@naavos/schema` package | Move Zod schemas from `docs/avatar.ts` |
| Create `@naavos/compiler` package | Template literal generators for Hermes format |
| Implement Hermes adapter | `SOUL.md`, `SKILL.md`, `sub-agents/*.md`, `memories/*.md`, `profiles/avatar/` |
| Implement Claude Code adapter | `CLAUDE.md` |
| Implement Gemini adapter | `GEMINI.md` |
| Implement OpenClaw adapter | `AGENTS.md` |
| Add `naavos compile [--target <id>]` | With `--dry-run` flag |
| Add `naavos validate [path]` | Real Zod validation with error reporting |

**Exit criteria:** `naavos compile --target hermes` produces a directory of files droppable into `~/.hermes/`.

### Phase 2: Safe Installer + Real Doctor (Week 3)
**Goal:** Reversible, evidence-backed installation.

| Action | Detail |
|--------|--------|
| Implement `naavos install --target <id>` | Backup, diff preview, managed blocks, atomic write |
| Implement `naavos rollback <tx-id>` | Restore from backup journal |
| Implement real `naavos doctor` | Validate, check targets, verify digests, report evidence |
| Add backup journal | Append-only transaction log with timestamps |

**Exit criteria:** Install, modify avatar, reinstall, rollback — all produce observed evidence.

### Phase 3: Hermes-First Onboarding (Week 4)
**Goal:** 2-minute setup for Hermes users, 5-minute for non-Hermes users.

| Action | Detail |
|--------|--------|
| **Hermes-first path (primary)** | `naavos compile --target hermes --format zip` → `naavos install --target hermes` OR manual drop into `~/.hermes/` |
| **Drop-in instruction variant** | NAAVOS produces `ONBOARD.md` that Hermes reads and executes on next boot |
| **Non-Hermes path (secondary)** | Copy-paste generated files into Claude Code, Gemini, Cursor, OpenClaw |
| **Desktop installer** | Optional Tauri/Electron wrapper that chains Hermes install + NAAVOS setup |
| Write getting-started guide | Screenshots for Hermes desktop app, Claude Code, Gemini, Cursor |
| Publish to npm | `@naavos/cli` as entry point |

**Hermes-first flow:**
1. `curl -fsSL https://hermes-agent.nousresearch.com/install.sh \| bash` (or download desktop app)
2. `naavos init` (4 questions)
3. `naavos compile --target hermes`
4. `naavos install --target hermes` (or drop the ZIP manually)
5. Done. Hermes picks up the profile on next session.

**Exit criteria:** 
- Hermes user completes setup in under 2 minutes
- Non-Hermes user completes setup in under 5 minutes
- Zero manual file editing required

---

## 13. TECH STACK RECOMMENDATION

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Schema** | Zod | Already designed in `docs/avatar.ts` |
| **Compiler** | Template literals | Zero dependencies, deterministic |
| **Primary target** | Hermes | Native SOUL.md, SKILL.md, sub-agents, memories, profiles |
| **Secondary targets** | Claude Code, Gemini, OpenClaw, Cursor | File-based adapters |
| **Installer** | `fs` + backup rename | Atomic enough for text configs |
| **Package manager** | pnpm 9.15.9 | Single lockfile, efficient workspaces |
| **Monorepo tool** | Turborepo | Accepted ADR-001 |
| **Testing** | Vitest | Fast, ESM-native |
| **CLI framework** | Commander + Inquirer | Already working |
| **Memory/Ledger** | None (v1) | Post-MVP |
| **MCP server** | None (v1) | Post-MVP |
| **Dashboard** | None (v1) | Post-MVP |
| **Cognee/memU** | None (v1) | Post-MVP |

---

## 14. CAPABILITY GATES (MANDATORY)

```json
{
  "compile": "implemented",
  "safeInstall": "implemented",
  "hermesTarget": "implemented",
  "claudeCodeTarget": "implemented",
  "geminiTarget": "implemented",
  "openclawTarget": "implemented",
  "cursorTarget": "planned",
  "conformance": "planned",
  "cogneeIntegration": "not-started",
  "memuAdapter": "not-started",
  "researchPack": "not-started",
  "providerBenchmark": "not-started",
  "cloudSync": "not-started"
}
```

README, SETUP.md, and landing page MUST read from this file. No claiming features that do not exist.

---

## 15. RISKS MITIGATED

| Risk | Mitigation |
|------|------------|
| Scope creep | Lock MVP to static compiler + 4 hosts. Everything else is "planned." |
| Trust destruction | Every public claim maps to a working command. Capability-status.json enforced. |
| Personal data leakage | Neutral templates only. Private `Uchenna-Avatar-OS` stays private. |
| Install friction | Three paths: copy-paste for desktop agents, npm for developers, git for contributors. |
| Hermes dependency | Hermes is primary target format but NOT a dependency. Users without Hermes can use other adapters. |
| Open source abandonment | Clear contribution guide, CI gates, labeled issues, capability transparency. |

---

## 16. THE 7-STEP SEQUENCE AS POST-MVP ROADMAP

| Step | Description | When | Format |
|------|-------------|------|--------|
| 1. Native Control Plane | Schema + compiler + installer | **v1 (Weeks 1-4)** | Shipped |
| 2. Cognee Provider Integration | Hermes memory-provider plugin | v2 | Optional plugin |
| 3. Cross-Agent Conformance | Behavioral test harness | v2 | Optional add-on |
| 4. memU Adapter | Conversation capture as episodes | v2 | Optional plugin |
| 5. Research Pack | Zotero + Semantic Scholar | v3 | Optional module |
| 6. Slim Tools Integration | Tool discovery | v3 | Optional add-on |
| 7. Provider Benchmark | Cognee vs LightRAG vs Honcho | v3 | Optional benchmark |

Each step is **optional, pluggable, and behind a feature flag.** The core compiler never changes.

---

## 17. BOTTOM LINE

**NAAvOS is the open-source compiler for Hermes-compatible avatars.**

The 7-step sequence is the destination. The 4-week static compiler MVP is the vehicle that gets you there without running out of fuel. Ship it. Measure adoption. Then — and only then — invest in Cognee, memU, conformance, and the full platform.

Your local `Uchenna-Avatar-OS` is the reference implementation. NAAvOS is the tool that lets anyone build their own version of what you already have. The architecture documents are excellent. Downscope them from "platform" to "CLI tool that writes files," execute the 4-week plan, and you have a shippable open-source product.

---

## 18. EVIDENCE LABELS

| Label | Applied To |
|-------|-----------|
| **Observed** | File contents, command outputs, package.json scripts |
| **Decision** | ADR-000, ADR-001, 4-week plan, capability gates |
| **Target** | 7-step sequence, Cognee integration, conformance harness |
| **Assumption** | Hermes as primary target format, user preference for desktop agents |
| **Risk** | Scope creep, trust destruction, personal data leakage, install friction |
| **Blocked** | MCP server (pending official SDK), Cognee (pending users) |

---

*Audit complete. Proceed with Phase 0 implementation.*
