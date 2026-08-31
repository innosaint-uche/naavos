import type { AvatarPackage, Rule } from '@naavos/schema';

import type { FileMap } from '../index.js';

/**
 * OpenClaw adapter — generates AGENTS.md with operating rules,
 * communication preferences, and privacy settings.
 */
export function openclawAdapter(pkg: AvatarPackage): FileMap {
  const identity = pkg.identity ?? {};
  const communication = pkg.communication ?? {};
  const rules = pkg.operating_rules ?? [];

  const content = `# Agent Configuration

Working on behalf of **${identity.name || 'User'}**.

## Operating Rules

${formatRules(rules)}

## Communication

- **Tone:** ${communication.tone || 'Direct'}
- **Structure:** ${communication.structure || 'Bulleted, action-oriented'}
- **Verbosity:** ${communication.verbosity || 'Minimal'}

## Privacy

- **Cloud sync:** ${fmtBool(pkg.privacy?.consents?.['allow-cloud-sync'])}
- **Telemetry:** ${fmtBool(pkg.privacy?.consents?.['allow-telemetry'])}

---
*Compiled from NAAvOS package ${pkg.metadata?.package_id || 'unknown'} — ${new Date().toISOString()}*
`;

  return new Map([['AGENTS.md', content]]);
}

function formatRules(rules: Rule[]): string {
  return rules
    .map((r, i) => `${i + 1}. **${r.id || r.statement.slice(0, 30)}** — ${r.statement}`)
    .join('\n');
}

function fmtBool(value: boolean | undefined): 'Allowed' | 'Disabled' {
  return value ? 'Allowed' : 'Disabled';
}
