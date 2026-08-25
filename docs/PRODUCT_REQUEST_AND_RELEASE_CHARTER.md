# NAAvOS Product Request and Release Charter

**Owner:** Uchenna Innocent / Radoss Agency  
**Applies to:** NAAvOS, its public source and hosted services, the universal Avatar setup layer, and every local
development agent or IDE that touches the system.

## The requested end state

NAAvOS is a universal, user-owned AI Personality and Avatar system. A person must be able to create an Avatar, control
its identity, preferences, rules, knowledge and memory, and use that Avatar consistently across supported AI agents,
IDEs, CLIs, online chats and MCP hosts.

The primary user is nontechnical. The product must therefore provide a no-code desktop path with clear screens, browser
OAuth, account consent and automatic configuration. A user must never need to copy an OAuth code, token, JSON file or
shell command merely to connect an account.

## Required product surfaces

| Surface               | Required behavior                                                                                                                         |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| No-code desktop       | Tauri installer, guided setup, privacy choice, browser OAuth, account connection, retry, rollback, disconnect, health and security status |
| Universal CLI         | Permanent agent-neutral npm/CLI path for developers and scripted environments                                                             |
| Hermes                | Visible setup/orchestration agent; it coordinates relevant steps but does not replace the canonical Avatar authority                      |
| Local memory          | User-owned SQLite + FTS5 canonical ledger, approval-gated capture, search, backup, restore and deletion                                   |
| Hosted authority      | Branded HTTPS MCP gateway with OAuth, tenant-owner enforcement and exact deployment identity                                              |
| Agent integrations    | Thin, independently verified adapters for Codex, Antigravity, Hermes, ChatGPT, Claude and later hosts                                     |
| Open source           | Verified public source, license, contribution/security guidance, reproducible checks and truthful capability status                       |
| Optional integrations | ReMe, Supabase and other providers remain explicit opt-ins; Ollama is not part of the public default path                                 |

## What “ready” means

There are two separate release claims:

1. **Source-public development release:** safe public source, reproducible local setup, truthful docs, secret scan,
   contributor path and central QA.
2. **Customer/public production release:** the source-public requirements plus hosted OAuth, two independent live-user
   tenant isolation, named ChatGPT and Claude acceptance, persistence/deletion/rollback evidence, production signing and
   notarisation, advertised-platform artifacts, credential remediation, clean release tag and exact source/deployment
   evidence.

Passing local tests does not prove the second claim.

## Universal development and QA rule

Every project and every agent/IDE must use the central [`~/.radoss-qa`](/Users/radossagency/.radoss-qa) harness. The
project supplies only a thin adapter outside its repository. The adapter must cover the real user journey and its
project contract; a generic homepage smoke test is not a release certification.

The shared process is:

1. source, dependency, lint, typecheck, unit and build checks;
2. Playwright browser journey against the real surface;
3. OAuth, MCP lifecycle, authentication boundary and hostile-input checks;
4. mutation, reload, persistence, deletion, rollback and tenant-isolation checks where applicable;
5. package, process, IPC, filesystem and signing checks for desktop products;
6. hosted deployment, named-host acceptance and human approval evidence;
7. a fail-closed release gate with facts separated from recommendations.

Rust is an optional central Tauri/artifact adapter. It must not be added to web-only projects or copied into every
repository.

## Non-negotiable delivery rules

- Never call a local prototype a customer-ready product.
- Never infer ChatGPT, Claude or any host connection from local configuration.
- Never invent a route, API host, deployment, account, credential, approval or test result.
- Never use an unresolved or retired domain as a source or API authority.
- Never publish secrets, copied bearer tokens, OAuth codes or personal Avatar data.
- Never mark the project complete while an explicit requirement lacks direct, current evidence.
- When blocked by external authority, implement the safest executable path, record the exact missing evidence and keep
  the release gate blocked.

## Authority and routing

- Public dashboard: `https://naavos.radoss.agency`
- Canonical user-facing MCP: `https://mcp.naavos.radoss.agency/mcp`
- Retired/unresolved host: `https://api.naavos.io/mcp/v1` — never configure
- Public source: `https://github.com/innosaint-uche/naavos`

The page-18 Evidence Standard in
[`NAAS-Avatar-OS-Productisation-System-Design.pdf`](design/NAAS-Avatar-OS-Productisation-System-Design.pdf#page=18) is
authoritative for evidence separation, adapter re-verification and fail-closed claims.
