# NAAvOS engineering contract

NAAvOS is the product and source authority. `radoss-universal-avatar` supplies the local desktop/runtime layer. Keep the
existing Next.js, compiler, CLI, SQLite and Worker boundaries unless a measured requirement justifies a migration.

- Read `docs/PRODUCT_REQUEST_AND_RELEASE_CHARTER.md` and `docs/CTO_AUDIT_2026-10-26.md` before changing release claims.
- User-owned identity and memory stay private. Never commit personal profiles, credentials, OAuth tokens or captured
  memory. Test with synthetic data and isolated homes.
- The local ledger is SQLite. `avatar.json` is an export consumed by the compiler. Optional ReMe output is a replaceable
  projection.
- Preserve adjacent user edits. Preview, preflight, back up and provide rollback before changing host files. Dry runs
  must perform no writes.
- Run install, build, tests, lint, typecheck, public-claim and CLI checks after relevant changes. Run `verify:release`
  only with real, current release evidence. A historical manifest is not certification.
- Treat the founder's external `system_prompts/CTO_GUARDRAILS.md` and `system_prompts/AGENT_ROUTING.md` as companion
  references when actually supplied. They are not present in this repository; do not invent their contents or
  credentials.
- The central `~/.radoss-qa` harness remains the production certification authority when available. Repository tests
  provide regression evidence and do not substitute for signed desktop, live OAuth, two-user isolation or named-host
  acceptance.
