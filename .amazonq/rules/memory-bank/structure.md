# NAAvOS — Project Structure

## Monorepo Layout

```
NAAS/
├── apps/
│   ├── dashboard/          # Next.js web dashboard (TypeScript, Tailwind)
│   └── mcp-server/         # Cloudflare Workers MCP endpoint (JavaScript)
├── packages/
│   ├── schema/             # Zod-based AvatarPackageSchema (@naavos/schema)
│   ├── compiler/           # Host-specific compiler + adapters (@naavos/compiler)
│   ├── cli/                # Commander.js CLI (@naavos/cli)
│   ├── core/               # Compatibility shim + validation (@naavos/core)
│   ├── eval-packs/         # Conformance runner + scenario packs (@naavos/eval-packs)
│   └── kb-starter/         # Starter knowledge base template (@naavos/kb-starter)
├── docs/
│   ├── contracts/          # capability-status.json
│   ├── design/             # System design documents (.pdf, .docx)
│   ├── TEMPLATES/          # Output templates (.cursorrules, CLAUDE.md, GEMINI.md, AGENT.md)
│   ├── avatar.ts           # TypeScript avatar type definitions
│   ├── knowledge_sources.ts # Knowledge source type definitions
│   └── API.md, SETUP.md, etc.
├── examples/               # Setup examples per target (claude-code, cursor, gemini, mavis)
├── skills/
│   └── reme_memory/SKILL.md  # ReMe memory skill for Hermes
├── public/                 # Static assets
├── package.json            # Root workspace config (pnpm, turbo)
├── pnpm-workspace.yaml     # Workspace package globs
└── turbo.json              # Turborepo pipeline config
```

## Core Packages & Relationships

```
avatar.json (user data)
     │
     ▼
@naavos/schema          ← Zod validation of AvatarPackageSchema
     │
     ▼
@naavos/compiler        ← compile(packageData, target) → Map<filePath, content>
     │
     ├── adapters/hermes.js       → SOUL.md, SKILL.md, sub-agents/*.md, memories/**/*.md
     ├── adapters/claude-code.js  → CLAUDE.md
     ├── adapters/gemini.js       → GEMINI.md
     ├── adapters/cursor.js       → .cursorrules
     ├── adapters/openclaw.js     → AGENTS.md
     └── adapters/reme.js         → .remerc, skills/reme_memory/SKILL.md, CLAUDE-reme.md
     │
     ▼
@naavos/cli             ← Commander.js CLI wrapping schema + compiler + eval-packs
     │
     ▼
@naavos/eval-packs      ← runEval(packId, avatarData) → fidelity score
```

## Key Architectural Patterns

- **Adapter Pattern** — Each AI host has its own adapter module in `packages/compiler/src/adapters/`. All adapters receive the validated `AvatarPackageSchema` object and return a `Map<string, string>` of `filePath → fileContent`.
- **Schema-First** — All avatar data is validated through Zod before any compilation or installation step.
- **Monorepo with Turborepo** — Build pipeline respects `^build` dependency ordering. Packages build before apps.
- **ESM throughout** — All packages use ES module syntax (`import`/`export`), no CommonJS.
- **Avatar stored at `~/.naavos/avatar.json`** — CLI reads/writes from the user's home directory.
- **Compiled output at `~/.naavos/compiled/<target>/`** — Intermediate compiled files before install.
- **Backup journal at `~/.naavos/backups/journal.json`** — Tracks all backup entries with metadata.

## Compiler Adapter Interface

Every adapter follows this contract:

```js
export function <target>Adapter(pkg) {
  // pkg is the validated AvatarPackageSchema object
  const files = new Map();
  files.set('OUTPUT_FILE.md', generateContent(pkg));
  return files; // Map<string, string>
}
```

## Eval Pack Structure

```
packages/eval-packs/packs/
├── eval-pack-core-v1/      # Core conformance scenarios
└── eval-pack-safety-v1/    # Safety-focused scenarios
```

Each pack is run via `runEval(packId, avatarData)` which returns `{ packName, passed, total, score, results[] }`.
