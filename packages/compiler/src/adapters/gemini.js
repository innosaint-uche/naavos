export function geminiAdapter(pkg) {
  const identity = pkg.identity || {};
  const communication = pkg.communication || {};
  const rules = pkg.operating_rules || [];

  const content = `# Personal Context for Gemini CLI

## Who I Am

I'm **${identity.name || 'User'}**.

## How I Work With You

### Communication
- I want bullet points, not paragraphs
- No preamble, no "As an AI..."
- Direct answers, immediate execution

### My Rules (Non-Negotiable)

${rules.map(r => `${rules.indexOf(r) + 1}. **${r.id || r.statement.slice(0, 30)}** — ${r.statement}`).join('\n')}

## Privacy

- **Cloud sync:** ${pkg.privacy?.consents?.['allow-cloud-sync'] ? 'Allowed' : 'Disabled'}
- **Telemetry:** ${pkg.privacy?.consents?.['allow-telemetry'] ? 'Allowed' : 'Disabled'}

---
*Loaded via NAAvOS — ${new Date().toISOString()}*
`;

  return new Map([['GEMINI.md', content]]);
}
