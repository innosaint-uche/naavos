# N-A-A-S: Neuro AI - Avatar OS System

> **Give Every AI Your Brain.**

N-A-A-S is an open-source system that makes AI agents instantly understand your cognitive profile, working style, technical defaults, and project history — without you repeating yourself.

## 🎯 What It Does

- **One install.** Every AI tool (Claude Code, Gemini CLI, Cursor, Mavis, etc.) knows who you are.
- **Zero re-explanation.** Your preferences, rules, and context persist across every session.
- **Cross-platform sync.** Update once, propagate everywhere.

## ⚡ Quick Start

```bash
# Install the CLI
npm install -g naass

# Initialize your avatar
naass init

# Sync across all connected agents
naass sync
```

## 📦 What's Included

| Package | Description |
|---------|-------------|
| `@naass/core` | Avatar schema + validation |
| `@naass/cli` | Command-line interface |
| `@naass/kb-starter` | Starter knowledge base template |
| `@naass/mcp-server` | Cloudflare Workers MCP endpoint |

## 🧠 How It Works

```
┌─────────────────────────────────────────────────────────┐
│                    N-A-A-S System                       │
│                                                          │
│   Your Avatar ──► KB (Knowledge Base)                   │
│        │                 │                               │
│        ▼                 ▼                               │
│   avatar_schema.json  projects_registry.json             │
│        │                 │                               │
│        ▼                 ▼                               │
│   ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐          │
│   │ M   │  │ C   │  │ G   │  │ Cu  │  │ H   │   ...    │
│   │ av  │  │ lau │  │ em  │  │ rs  │  │ erm │          │
│   │ is  │  │ de  │  │ ini │  │ or  │  │ es  │          │
│   └─────┘  └─────┘  └─────┘  └─────┘  └─────┘          │
│   AI Agent → Load KB → Knows You Instantly               │
└─────────────────────────────────────────────────────────┘
```

## 🌍 Cloud Version (Coming Soon)

Host your avatar on Cloudflare Workers with:
- Real-time cross-device sync
- MCP protocol endpoints
- Freemium tier + paid premium features

## 📖 Documentation

- [Setup Guide](docs/SETUP.md)
- [API Reference](docs/API.md)
- [Integration Templates](docs/TEMPLATES/)

## 🤝 Contributing

Contributions welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

## 📄 License

MIT — Use it. Fork it. Make it yours.

---

**Built with 70% faster execution. Zero fluff.**