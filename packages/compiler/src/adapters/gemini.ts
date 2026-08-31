import type { AvatarPackage, Rule } from '@naavos/schema';

import type { FileMap } from '../index.js';

/**
 * Gemini adapter — generates GEMINI.md with identity, communication
 * preferences, operating rules, and privacy settings.
 */
export function geminiAdapter(pkg: AvatarPackage): FileMap {
  const identity = pkg.identity ?? {};
  const rules = pkg.operating_rules ?? [];

  const content = `# Personal Context for Gemini CLI

## Who I Am

I'm **${identity.name || 'User'}**.

## How I Work With You

### Communication
- I want bullet points, not paragraphs
- No preamble, no "As an AI..."
- Direct answers, immediate execution

### My Rules (Non-Negotiable)

${formatRules(rules)}

## Privacy

- **Cloud sync:** ${fmtBool(pkg.privacy?.consents?.['allow-cloud-sync'])}
- **Telemetry:** ${fmtBool(pkg.privacy?.consents?.['allow-telemetry'])}

---
*Loaded via NAAvOS — ${new Date().toISOString()}*
`;

  return new Map([['GEMINI.md', content]]);
}

function formatRules(rules: Rule[]): string {
  return rules
    .map((r, i) => `${i + 1}. **${r.id || r.statement.slice(0, 30)}** — ${r.statement}`)
    .join('\n');
}

function fmtBool(value: boolean | undefined): 'Allowed' | 'Disabled' {
  return value ? 'Allowed' : 'Disabled';
}
