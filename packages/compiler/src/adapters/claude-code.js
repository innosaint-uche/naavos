export function claudeCodeAdapter(pkg) {
  const identity = pkg.identity || {};
  const communication = pkg.communication || {};
  const rules = pkg.operating_rules || [];

  const content = `# Cognitive Profile

You are working with **${identity.name || 'User'}**.

## Communication Style

- **Tone:** ${communication.tone || 'Direct, authoritative, straight-talk'}
- **Structure:** ${communication.structure || 'Bulleted, action-oriented'}
- **Verbosity:** ${communication.verbosity || 'Minimal — no preamble, no fluff'}

## Operational Rules

${rules.map((r) => `${rules.indexOf(r) + 1}. **${r.id || r.statement.slice(0, 30)}.** ${r.statement}`).join('\n')}

## Privacy

- **Cloud sync:** ${pkg.privacy?.consents?.['allow-cloud-sync'] ? 'Allowed' : 'Disabled'}
- **Telemetry:** ${pkg.privacy?.consents?.['allow-telemetry'] ? 'Allowed' : 'Disabled'}

---
*Compiled from NAAvOS package ${pkg.metadata?.package_id || 'unknown'} — ${new Date().toISOString()}*
`;

  return new Map([['CLAUDE.md', content]]);
}
