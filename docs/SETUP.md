# N-A-A-S Setup Guide

**Give Every AI Your Brain** — in 15 minutes.

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Git (for cloning)
- Accounts for AI tools you want to connect

## Installation

### Step 1: Install the CLI

```bash
npm install -g naass
```

Verify installation:

```bash
naass --version
# Should output: 1.0.0
```

### Step 2: Initialize Your Avatar

```bash
naass init
```

You'll be prompted for:
- Your name
- Your MBTI type (optional, defaults to ENTP-A)
- Your email (for cross-device sync)

This creates `~/.naass/avatar.json` with your cognitive profile.

### Step 3: Connect Your AI Tools

```bash
# Connect Claude Code
naass connect claude-code

# Connect Gemini CLI
naass connect gemini

# Connect Cursor
naass connect cursor

# Connect Mavis
naass connect mavis

# Connect OpenClaw
naass connect openclaw
```

### Step 4: Sync

```bash
naass sync
```

Your avatar is now loaded by all connected AI agents automatically.

## Manual Setup (Without CLI)

If you prefer to set up manually:

### Claude Code

```bash
# Add this to your ~/.claude/CLAUDE.md
# OR create ~/.claude/CLAUDE.md if it doesn't exist

# [Paste content from examples/claude-code-setup/CLAUDE.md]
```

### Gemini CLI

```bash
# Add to ~/.gemini/GEMINI.md

# [Paste content from examples/gemini-setup/GEMINI.md]
```

### Cursor

```bash
# Create or edit .cursorrules in your project root

# [Paste content from examples/cursor-setup/.cursorrules]
```

### Mavis

```bash
# Add to your agent directory
# ~/.mavis/agents/<your-agent>/agent.md

# [Paste content from examples/mavis-setup/agent.md]
```

## Configuration

### Your Avatar Directory

```
~/.naass/
├── avatar.json      # Your cognitive profile
├── kb/              # Knowledge base (optional)
├── sync/            # Sync state
└── config.json      # CLI configuration
```

### Environment Variables

```bash
# Optional: Set your sync endpoint
export NAASS_ENDPOINT="https://api.naass.io"

# Optional: Set your user ID
export NAASS_USER_ID="your-email"
```

## Updating Your Avatar

### Add a Project

```bash
naass log "Project Name" "Description" "tag1,tag2"
```

### Update Your Profile

```bash
# Edit directly
nano ~/.naass/avatar.json

# Or use the CLI
naass update --name "New Name" --mbti "INTJ-A"
```

### Sync

```bash
naass sync
```

## Troubleshooting

### "Command not found: naass"

```bash
# Ensure npm global bin is in your PATH
echo $PATH

# If not, add to ~/.zshrc or ~/.bashrc:
export PATH="$PATH:$(npm bin -g)"
```

### "Connection failed"

Check that the target agent's config file exists:

```bash
# For Claude Code
cat ~/.claude/CLAUDE.md

# For Gemini
cat ~/.gemini/GEMINI.md
```

### Run Health Check

```bash
naass doctor
```

## Next Steps

- [API Reference](API.md)
- [Integration Templates](TEMPLATES/)
- [Cloudflare Deployment Guide](CLOUDFLARE.md)

## Getting Help

- GitHub Issues: https://github.com/naass/naass/issues
- Discord: https://discord.gg/naass
- Email: hello@naass.io