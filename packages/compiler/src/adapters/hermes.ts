import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { AvatarPackage, Rule } from '@naavos/schema';

import type { FileMap } from '../index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Dev: __dirname is src/adapters/ → ../../templates/hermes
// Prod: __dirname is dist/adapters/ → ../templates/hermes (copied during build)
const HERMES_TEMPLATE_DIR = path.join(__dirname, '..', '..', 'templates', 'hermes');
const DIST_TEMPLATE_DIR = path.join(__dirname, '..', 'templates', 'hermes');

function getTemplateDir(): string {
  // Allow users to override templates via environment variable or CLI flag
  if (process.env['NAAVOS_TEMPLATE_DIR']) {
    return process.env['NAAVOS_TEMPLATE_DIR'];
  }
  // In dev, __dirname is src/adapters/, templates are at project root
  if (fs.existsSync(HERMES_TEMPLATE_DIR)) {
    return HERMES_TEMPLATE_DIR;
  }
  // In prod, __dirname is dist/adapters/, templates are copied to dist/templates/
  if (fs.existsSync(DIST_TEMPLATE_DIR)) {
    return DIST_TEMPLATE_DIR;
  }
  // Fallback
  return HERMES_TEMPLATE_DIR;
}

function loadTemplate(name: string): string {
  const templateDir = getTemplateDir();
  const templatePath = path.join(templateDir, name);
  if (fs.existsSync(templatePath)) {
    return fs.readFileSync(templatePath, 'utf-8');
  }
  throw new Error(`Hermes template not found: ${templatePath}`);
}

function render(template: string, vars: Record<string, unknown>): string {
  return template.replace(/{{([\w.]+)}}/g, (_, key: string) => {
    const parts = key.split('.');
    let value: unknown = vars;
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = (value as Record<string, unknown>)[part];
      } else {
        return '';
      }
    }
    return String(value ?? '');
  });
}

/**
 * Hermes adapter — generates the full Hermes runtime file set:
 *   SOUL.md, SKILL.md, sub-agents/*.md (one per mode), memories/MEMORY.md,
 *   profiles/avatar/memories/MEMORY.md (duplicate for Hermes path),
 *   profiles/avatar/memories/USER.md
 */
export function hermesAdapter(pkg: AvatarPackage): FileMap {
  const files = new Map<string, string>();

  files.set('SOUL.md', generateSoul(pkg));
  files.set('SKILL.md', generateSkill(pkg));

  if (pkg.modes && pkg.modes.length > 0) {
    for (const mode of pkg.modes) {
      files.set(`sub-agents/${mode.id}.md`, generateSubAgent(pkg, mode));
    }
  }

  files.set('memories/MEMORY.md', generateMemory(pkg));
  files.set('profiles/avatar/memories/MEMORY.md', generateMemory(pkg));
  files.set('profiles/avatar/memories/USER.md', generateUserMemory(pkg));

  return files;
}

function generateSoul(pkg: AvatarPackage): string {
  return render(loadTemplate('SOUL.md'), {
    identity: {
      name: pkg.identity?.name || 'Avatar',
      roles: (pkg.identity?.roles || []).join(', ') || 'None',
      self_description: pkg.identity?.self_description || 'No description provided.',
    },
    communication: {
      tone: pkg.communication?.tone || 'Direct',
      structure: pkg.communication?.structure || 'Bulleted, action-oriented',
      verbosity: pkg.communication?.verbosity || 'Minimal',
      prohibited_patterns: (pkg.communication?.prohibited_patterns || []).join(', ') || 'None specified',
    },
    operating_rules: formatRulesWithPriority(pkg.operating_rules || []),
    privacy: {
      allow_cloud_sync: fmtBool(pkg.privacy?.consents?.['allow-cloud-sync']),
      allow_telemetry: fmtBool(pkg.privacy?.consents?.['allow-telemetry']),
      data_residency: pkg.privacy?.data_residency || 'Not specified',
      retention_policy: pkg.privacy?.retention_policy || 'Not specified',
    },
    metadata: {
      package_id: pkg.metadata?.package_id || 'unknown',
    },
    compiled_at: new Date().toISOString(),
  });
}

function generateSkill(pkg: AvatarPackage): string {
  return render(loadTemplate('SKILL.md'), {
    identity: {
      name: pkg.identity?.name || 'avatar',
    },
    operating_rules: formatRules(pkg.operating_rules || []),
  });
}

function generateSubAgent(pkg: AvatarPackage, mode: NonNullable<AvatarPackage['modes']>[number]): string {
  const capabilities = mode.permitted_capabilities || [];

  return render(loadTemplate('sub-agent.md'), {
    mode: {
      id: mode.id,
      activation_phrases: mode.activation_phrases.join(', '),
      deactivation_phrases: mode.deactivation_phrases.join(', '),
      persistence: mode.persistence,
      conflicts: mode.conflicts?.length ? 'This mode conflicts with: ' + mode.conflicts.join(', ') : 'None',
      permitted_capabilities: capabilities.length ? capabilities.join('\n') : 'All capabilities permitted',
    },
    metadata: {
      package_id: pkg.metadata?.package_id || 'unknown',
    },
  });
}

function generateMemory(pkg: AvatarPackage): string {
  const rules = pkg.operating_rules ?? [];
  const identity = pkg.identity ?? {};
  return `# Memory — ${identity.name || 'Avatar'}

> Generated by NAAvOS. Drop into ~/.hermes/memories/MEMORY.md

## User Identity

- **Name:** ${identity.name || 'Unknown'}
- **Roles:** ${(identity.roles || []).join(', ') || 'None'}

## Operating Rules

${formatRules(rules)}

## Last Updated

${new Date().toISOString()}
`;
}

function generateUserMemory(pkg: AvatarPackage): string {
  const identity = pkg.identity ?? {};
  const communication = pkg.communication ?? {};
  return `# User Memory — ${identity.name || 'Avatar'}

> Generated by NAAvOS. Drop into ~/.hermes/profiles/avatar/memories/USER.md

## Preferences

- **Communication:** ${communication.verbosity || 'Minimal'} / ${communication.tone || 'Direct'}
- **Structure:** ${communication.structure || 'Bulleted, action-oriented'}

## Notes

This file is maintained by the Hermes runtime. Do not edit manually.
`;
}

/**
 * Format rules with priority as a bulleted list: "- **id:** statement (priority: N)"
 */
function formatRulesWithPriority(rules: Rule[]): string {
  return rules
    .map((r) => `- **${r.id || r.statement.slice(0, 30)}:** ${r.statement} (priority: ${r.priority})`)
    .join('\n');
}

/**
 * Format rules as a bulleted list without priority: "- **id:** statement"
 */
function formatRules(rules: Rule[]): string {
  return rules
    .map((r) => `- **${r.id || r.statement.slice(0, 30)}:** ${r.statement}`)
    .join('\n');
}

function fmtBool(value: boolean | undefined): 'Allowed' | 'Disabled' {
  return value ? 'Allowed' : 'Disabled';
}
