# NAAvOS Setup Guide

**Give Every AI Your Brain.**

## Prerequisites

- Node.js 22+ installed
- pnpm 9+
- Git (for cloning)

## Installation

### Step 1: Clone and Install

```bash
git clone https://github.com/innosaint-uche/naavos.git
cd naavos
pnpm install
```

### Step 2: Initialize Your Avatar

```bash
pnpm exec naavos init
```

You'll be prompted for:
- Your name
- Communication style
- Top operating rules
- Primary AI runtime

This creates `~/.naavos/avatar.json` with your cognitive profile.

### Step 3: Compile for Your Target

```bash
# Compile for Hermes
pnpm exec naavos compile --target hermes

# Compile for Claude Code
pnpm exec naavos compile --target claude-code

# Compile for Cursor
pnpm exec naavos compile --target cursor

# Compile for ReMe memory
pnpm exec naavos compile --target reme
```

### Step 4: Install

```bash
# Install into Hermes (with automatic backup)
pnpm exec naavos install --target hermes

# Install ReMe config into current project
pnpm exec naavos install --target reme
```

### Step 5: Verify

```bash
pnpm exec naavos validate
pnpm exec naavos doctor
pnpm exec naavos test
```

## Manual Setup (Without CLI)

### Claude Code

Copy the generated `CLAUDE.md` to your project root or `~/.claude/`.

### Gemini CLI

Copy the generated `GEMINI.md` to your project root or `~/.gemini/`.

### Cursor

Copy the generated `.cursorrules` to your project root or `~/.cursorrules`.

### Hermes

Run `naavos install --target hermes` to write directly to `~/.hermes/`, or export a profile bundle:

```bash
pnpm exec naavos compile --target hermes --format tar.gz
```

Then import via Hermes desktop (`⌘K → Import profile…`) or `hermes profile import avatar-profile.tar.gz`.

### ReMe

Run `naavos install --target reme` to generate `.remerc` and `CLAUDE-reme.md` in your project.

## Configuration

### Your Avatar Directory

```
~/.naavos/
├── avatar.json      # Your cognitive profile
├── compiled/        # Compiled outputs per target
│   ├── hermes/
│   ├── claude-code/
│   └── ...
├── backups/         # Installation backups (Hermes)
└── avatar-profile.tar.gz  # Exported Hermes bundle
```

## Troubleshooting

### "Command not found: naavos"

```bash
# Use pnpm exec
pnpm exec naavos --version
```

### "No avatar found"

```bash
pnpm exec naavos init
```

### Rollback a Hermes installation

```bash
pnpm exec naavos backups
pnpm exec naavos rollback --id <backup-id>
```

## Next Steps

- [README](../README.md)
- [API Reference](API.md)
- [Integration Templates](TEMPLATES/)
- [Capability Status](contracts/capability-status.json)
