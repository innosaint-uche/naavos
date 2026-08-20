# NAAvOS — Product Overview

## Purpose & Value Proposition

NAAvOS (Neuro AI - Avatar OS) is an open-source **compiler and conformance platform** that makes AI agents reliably understand a user's cognitive profile, working style, and project history. The tagline is: **"Give Every AI Your Brain."**

The core problem it solves: users must repeatedly re-explain their preferences, rules, and context to every AI tool they use. NAAvOS compiles a single versioned `Avatar-Source-Package` into host-specific instruction files for each AI runtime.

## Key Features

- **Avatar Compilation** — Translates a single `avatar.json` into verified, host-specific instruction files (SOUL.md, CLAUDE.md, .cursorrules, etc.)
- **Multi-Target Support** — Hermes, Claude Code, Gemini, Cursor, OpenClaw, ReMe
- **Conformance Testing** — Eval packs run tests to verify AI agents actually adhere to user rules; produces a "fidelity score"
- **Schema Validation** — Zod-based schema enforces structure and types on the avatar package
- **Backup & Rollback** — Automatic backup before install; rollback to any prior state
- **Tar.gz Export** — Bundle Hermes profiles for portable distribution
- **Interactive Init** — `naavos init` wizard scaffolds a valid avatar from prompts

## Target Users

- Power users who work across multiple AI tools and want consistent behavior
- Developers building AI-assisted workflows who need reproducible agent personas
- Teams standardizing AI interaction rules across members

## Use Cases

- Compile once, deploy to all AI tools (Claude, Gemini, Cursor, Hermes)
- Enforce operating rules (e.g., "no false completion claims", "cite evidence first")
- Define communication style (tone, verbosity, prohibited phrases)
- Manage privacy consents and data residency preferences per AI host
- Run conformance tests to verify AI tools respect your rules (fidelity scoring)
- Export portable Hermes profile bundles (.tar.gz) for sharing or backup

## CLI Commands

| Command | Description |
|---|---|
| `naavos init` | Interactive wizard to create avatar.json |
| `naavos validate` | Validate avatar against Zod schema |
| `naavos compile --target <id>` | Compile avatar for a specific AI host |
| `naavos compile --dry-run` | Preview output without writing files |
| `naavos compile --format tar.gz` | Export Hermes bundle |
| `naavos install --target <id>` | Install compiled files into AI host |
| `naavos export` | Export as Hermes .tar.gz profile bundle |
| `naavos test` | Run conformance eval packs |
| `naavos doctor` | Health check on avatar and environment |
| `naavos backups` | List available backups |
| `naavos rollback --id <id>` | Restore a previous installation |
