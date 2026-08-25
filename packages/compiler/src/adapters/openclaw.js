export function openclawAdapter(pkg) {
  const identity = pkg.identity || {};
  const communication = pkg.communication || {};
  const rules = pkg.operating_rules || [];

  const content = `# Agent Configuration

Working on behalf of **${identity.name || 'User'}**.

## Operating Rules

${rules.map((r) => `- **${r.id || r.statement.slice(0, 30)}:** ${r.statement}`).join('\n')}

## Communication

- **Tone:** ${communication.tone || 'Direct'}
- **Structure:** ${communication.structure || 'Bulleted, action-oriented'}
- **Verbosity:** ${communication.verbosity || 'Minimal'}

## Privacy

- **Cloud sync:** ${pkg.privacy?.consents?.['allow-cloud-sync'] ? 'Allowed' : 'Disabled'}
- **Telemetry:** ${pkg.privacy?.consents?.['allow-telemetry'] ? 'Allowed' : 'Disabled'}

---
*Compiled from NAAvOS package ${pkg.metadata?.package_id || 'unknown'} — ${new Date().toISOString()}*
`;

  return new Map([['AGENTS.md', content]]);
}
