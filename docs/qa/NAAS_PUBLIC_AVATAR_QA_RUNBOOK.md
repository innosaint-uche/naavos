# NAAS Public Avatar QA Runbook

**Purpose:** Evidence gates for an open-source, user-personalisable Avatar OS. **Rule:** A command that exits
successfully is not enough; reread state, restart the relevant process and verify semantics.

## 0. Clean-room preflight

```bash
node --version
corepack pnpm --version
git status --short
corepack pnpm install --frozen-lockfile
```

**Pass:** supported Node version, pinned pnpm, clean dependency install and no undeclared package-manager dependency.
**Fail:** missing binary, lock mismatch, install relying on an existing `node_modules`, or unrelated dirty files
overwritten.

## 1. Repository gates

```bash
corepack pnpm build
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm test
corepack pnpm format:check
```

Record each command, exit code, duration and artifact path. Turbo must run all declared workspaces; no package may
advertise a placeholder test or lint script as a release gate.

## 2. Schema and neutral fixture gates

```bash
node packages/core/test.js
node packages/schema/test.js
```

Add fixtures for:

- minimum valid user package;
- imported package with unknown fields;
- invalid UUID/date/priority/consent;
- optional psychological fields omitted;
- public profile with no private fields;
- project-scoped rules;
- conflicting rules and deterministic precedence;
- redaction and retention policies.

**Pass:** synthetic fixture contains no Uchenna name, private project, real URL, token, personal rule or private memory.

## 3. Compiler determinism

```bash
node packages/cli/bin/naavos.js validate
node packages/cli/bin/naavos.js compile --target hermes --dry-run
node packages/cli/bin/naavos.js compile --target claude-code --dry-run
node packages/cli/bin/naavos.js compile --target gemini --dry-run
```

Compile the same source twice and compare hashes. The output must be deterministic, target-scoped and free of
credentials. Unsupported fields must produce explicit warnings or fail according to adapter policy.

## 4. Safe install and rollback

For every certified target:

1. Capture a hash of the destination.
2. Run preview/diff.
3. Install into a managed block.
4. Reread and hash the destination.
5. Restart the host or reload its config.
6. Run a behavioral probe.
7. Roll back.
8. Reread and confirm the original hash.

Required failure tests:

- destination does not exist;
- destination has unrelated user edits;
- interrupted write;
- invalid generated output;
- permission denied;
- second install is idempotent;
- rollback journal is missing or corrupt.

## 5. MCP protocol gates

The local server must pass, in order:

```text
initialize
notifications/initialized
tools/list
tools/call (read-only context query)
invalid method → structured JSON-RPC error
unknown tool → structured JSON-RPC error
```

For remote HTTP, additionally test:

- origin allowlist;
- unauthenticated request rejection;
- OAuth discovery and PKCE;
- token audience and expiry;
- per-user and per-project authorization;
- no cross-user data read/write;
- request size, rate and timeout limits;
- no secret values in logs.

The current Worker REST routes are not an acceptable substitute for this gate.

## 6. Persistence and restart gates

```text
create avatar → process exit → restart → load avatar
accept memory → restart → retrieve with provenance
delete memory → restart → confirm absent from canonical store and indexes
export → import into a clean directory → compare canonical hash
```

Every mutation must report a stable ID, revision, timestamp, actor/scope and reversible action.

## 7. Personalisation and privacy gates

Test each onboarding path:

- quick start;
- guided setup;
- import with review;
- advanced schema editing.

Confirm that users can:

- omit sensitive identity fields;
- scope rules to session/project/global;
- set retention and consent separately;
- inspect provenance;
- correct or revoke assertions;
- export and delete all canonical data;
- use the product locally without an account.

Run secret scanning and inspect generated artifacts, logs, backups and screenshots.

## 8. Dashboard and UX gates

At 375px, 768px and desktop widths verify:

- no horizontal overflow;
- keyboard-only operation;
- visible focus states;
- screen-reader names for controls;
- reduced-motion behavior;
- error and empty states;
- exact source/target/diff status;
- no “stable/completed” label for an unverified capability;
- links resolve to the canonical repository and documentation.

## 9. Release gates

Release only when all are true:

- clean clone passes the full suite;
- all public claims map to current evidence;
- at least three adapters pass mutation/reload/rollback/conformance;
- MCP lifecycle and security gates pass;
- neutral fixture scan passes;
- export/delete/recovery tests pass;
- named human acceptance is recorded;
- release artifact, commit SHA and rollback point are recorded.

## Historical run record — 2026-08-23 (superseded)

The following record is retained as incident history. It is not the current
implementation status.

| Check                          | Result                                                  |
| ------------------------------ | ------------------------------------------------------- |
| Core direct test               | PASS                                                    |
| Schema direct test             | PASS                                                    |
| Root Turbo test                | FAIL: Turbo cannot resolve pnpm binary                  |
| Schema build                   | FAIL: `tsc` missing                                     |
| Compiler/eval/CLI direct tests | FAIL: schema `dist/index.js` missing                    |
| Dashboard build                | BLOCKED: filesystem `EPERM` on `.next/trace`            |
| MCP lifecycle                  | NOT PASS: current server is REST-like, not MCP JSON-RPC |
| Safe install/reload/rollback   | NOT PROVEN                                              |
| Behavioral conformance         | NOT PROVEN                                              |
| Public release                 | NO-GO                                                   |

## Current run record — 2026-08-26

The current implementation was rechecked after the public-source, evidence,
and central local-agent QA updates:

| Check | Result |
| --- | --- |
| Universal direct tests | PASS: 31/31 |
| Dependency audit | PASS: 0 high-severity vulnerabilities |
| Public package preflight | PASS: 95 files scanned |
| npm pack dry run | PASS: package contents reviewed |
| Local Codex/Antigravity/Hermes adapter QA | PASS; two credential warnings recorded by field name only |
| NAAS live browser/HTTP/MCP smoke | PASS |
| Packaged Tauri macOS QA | PASS: isolated setup, persistence, privacy, backup and lifecycle |
| NAAS CI | PASS: typecheck, tests, lint, build and secret scan |
| Public source repositories | PASS: public repositories and clean source tags |
| Customer/public production gate | BLOCKED: external tenant, host-account, credential and distribution evidence |

Evidence is stored in the central run directory:
`/Users/radossagency/.radoss-qa/artifacts/run-2026-08-26T00-34-56-912Z/`.
