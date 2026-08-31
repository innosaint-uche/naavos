import { describe, expect, it } from 'vitest';

import { compile, listTargets } from './index.js';

// A minimal valid avatar package that all compiler tests build on
function makeValidPackage(overrides: Record<string, unknown> = {}) {
  return {
    metadata: {
      package_id: 'a1b2c3d4-e5f6-7777-8888-999999999999',
      owner_id: 'f6e5d4c3-b2a1-8888-7777-666666666666',
      schema_version: '1.0.0',
      semantic_version: '1.0.0',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    identity: { name: 'Test', roles: ['Developer'] },
    communication: {
      tone: 'Direct',
      structure: 'Bulleted',
      verbosity: 'Minimal',
      prohibited_patterns: ['As an AI'],
    },
    operating_rules: [
      { id: 'r1', statement: 'Always cite evidence', priority: 90 },
      { id: 'r2', statement: 'Be fast', priority: 80 },
    ],
    privacy: {
      consents: { 'allow-cloud-sync': false, 'allow-telemetry': false },
    },
    adapters: [{ host_id: 'hermes', min_adapter_version: '1.0.0' }],
    evals: [],
    ...overrides,
  };
}

describe('listTargets', () => {
  it('returns all 6 adapter targets', () => {
    const targets = listTargets();
    expect(targets).toHaveLength(6);
    expect(targets).toContain('hermes');
    expect(targets).toContain('claude-code');
    expect(targets).toContain('gemini');
    expect(targets).toContain('openclaw');
    expect(targets).toContain('cursor');
    expect(targets).toContain('reme');
  });
});

describe('compile — target availability', () => {
  it('compiles all 6 targets without throwing', () => {
    for (const target of listTargets()) {
      expect(() => compile(makeValidPackage(), target)).not.toThrow();
    }
  });

  it('throws on unknown target with helpful message', () => {
    expect(() => compile(makeValidPackage(), 'unknown')).toThrow(
      /Unknown target: unknown\. Supported:/,
    );
  });
});

describe('compile — return type', () => {
  it('returns a Map for all targets', () => {
    for (const target of listTargets()) {
      const files = compile(makeValidPackage(), target);
      expect(files).toBeInstanceOf(Map);
    }
  });
});

describe('hermes adapter', () => {
  it('generates all required files', () => {
    const files = compile(makeValidPackage(), 'hermes');
    expect(files.has('SOUL.md')).toBe(true);
    expect(files.has('SKILL.md')).toBe(true);
    expect(files.has('memories/MEMORY.md')).toBe(true);
    expect(files.has('profiles/avatar/memories/MEMORY.md')).toBe(true);
    expect(files.has('profiles/avatar/memories/USER.md')).toBe(true);
  });

  it('includes mode sub-agent files when modes are present', () => {
    const pkg = makeValidPackage({
      modes: [
        {
          id: 'cto_mode',
          activation_phrases: ['enter CTO mode'],
          deactivation_phrases: ['exit CTO mode'],
          persistence: 'session',
        },
      ],
    });
    const files = compile(pkg, 'hermes');
    expect(files.has('sub-agents/cto_mode.md')).toBe(true);
  });

  it('does not include mode files when modes empty', () => {
    const files = compile(makeValidPackage(), 'hermes');
    expect(files.has('sub-agents/cto_mode.md')).toBe(false);
  });

  it('includes rule statements in SOUL.md with priority', () => {
    const files = compile(makeValidPackage(), 'hermes');
    const soul = files.get('SOUL.md')!;
    expect(soul).toContain('Always cite evidence');
    expect(soul).toContain('Be fast');
    expect(soul).toContain('priority: 90');
    expect(soul).toContain('priority: 80');
  });

  it('includes identity name in output files', () => {
    const files = compile(makeValidPackage(), 'hermes');
    const soul = files.get('SOUL.md')!;
    const memory = files.get('memories/MEMORY.md')!;
    expect(soul).toContain('Test');
    expect(memory).toContain('Test');
  });

  it('includes privacy consent status', () => {
    const files = compile(makeValidPackage(), 'hermes');
    const soul = files.get('SOUL.md')!;
    expect(soul).toContain('Disabled');
  });

  it('formats rules with IDs and priorities', () => {
    const pkg = makeValidPackage({
      operating_rules: [
        { id: 'rule.a', statement: 'First rule', priority: 90 },
        { id: 'rule.b', statement: 'Second rule', priority: 80 },
        { id: 'rule.c', statement: 'Third rule', priority: 70 },
      ],
    });
    const files = compile(pkg, 'hermes');
    const soul = files.get('SOUL.md')!;
    expect(soul).toContain('rule.a');
    expect(soul).toContain('rule.b');
    expect(soul).toContain('rule.c');
    expect(soul).toContain('priority: 90');
    expect(soul).toContain('priority: 80');
    expect(soul).toContain('priority: 70');
  });
});

describe('claude-code adapter', () => {
  it('generates CLAUDE.md', () => {
    const files = compile(makeValidPackage(), 'claude-code');
    expect(files.has('CLAUDE.md')).toBe(true);
  });

  it('includes identity and rules', () => {
    const files = compile(makeValidPackage(), 'claude-code');
    const content = files.get('CLAUDE.md')!;
    expect(content).toContain('Test');
    expect(content).toContain('Always cite evidence');
    expect(content).toContain('Be fast');
  });

  it('includes privacy status', () => {
    const files = compile(makeValidPackage(), 'claude-code');
    const content = files.get('CLAUDE.md')!;
    expect(content).toContain('Cloud sync');
    expect(content).toContain('Telemetry');
  });
});

describe('gemini adapter', () => {
  it('generates GEMINI.md', () => {
    const files = compile(makeValidPackage(), 'gemini');
    expect(files.has('GEMINI.md')).toBe(true);
  });

  it('includes rules with numbering', () => {
    const files = compile(makeValidPackage(), 'gemini');
    const content = files.get('GEMINI.md')!;
    expect(content).toContain('1. **r1**');
    expect(content).toContain('2. **r2**');
  });
});

describe('openclaw adapter', () => {
  it('generates AGENTS.md', () => {
    const files = compile(makeValidPackage(), 'openclaw');
    expect(files.has('AGENTS.md')).toBe(true);
  });

  it('includes identity name', () => {
    const files = compile(makeValidPackage(), 'openclaw');
    const content = files.get('AGENTS.md')!;
    expect(content).toContain('Test');
  });
});

describe('cursor adapter', () => {
  it('generates .cursorrules', () => {
    const files = compile(makeValidPackage(), 'cursor');
    expect(files.has('.cursorrules')).toBe(true);
  });

  it('includes prohibited patterns', () => {
    const files = compile(makeValidPackage(), 'cursor');
    const content = files.get('.cursorrules')!;
    expect(content).toContain('As an AI');
  });

  it('includes rules with priority in bullet format', () => {
    const files = compile(makeValidPackage(), 'cursor');
    const content = files.get('.cursorrules')!;
    expect(content).toContain('priority: 90');
    expect(content).toContain('priority: 80');
    expect(content).toContain('r1');
    expect(content).toContain('r2');
  });
});

describe('reme adapter', () => {
  it('generates all 3 required files', () => {
    const files = compile(makeValidPackage(), 'reme');
    expect(files.has('.remerc')).toBe(true);
    expect(files.has('skills/reme_memory/SKILL.md')).toBe(true);
    expect(files.has('CLAUDE-reme.md')).toBe(true);
  });

  it('uses default port 2333 when no config present', () => {
    const files = compile(makeValidPackage(), 'reme');
    const remerc = files.get('.remerc')!;
    expect(remerc).toContain('port: 2333');
  });

  it('uses default workspace .reme when no config present', () => {
    const files = compile(makeValidPackage(), 'reme');
    const remerc = files.get('.remerc')!;
    expect(remerc).toContain('workspace_dir: .reme');
  });

  it('extracts ReMe config from knowledge_sources objects', () => {
    const pkg = makeValidPackage({
      knowledge_sources: [
        {
          type: 'connector-reme',
          config: {
            workspaceDir: '/custom/reme',
            servicePort: 9999,
            enableAutoMemory: false,
          },
        },
      ],
    });
    const files = compile(pkg, 'reme');
    const remerc = files.get('.remerc')!;
    expect(remerc).toContain('port: 9999');
    expect(remerc).toContain('workspace_dir: /custom/reme');
    expect(remerc).toContain('as_auto_memory: false');
  });

  it('still works with knowledge_sources as plain strings', () => {
    const pkg = makeValidPackage({
      knowledge_sources: ['https://example.com/docs'],
    });
    const files = compile(pkg, 'reme');
    expect(files.has('.remerc')).toBe(true);
    expect(files.get('.remerc')).toContain('port: 2333');
  });

  it('uses enableAutoMemory=false from config', () => {
    const pkg = makeValidPackage({
      knowledge_sources: [
        {
          type: 'connector-reme',
          config: { servicePort: 5555, enableAutoDream: false },
        },
      ],
    });
    const files = compile(pkg, 'reme');
    const remerc = files.get('.remerc')!;
    expect(remerc).toContain('port: 5555');
    expect(remerc).toContain('as_auto_dream: false');
  });
});

describe('compile — invalid input', () => {
  it('throws when operating_rules is empty', () => {
    const pkg = makeValidPackage({ operating_rules: [] });
    expect(() => compile(pkg, 'hermes')).toThrow();
  });

  it('throws when adapters is empty', () => {
    const pkg = makeValidPackage({ adapters: [] });
    expect(() => compile(pkg, 'hermes')).toThrow();
  });
});
