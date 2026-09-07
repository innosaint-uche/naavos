# NAAvOS deployment evidence

Updated: 2026-09-08 (Africa/Lagos)

The productisation design's page-18 **Evidence Standard** is enforced by the Universal release gate. Facts and
recommendations are recorded separately; host-specific claims remain adapter-owned and must be reverified against the
relevant official documentation whenever a host/provider version changes. The machine-readable record is
`/Users/radossagency/Documents/NAAS/docs/qa/RELEASE_EVIDENCE_CURRENT.json`.

## Verified

- Public dashboard: `https://naavos.radoss.agency` — HTTP 200, Next.js response, valid TLS certificate, and the
  corrected open-source release copy is live.
- Dashboard content identity: the live `/release.json` marker is the content-derived source marker
  `fa2b4c2160292bb712501497c59e62da562ee6ce9cbd6999a8b02de3d432d837` (SHA-256), matching the reviewed source inputs. This was
  verified by `pnpm verify:live-marker` after the standalone Docker image and live deployment were checked.
- Coolify deployment ID for this marker: not independently verified. The public marker proves the served content
  matches the reviewed source inputs; it does not prove the platform's internal deployment identifier.
- Last independently verified dashboard deployment: source commit `97d9950b8d27cf041862de9089d0fbf2633984ef`, Coolify
  deployment `kw8a7b2bvtzemlqo8vf19eki`, running container image
  `a1rpkpmda1lhxn2kyxvvnmpm:97d9950b8d27cf041862de9089d0fbf2633984ef` (application `4`, `naavos-dashboard`).
- Deployment automation: GitHub hook `675916315` targets Coolify's verified manual route
  `https://radoss.cloud/webhooks/source/github/events/manual` for `push` events. A correctly HMAC-signed push payload was
  accepted with HTTP 200 and queued deployment `d5b8vqbh9br09t4qq9tn8nam`, which finished with the exact `518783b977857534ab9b1937eff8dd1fa7267e1a`
  commit running in the dashboard container.
- Hosted MCP Worker: `https://naavos-mcp.innosaint-uche.workers.dev/mcp`.
- Worker deployment version: `d683a9ac-bafb-454c-86eb-a81a94d19b29` (latest verified deployment; tenant-owner
  enforcement and branded OAuth metadata).
- Deployment identity: `d683a9ac-bafb-454c-86eb-a81a94d19b29` (recorded separately from the source marker so a source
  hash cannot be mistaken for deployment proof).
- Source release marker: `e79819d414731cda4d6cc25726842c94621e059c37ee523191bd5e7b68ec84aa` (SHA-256 of the reviewed
  Worker source; branded OAuth metadata support).
- Authenticated Worker health was recorded as `protocol=streamable-http`, `auth=huggingface-oauth`,
  `persistence=d1-configured`. The current unauthenticated route probe returns HTTP 405 for GET (POST-only) and HTTP 401
  with a bearer challenge for MCP initialize POST; neither response is treated as account or tenant proof.
- OAuth resource and authorization-server discovery: HTTP 200.
- OAuth discovery advertises S256 PKCE and the Hugging Face public-client registration endpoint for no-code browser
  connection.
- Unauthenticated MCP request: HTTP 401 with a bearer resource-metadata challenge.
- D1 database: `naavos-avatar` (`7b3c23b3-0c74-4eed-a541-519589ae4eef`), migration `0001_initial.sql` applied;
  `avatars`, `memory_items`, and `mcp_sessions` exist.
- Local MCP fixture: initialize, initialized notification, tools/list, tools/call, structured errors, origin rejection,
  and session enforcement pass.
- Authenticated MCP conformance: PASS — initialize, initialized notification, tools/list, avatar_get, invalid-method
  handling, and strict Origin rejection.
- Authenticated end-to-end QA: PASS — first-use tenant-scoped Avatar provisioning, avatar_get, idempotent confirmed
  avatar_update, memory search, missing-confirmation rejection, and unauthenticated 401.
- Tenant-isolation fixture: PASS — two independently signed tenants receive separate sessions, Avatar owners, updates,
  and memory-search results; a session from tenant A is rejected when presented with tenant B's token.
- Full working-tree secret scan: PASS — `gitleaks dir` found no leaks.
- Central packaged no-code QA: PASS — the real Tauri macOS bundle launched with isolated temporary state; Playwright
  verified the setup UI, privacy mutation/readback, backup action, hostile-origin rejection, privacy pause/retry block,
  rollback readback, user-owned hosting selection, and clean sidecar lifecycle. Evidence:
  `/Users/radossagency/.radoss-qa/artifacts/naavos-claims-2026-09-08/universal-tauri-macos/evidence.json`.
- Central all-adapter QA: PASS — `local-agents`, `naas-public` and `universal-tauri-macos` all passed in the same run;
  aggregate evidence is under `/Users/radossagency/.radoss-qa/artifacts/naavos-release-identity-2026-09-08/`.
- Central local-agent QA: PASS — Codex, Antigravity and Hermes adapter markers were present; `radoss doctor` confirmed
  local MCP health and Hermes OAuth state. Evidence is under
  `/Users/radossagency/.radoss-qa/artifacts/naavos-release-identity-2026-09-08/local-agents/`.
- Public source repository: verified public at `https://github.com/innosaint-uche/naavos`.
- Universal Avatar source repository: verified public at `https://github.com/innosaint-uche/radoss-universal-avatar`.
- Clean source baselines: `naavos` tag `v0.1.0-public-source`; Universal Avatar tag `v0.2.0-public-source`.
- Release evidence identity: the current live content marker and clean public source tags are reconciled in the
  machine-readable manifest. The internal Coolify deployment ID remains a separate unverified field; none of these
  substitutes for tenant, host-account, credential, or signed-distribution evidence.
- Canonical local registry: the verified hosted gateway is registered as `naavos_gateway` with no
  Codex/Antigravity/Hermes targets; local agents remain on the guarded `radoss_avatar` stdio control plane.
- NAAS monorepo: test, typecheck, lint, and build pass.
- Current central QA run: `naavos-release-identity-2026-09-08` passed the local-agent, public-route, and packaged macOS
  Tauri adapters; the Tauri journey additionally verified hostile-origin rejection, privacy pause/retry blocking,
  rollback readback, and user-owned hosting selection. CLI contract, formatting, and secret scan also passed. Evidence
  is under `/Users/radossagency/.radoss-qa/artifacts/naavos-release-identity-2026-09-08/`. The NAAvOS CLI rollback
  regression now snapshots pre-install target files, supports ReMe's project and Hermes roots, and removes only
  newly-created managed files on restore; its regression and process-level tests pass.

## Not yet verified

- Browser PKCE approval was not the final verification path; Hermes' existing Hugging Face OAuth credential was verified
  in-memory against the deployed Worker, and the token was never printed or exported.
- Branded route: `mcp.naavos.radoss.agency` now resolves through the authoritative Hostinger DNS zone to the existing
  Coolify VPS; Traefik issues HTTPS and a thin Caddy proxy forwards to the canonical Worker. HTTP redirect, HTTPS
  health, OAuth protected-resource metadata, CIMD, and the expected unauthenticated MCP bearer challenge were observed.
  The authenticated protocol and two-live-user isolation checks remain separate gates.
- The DNS zone's existing website, mail, DKIM, SPF, and DMARC records were preserved; no broad reset was used.
- ChatGPT/Claude named-host acceptance.
- Production signing/notarization evidence for the Tauri distribution.
- Two independent live production users have not yet been used for the tenant-isolation acceptance; the fixture is not a
  substitute for that live evidence.
- The personal Antigravity configuration contains pre-existing embedded credential fields; values were not read,
  printed, copied, or modified. This is a personal-environment warning, not distribution evidence, and the isolated
  sample does not use those paths. A distribution security review must still prove that the source and artifacts contain
  no credentials before release.

## Do not use

- `https://api.naavos.io/mcp/v1` — unresolved and retired.
- `X-NAAVOS-User-ID` — not an authorization mechanism.

The release remains **NO-GO for public ChatGPT/Claude distribution** until the remaining items are evidenced. The Worker
URL is a real deployed test surface, not a claim that the branded public release is complete.
