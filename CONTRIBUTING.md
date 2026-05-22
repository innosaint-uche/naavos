# Contributing to N-A-A-S

We welcome contributions! Here's how to get started.

## Quick Start

```bash
# Fork and clone
git clone https://github.com/naass/naass.git
cd naass

# Install dependencies
npm install

# Run health check
npm run doctor
```

## Development

```bash
# Start dashboard
cd dashboard && npm run dev

# Run MCP server locally
cd naass-mcp-server && wrangler dev

# Run CLI
cd packages/cli && node bin/naass.js
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
npm test
```

## Reporting Issues

- Use GitHub Issues
- Include your OS, Node version, and N-A-A-S version
- Provide minimal reproduction steps

## Questions?

- Discord: https://discord.gg/naass
- Email: hello@naass.io