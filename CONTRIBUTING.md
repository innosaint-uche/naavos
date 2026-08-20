# Contributing to NAAvOS

We welcome contributions! Here's how to get started.

## Quick Start

```bash
# Fork and clone
git clone https://github.com/naavos/naavos-system.git
cd naavos-system

# Install dependencies
pnpm install

# Run health check
pnpm run doctor
```

## Development

```bash
# Build all packages
pnpm run build

# Run CLI
cd packages/cli && node bin/naavos.js

# Start dashboard
cd apps/dashboard && pnpm run dev
```

## Making Changes

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to your branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

## Commit Messages

Format: `type(scope): description`

Types:
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation
- `refactor` — Code refactoring
- `test` — Tests
- `chore` — Maintenance

## Code Style

- Use ES Modules (ESM)
- 2-space indentation
- Single quotes for strings
- No semicolons

## Testing

```bash
pnpm run test
```

## Reporting Issues

- Use GitHub Issues
- Include your OS, Node version, and NAAvOS version
- Provide minimal reproduction steps

## Questions?

- Discord: https://discord.gg/naavos
- Email: hello@naavos.io
