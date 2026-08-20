# NAAvOS: Neuro AI - Avatar OS System

> **Give Every AI Your Brain.**

NAAvOS is an open-source **compiler and conformance platform** that makes AI agents instantly and reliably understand your cognitive profile, working style, and project history.

## What It Does

- **Compile Your Persona:** Define your identity, rules, and knowledge sources in a single, versioned `Avatar-Source-Package`.
- **Safe Installation:** The NAAvOS compiler translates your package into verified, host-specific instructions for every AI tool (Claude, Gemini, Cursor, Hermes, etc.).
- **Prove It Works:** A conformance harness runs tests to ensure agents actually adhere to your rules, providing a "fidelity score" for each tool.

## Quick Start

```bash
# Install dependencies
pnpm install

# Initialize your avatar
pnpm exec naavos init

# Validate your avatar
pnpm exec naavos validate

# Compile for a target host
pnpm exec naavos compile --target hermes

# Run conformance tests
pnpm exec naavos test

# Check system health
pnpm exec naavos doctor
```

## Supported Targets

| Target | Output | Install Method |
|--------|--------|----------------|
| Hermes | `SOUL.md`, `SKILL.md`, `sub-agents/*.md`, `memories/**/*.md` | `naavos install --target hermes` or `.tar.gz` bundle |
| Claude Code | `CLAUDE.md` | Copy to project root |
| Gemini | `GEMINI.md` | Copy to project root |
| Cursor | `.cursorrules` | Copy to project root or `~/.cursorrules` |
| OpenClaw | `AGENTS.md` | Copy to project root |
| ReMe | `.remerc`, `skills/reme_memory/SKILL.md`, `CLAUDE-reme.md` | `naavos install --target reme` |

## What's Included

| Package | Description |
|---------|-------------|
| `@naavos/core` | Avatar schema + validation (compatibility shim) |
| `@naavos/schema` | Zod-based avatar package schema |
| `@naavos/compiler` | Host-specific compiler + adapters |
| `@naavos/eval-packs` | Conformance runner + scenario packs |
| `@naavos/cli` | Command-line interface |
| `@naavos/kb-starter` | Starter knowledge base template |
| `@naavos/mcp-server` | Cloudflare Workers MCP endpoint |

## How It Works

```
┌─────────────────────────────────────────────────────────┐
│                    NAAvOS System                       │
│                                                          │
│   Your Avatar ──► Schema Validation                     │
│        │                 │                               │
│        ▼                 ▼                               │
│   avatar.json     Zod Checks                            │
│        │                 │                               │
│        ▼                 ▼                               │
│   ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐          │
│   │ H   │  │ C   │  │ G   │  │ Cu  │  │ O   │   ...    │
│   │ erm │  │ lau │  │ em  │  │ rs  │  │ pe  │          │
│   │ es  │  │ de  │  │ ini │  │ or  │  │ nc  │          │
│   └─────┘  └─────┘  └─────┘  └─────┘  └─────┘          │
│   AI Agent → Loads compiled output → Knows You          │
└─────────────────────────────────────────────────────────┘
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `naavos init` | Initialize your avatar with an interactive wizard |
| `naavos validate` | Validate your avatar against the Zod schema |
| `naavos compile` | Compile avatar for a target runtime |
| `naavos compile --target <id>` | Compile for a specific target (hermes, claude-code, gemini, cursor, openclaw) |
| `naavos compile --dry-run` | Print compiled output without writing files |
| `naavos compile --format tar.gz` | Export as Hermes profile bundle (`.tar.gz`) |
| `naavos install` | Install compiled avatar into target host |
| `naavos install --dry-run` | Show what would be installed |
| `naavos install --target hermes` | Install with automatic backup |
| `naavos install --target reme` | Install ReMe memory config and Hermes skill |
| `naavos export` | Export compiled avatar as a Hermes profile bundle |
| `naavos test` | Run conformance eval packs against your avatar |
| `naavos test --pack <id>` | Run a specific eval pack |
| `naavos test --json` | Output results as JSON |
| `naavos doctor` | Run health check on your avatar and environment |
| `naavos backups` | List available backups |
| `naavos rollback` | Rollback to most recent backup |
| `naavos rollback --id <backupId>` | Rollback to a specific backup |

## Documentation

- [Setup Guide](docs/SETUP.md)
- [API Reference](docs/API.md)
- [Integration Templates](docs/TEMPLATES/)
- [Capability Status](docs/contracts/capability-status.json)

## Contributing

Contributions welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

## License

MIT — Use it. Fork it. Make it yours.

---

**Built with 70% faster execution. Zero fluff.**