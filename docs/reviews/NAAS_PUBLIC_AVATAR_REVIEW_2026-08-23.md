# NAAS Public Avatar Review

**Review date:** 2026-08-23 WAT
**Scope:** `/Users/radossagency/Documents/NAAS`
**Product role:** Public/open-source NAAvOS mirror
**Private authority:** `/Users/radossagency/Documents/Uchenna Innocent - AVATAR/Uchenna-Avatar-OS`
**Universal runtime authority:** `/Users/radossagency` and `~/.shared-ai-skills/`

## Executive verdict

**NO-GO for a public capability release. GO for a controlled rebuild.**

NAAS has a credible product concept, useful schema/compiler beginnings, a polished dashboard prototype, and a good local-first design direction. The current repository does not yet provide the public promise end to end because the workspace test gate, compiler dependency path, CLI runtime, safe installer, behavioural conformance, persistence and standards-compliant MCP service are not all proven.

The most important correction is to preserve the boundary:

```text
Private Avatar OS + shared skills
          ↓ governed source and adapters
NAAS public mirror: neutral product, examples, compiler, conformance
          ↓ optional generated host adapters
Codex / Antigravity / Hermes / other hosts
```

NAAS must never ship Uchenna’s private identity, private projects, private memories, live credentials or personal operating rules as the default public avatar.

## Evidence labels

- **Observed:** directly checked in the current checkout or a live command.
- **Decision:** required product direction from the repository’s development baseline.
- **Target:** designed but not yet proven.
- **Risk:** likely to damage safety, quality, adoption or release confidence.
- **Blocked:** cannot be accepted until the named dependency is resolved.

## Current evidence

| Surface | Result | Meaning |
|---|---|---|
| `node packages/core/test.js` | **PASS** | Core unit fixture runs. |
| `node packages/schema/test.js` | **PASS** | Schema fixture runs directly. |
| `corepack pnpm test` | **FAIL**: Turbo cannot find the pnpm binary | The repository-wide gate is not reproducible in the current shell. |
| Compiler test | **FAIL**: `@naavos/schema/dist/index.js` missing | Workspace package points at an unbuilt distribution. |
| Eval-packs test | **FAIL**: same missing schema distribution | Conformance/eval path cannot start. |
| CLI help/doctor/validate | **FAIL**: same missing schema distribution | The advertised CLI cannot currently boot from the checkout. |
| Schema build | **FAIL**: `tsc: command not found` | The package declares a build but the required tool is absent from the installed dependency state. |
| Dashboard build | **BLOCKED** by `EPERM` opening `apps/dashboard/.next/trace` | Re-run outside the restricted filesystem; this result is not a product-pass claim. |
| MCP server | **NO-GO** | Current Worker code exposes REST-like routes and hard-coded `Demo User`; it does not implement MCP JSON-RPC lifecycle, `tools/list`, `tools/call`, sessions or Streamable HTTP. |
| Capability status | **CONFLICTING** | `docs/contracts/capability-status.json` marks major capabilities completed while development documentation says the repository is no-go. |
| Public dashboard | **PROTOTYPE** | It presents “stable” targets and conformance claims without a verified end-to-end release gate. |
| Git state | **DIRTY** | Existing user changes are present in root/package schema/tooling files; preserve them and use narrow commits. |

## P0 — release blockers

### P0.1 Reproducible toolchain

**Finding:** The root declares pnpm 9.15.9 and Turbo, but the current shell has no `pnpm` binary on PATH. Corepack can invoke pnpm, while Turbo cannot resolve the package-manager binary. The schema package also points to `dist/index.js` without a working TypeScript compiler/build artifact.

**Required fix:**

1. Pin one supported runtime, preferably Node 22 LTS for the public baseline.
2. Make the package-manager shim available in CI and local development, or remove the Turbo dependency from the first local slice.
3. Choose one source strategy: plain ESM JavaScript, or TypeScript compiled before dependants. Do not publish a package whose `main` points to absent `dist/` output.
4. Add a clean-clone CI job that performs install, build, test, typecheck and CLI smoke tests.
5. Add a repository preflight that prints Node, pnpm, Turbo and package graph versions before tests.

**Acceptance:** A fresh clone runs the complete root test command without relying on pre-existing `node_modules` or a developer-specific PATH.

### P0.2 Real local vertical slice

Implement and prove this path before adding cloud features:

```text
avatar source
  → schema validation
  → policy/precedence resolution
  → deterministic IR
  → target compile
  → preview/diff
  → managed-block install
  → backup/journal
  → reload verification
  → rollback verification
  → behavioural conformance report
```

The current CLI contains real schema/compile beginnings but its install and rollback support is incomplete and target-specific. A green message is not evidence until the destination is reread after mutation and after restart.

### P0.3 Standards-compliant MCP

Replace the current `apps/mcp-server/src/index.js` REST-like Worker handler with a real MCP implementation. The minimum contract is:

- `initialize`
- negotiated protocol version
- `tools/list`
- `tools/call`
- structured errors
- request correlation
- transport framing for the selected transport
- authentication and audience validation for remote HTTP
- origin/CORS restrictions
- scoped user/project access
- durable persistence or an explicit local-only boundary

The first public implementation should be **STDIO-first and local-only**. Add remote Streamable HTTP only after local protocol conformance and authentication tests pass.

### P0.4 Neutral public defaults

`docs/PRODUCT_UNDERSTANDING.md`, the current generated profile examples and some copy still describe Uchenna-specific rules or personal traits. The public default must be synthetic and neutral:

- no real name, role, MBTI, neurotype or private operating rules;
- no private projects, memories, provider tokens or personal URLs;
- examples must use `Example User` or a clearly synthetic fixture;
- personalization is opt-in and imported by the user;
- sensitive fields are optional, private by default and never required to use the product.

### P0.5 Truthful capability contract

Reconcile `docs/contracts/capability-status.json`, README, dashboard copy and development documentation. Every capability needs:

```json
{
  "status": "observed|partial|target|blocked|not-started",
  "verified_at": "ISO-8601",
  "verification_command": "...",
  "evidence": "path or artifact reference",
  "known_limits": ["..."]
}
```

Do not display “stable”, “completed”, “every AI”, “safe install”, “conformance” or “MCP server” as public facts until the corresponding gate passes.

## P1 — productisation priorities

### P1.1 Personalisation without identity capture

Offer four onboarding paths:

1. **Quick start:** name/display label, communication preferences, one rule, one target.
2. **Guided:** work style, accessibility, tools, privacy, project boundaries and approval rules.
3. **Import:** existing JSON/Markdown/config sources with a review diff and provenance.
4. **Advanced:** schema editor, modes, routes, memory policy, retention, redaction and adapter capabilities.

Every field should show `public`, `private`, `project`, `session`, or `derived`. Psychological labels must be optional and explainable, never used as authoritative truth.

### P1.2 User agency and memory

Build a local canonical ledger before optional providers:

- assertion ID, content, source, provenance, confidence, scope, created/updated/expiry;
- proposed vs accepted vs rejected vs corrected vs revoked;
- “Why was this remembered?” explanation;
- export, delete, revoke and retention controls;
- project boundary enforcement;
- derived indexes treated as rebuildable projections.

No third-party memory engine may become the source of identity, consent, policy or approved truth.

### P1.3 Certified adapters

Start with three adapters and certify them properly:

- Codex;
- Antigravity/Gemini-family native config;
- Hermes Avatar profile.

Each adapter must declare supported fields, unsupported-field policy, destination path, managed block format, backup behavior, reload check and conformance scenarios. Do not advertise six stable targets until each has the same evidence package.

### P1.4 Accessible, understandable dashboard

The dashboard must expose:

- source package status;
- exact generated diff;
- target capability matrix;
- install/rollback history;
- provenance and privacy state;
- proposed knowledge review;
- clear error recovery;
- keyboard navigation, focus visibility, semantic headings, labels, reduced motion and mobile layout.

The user should always know whether a state is local, generated, connected, authenticated, or merely planned.

## P2 — optional scale

- encrypted multi-device sync;
- team policies and scoped sharing;
- optional Cognee/memU/LightRAG projections;
- remote MCP with OAuth/PKCE and token-audience validation;
- adapter/plugin registry and certification;
- hosted dashboard and billing.

These are not prerequisites for a trustworthy local Avatar OS and must not delay the local vertical slice.

## Public open-source product contract

NAAS should promise this:

> Define an inspectable avatar package locally, compile only the approved context for a supported host, preview the exact change, install reversibly, verify persistence and measure behavioural conformance.

It should not promise:

- perfect personality replication;
- automatic truth about the user;
- universal support without adapter certification;
- cloud memory by default;
- silent synchronization of private context;
- authenticated MCP access without an explicit credential flow.

## Fix sequence

1. Freeze public “stable/completed” claims and label the site prototype.
2. Repair clean install and workspace build determinism.
3. Make schema/compiler/CLI boot from a clean checkout.
4. Implement local safe install, diff, backup, reload and rollback.
5. Replace REST-like MCP with STDIO JSON-RPC and conformance fixtures.
6. Neutralize all public defaults and add import/review consent flow.
7. Add the QA runbook as CI gates.
8. Certify Codex, Antigravity and Hermes behaviorally.
9. Only then add optional memory providers or remote HTTP.

## Release decision

**Current:** NO-GO.
**Next milestone:** local-first public alpha after P0.1–P0.5 pass.
**Evidence required for GO:** clean clone, full tests, real CLI mutation/reload/rollback, MCP lifecycle test, neutral fixture scan, privacy/security scan, responsive/accessibility checks and named human acceptance.
