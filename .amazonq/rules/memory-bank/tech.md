# NAAvOS — Technology Stack

## Runtime Requirements

- Node.js >= 22.0.0
- pnpm >= 9.0.0 (packageManager: pnpm@9.15.9)

## Build System

- **Turborepo** (`turbo@^2.0.0`) — monorepo task orchestration with caching
  - `build` depends on `^build` (upstream packages build first)
  - `typecheck` and `test` depend on `^build`
  - `dev` is persistent, cache disabled
- **pnpm workspaces** — `apps/*` and `packages/*`

## Module System

All packages use **ES Modules** (`"type": "module"`) with `import`/`export` syntax throughout. No CommonJS.

## Languages

| Area | Language |
|---|---|
| Core packages (schema, compiler, cli, eval-packs, core, kb-starter) | JavaScript (ESM) |
| Dashboard app | TypeScript + React (TSX) |
| MCP server | JavaScript (ESM) |
| Docs type definitions | TypeScript (.ts) |

## Package Dependencies

### @naavos/schema
- `zod` — schema definition and runtime validation

### @naavos/compiler
- `@naavos/schema` (workspace)

### @naavos/cli
- `@naavos/schema` (workspace)
- `@naavos/compiler` (workspace)
- `@naavos/eval-packs` (workspace)
- `commander@^11.1.0` — CLI argument parsing
- `chalk@^5.3.0` — terminal color output
- `ora@^7.0.1` — terminal spinners
- `inquirer@^9.2.12` — interactive prompts

### naavos-dashboard (Next.js app)
- `next@^14.2.0`, `react@^18`, `react-dom@^18`
- `tailwindcss@^3.4.1`, `autoprefixer`, `postcss`
- `@mui/material@^9.0.1`, `@emotion/react`, `@emotion/styled`
- `framer-motion@^12.40.0` — animations
- `gsap@^3.15.0`, `@gsap/react@^2.1.2` — GSAP animations
- `lucide-react@^1.16.0` — icons
- `lodash@^4.18.1`
- TypeScript@^5, types for node/react/react-dom

### @naavos/mcp-server
- Cloudflare Workers (deployed via `wrangler dev`)
- No runtime npm dependencies declared (prototype stage)

## Root Dev Dependencies

- `prettier@^3.0.0` — code formatting for `**/*.{ts,tsx,md,json}`
- `turbo@^2.0.0` — build orchestration

## Development Commands

```bash
# Install all workspace dependencies
pnpm install

# Run all builds (respects dependency order)
pnpm build

# Start all dev servers
pnpm dev

# Run all tests
pnpm test

# Format all files
pnpm format

# Check formatting
pnpm format:check

# Scan for secrets
pnpm secrets:scan

# Dashboard dev server (port 4006)
cd apps/dashboard && pnpm dev

# MCP server dev (Cloudflare Workers)
cd apps/mcp-server && pnpm dev  # uses wrangler
```

## CLI Entry Point

```
packages/cli/bin/naavos.js  →  packages/cli/index.js  →  program (Commander)
```

Avatar data stored at: `~/.naavos/avatar.json`
Compiled output at: `~/.naavos/compiled/<target>/`
Backups at: `~/.naavos/backups/`

## Security

- `gitleaks` configured via `.gitleaks.toml` for secrets scanning
- Privacy consents embedded in avatar schema (`allow-cloud-sync`, `allow-telemetry`)
- Redaction rules supported in `PrivacySchema`
