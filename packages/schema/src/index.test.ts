import { describe, expect, it } from 'vitest';

import {
  AdapterTargetSchema,
  AvatarPackageSchema,
  CommunicationSchema,
  IdentitySchema,
  KnowledgeSourceSchema,
  MetadataSchema,
  ModeSchema,
  PrivacySchema,
  RouteSchema,
  RuleSchema,
} from './index.js';
import type {
  AdapterTarget,
  AvatarPackage,
  Communication,
  Identity,
  KnowledgeSource,
  Metadata,
  Mode,
  Privacy,
  Route,
  Rule,
} from './index.js';

function makeValidPackage(): AvatarPackage {
  return {
    metadata: {
      package_id: 'a1b2c3d4-e5f6-7777-8888-999999999999',
      owner_id: 'f6e5d4c3-b2a1-8888-7777-666666666666',
      schema_version: '1.0.0',
      semantic_version: '1.0.0',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      source_provenance: 'created-from-cli',
    },
    identity: {
      name: 'Test User',
      roles: ['Developer', 'Writer'],
      self_description: 'A test avatar',
    },
    communication: {
      tone: 'Direct, authoritative',
      structure: 'Bulleted, action-oriented',
      verbosity: 'Concise',
      prohibited_patterns: ['As an AI', "I'd be happy to"],
    },
    operating_rules: [
      { id: 'rule.1', statement: 'Always cite evidence', priority: 90 },
      { id: 'rule.2', statement: 'No fluff', priority: 80 },
    ],
    privacy: {
      consents: { 'allow-cloud-sync': false, 'allow-telemetry': false },
      data_residency: 'us-east-1',
      retention_policy: 'delete-after-90-days',
    },
    adapters: [
      { host_id: 'hermes', min_adapter_version: '1.0.0', unsupported_behaviour_policy: 'warn' },
      { host_id: 'claude-code', min_adapter_version: '1.0.0', unsupported_behaviour_policy: 'warn' },
    ],
    evals: ['eval-pack-core-v1', 'eval-pack-safety-v1'],
  };
}

// ---------------------------------------------------------------------------
// MetadataSchema
// ---------------------------------------------------------------------------

describe('MetadataSchema', () => {
  it('parses a valid metadata object', () => {
    const input = {
      package_id: 'a1b2c3d4-e5f6-7777-8888-999999999999',
      owner_id: 'f6e5d4c3-b2a1-8888-7777-666666666666',
      schema_version: '1.0.0',
      semantic_version: '1.2.3',
      created_at: '2026-01-15T10:30:00.000Z',
      updated_at: '2026-01-16T12:00:00.000Z',
      source_provenance: 'imported-from-v0',
    };
    const result = MetadataSchema.parse(input);
    expect(result.package_id).toBe(input.package_id);
    expect(result.schema_version).toBe('1.0.0');
  });

  it('defaults schema_version to 1.0.0', () => {
    const input = {
      package_id: 'a1b2c3d4-e5f6-7777-8888-999999999999',
      owner_id: 'f6e5d4c3-b2a1-8888-7777-666666666666',
      semantic_version: '1.0.0',
      created_at: '2026-01-15T10:30:00.000Z',
      updated_at: '2026-01-16T12:00:00.000Z',
    };
    const result = MetadataSchema.parse(input);
    expect(result.schema_version).toBe('1.0.0');
  });

  it('rejects non-UUID package_id', () => {
    const input = {
      package_id: 'not-a-uuid',
      owner_id: 'f6e5d4c3-b2a1-8888-7777-666666666666',
      semantic_version: '1.0.0',
      created_at: '2026-01-15T10:30:00.000Z',
      updated_at: '2026-01-16T12:00:00.000Z',
    };
    expect(() => MetadataSchema.parse(input)).toThrow();
  });

  it('rejects invalid semantic_version (no patch)', () => {
    const input = {
      package_id: 'a1b2c3d4-e5f6-7777-8888-999999999999',
      owner_id: 'f6e5d4c3-b2a1-8888-7777-666666666666',
      semantic_version: '1.2',
      created_at: '2026-01-15T10:30:00.000Z',
      updated_at: '2026-01-16T12:00:00.000Z',
    };
    expect(() => MetadataSchema.parse(input)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// IdentitySchema
// ---------------------------------------------------------------------------

describe('IdentitySchema', () => {
  it('parses minimal identity (name only)', () => {
    const result = IdentitySchema.parse({ name: 'Alice' });
    expect(result.name).toBe('Alice');
    expect(result.roles).toBeUndefined();
    expect(result.self_description).toBeUndefined();
  });

  it('rejects missing name', () => {
    expect(() => IdentitySchema.parse({})).toThrow();
  });

  it('parses full identity', () => {
    const result = IdentitySchema.parse({
      name: 'Bob',
      roles: ['Developer', 'Architect'],
      self_description: 'Building systems',
    });
    expect(result.roles).toEqual(['Developer', 'Architect']);
  });
});

// ---------------------------------------------------------------------------
// CommunicationSchema
// ---------------------------------------------------------------------------

describe('CommunicationSchema', () => {
  it('parses required fields', () => {
    const result = CommunicationSchema.parse({
      tone: 'Direct',
      structure: 'Bulleted',
      verbosity: 'Concise',
    });
    expect(result.tone).toBe('Direct');
  });

  it('parses optional prohibited_patterns', () => {
    const result = CommunicationSchema.parse({
      tone: 'Direct',
      structure: 'Bulleted',
      verbosity: 'Concise',
      prohibited_patterns: ['As an AI', 'I would say'],
    });
    expect(result.prohibited_patterns).toHaveLength(2);
  });

  it('rejects missing tone', () => {
    expect(() =>
      CommunicationSchema.parse({ structure: 'x', verbosity: 'x' }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// RuleSchema
// ---------------------------------------------------------------------------

describe('RuleSchema', () => {
  it('parses a valid rule', () => {
    const result = RuleSchema.parse({
      id: 'evidence.no_false_completion',
      statement: 'Always cite evidence',
      priority: 90,
    });
    expect(result.id).toBe('evidence.no_false_completion');
    expect(result.priority).toBe(90);
  });

  it('rejects priority > 100', () => {
    expect(() =>
      RuleSchema.parse({ id: 'r1', statement: 'test', priority: 101 }),
    ).toThrow();
  });

  it('rejects priority < 0', () => {
    expect(() =>
      RuleSchema.parse({ id: 'r1', statement: 'test', priority: -1 }),
    ).toThrow();
  });

  it('accepts priority 0 and 100 (boundaries)', () => {
    expect(() => RuleSchema.parse({ id: 'r1', statement: 'x', priority: 0 })).not.toThrow();
    expect(() => RuleSchema.parse({ id: 'r2', statement: 'x', priority: 100 })).not.toThrow();
  });

  it('rejects non-integer priority', () => {
    expect(() =>
      RuleSchema.parse({ id: 'r1', statement: 'x', priority: 50.5 }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// ModeSchema
// ---------------------------------------------------------------------------

describe('ModeSchema', () => {
  it('parses a valid mode', () => {
    const result = ModeSchema.parse({
      id: 'cto_mode',
      activation_phrases: ['enter CTO mode', 'be my CTO'],
      deactivation_phrases: ['exit CTO mode', 'exit cto'],
      persistence: 'session',
    });
    expect(result.id).toBe('cto_mode');
    expect(result.persistence).toBe('session');
  });

  it('rejects invalid persistence value', () => {
    expect(() =>
      ModeSchema.parse({
        id: 'm',
        activation_phrases: ['x'],
        deactivation_phrases: ['x'],
        persistence: 'global_forever',
      }),
    ).toThrow();
  });

  it('parses optional conflicts and permitted_capabilities', () => {
    const result = ModeSchema.parse({
      id: 'debug',
      activation_phrases: ['debug'],
      deactivation_phrases: ['exit debug'],
      persistence: 'project',
      conflicts: ['cto_mode'],
      permitted_capabilities: ['shell_access', 'file_write'],
    });
    expect(result.conflicts).toEqual(['cto_mode']);
  });
});

// ---------------------------------------------------------------------------
// RouteSchema
// ---------------------------------------------------------------------------

describe('RouteSchema', () => {
  it('defaults approval_class to auto', () => {
    const result = RouteSchema.parse({
      id: 'route.1',
      intent: 'create-video',
      skill_or_tool: 'video.skill',
    });
    expect(result.approval_class).toBe('auto');
  });

  it('rejects invalid approval_class', () => {
    expect(() =>
      RouteSchema.parse({
        id: 'r',
        intent: 'x',
        skill_or_tool: 'x',
        approval_class: 'maybe',
      }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// PrivacySchema
// ---------------------------------------------------------------------------

describe('PrivacySchema', () => {
  it('parses valid privacy with consents', () => {
    const result = PrivacySchema.parse({
      consents: { 'allow-cloud-sync': false, 'allow-telemetry': false },
      data_residency: 'eu-west-1',
      retention_policy: 'delete-after-90-days',
    });
    expect(result.consents['allow-cloud-sync']).toBe(false);
    expect(result.retention_policy).toBe('delete-after-90-days');
  });

  it('rejects non-boolean consent values', () => {
    expect(() =>
      PrivacySchema.parse({ consents: { 'bad-key': 'yes' } }),
    ).toThrow();
  });

  it('requires consents to be present', () => {
    expect(() => PrivacySchema.parse({})).toThrow();
  });
});

// ---------------------------------------------------------------------------
// AdapterTargetSchema
// ---------------------------------------------------------------------------

describe('AdapterTargetSchema', () => {
  it('parses a valid adapter target', () => {
    const result = AdapterTargetSchema.parse({
      host_id: 'claude-code',
      min_adapter_version: '1.0.0',
      unsupported_behaviour_policy: 'warn',
    });
    expect(result.host_id).toBe('claude-code');
  });

  it('defaults unsupported_behaviour_policy to warn', () => {
    const result = AdapterTargetSchema.parse({
      host_id: 'hermes',
      min_adapter_version: '1.0.0',
    });
    expect(result.unsupported_behaviour_policy).toBe('warn');
  });

  it('rejects invalid version format', () => {
    expect(() =>
      AdapterTargetSchema.parse({ host_id: 'x', min_adapter_version: '1.2' }),
    ).toThrow();
  });

  it('rejects invalid unsupported_behaviour_policy', () => {
    expect(() =>
      AdapterTargetSchema.parse({
        host_id: 'x',
        min_adapter_version: '1.0.0',
        unsupported_behaviour_policy: 'maybe',
      }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// KnowledgeSourceSchema
// ---------------------------------------------------------------------------

describe('KnowledgeSourceSchema', () => {
  it('parses a minimal knowledge source (all fields optional)', () => {
    const result = KnowledgeSourceSchema.parse({});
    expect(result.uri).toBeUndefined();
    expect(result.type).toBeUndefined();
    expect(result.config).toBeUndefined();
  });

  it('parses a full knowledge source with config', () => {
    const result = KnowledgeSourceSchema.parse({
      uri: 'https://github.com/user/project-a',
      type: 'git',
      config: { branch: 'main', depth: 1 },
    });
    expect(result.uri).toBe('https://github.com/user/project-a');
    expect(result.type).toBe('git');
    expect(result.config?.branch).toBe('main');
  });

  it('accepts connector-reme type with config', () => {
    const result = KnowledgeSourceSchema.parse({
      type: 'connector-reme',
      config: { workspaceDir: '.reme', servicePort: 2333 },
    });
    expect(result.type).toBe('connector-reme');
    expect(result.config?.servicePort).toBe(2333);
  });
});

// ---------------------------------------------------------------------------
// AvatarPackageSchema (integration)
// ---------------------------------------------------------------------------

describe('AvatarPackageSchema', () => {
  it('parses a fully valid avatar package', () => {
    const valid = makeValidPackage();
    const result = AvatarPackageSchema.parse(valid);
    expect(result.identity.name).toBe('Test User');
    expect(result.operating_rules).toHaveLength(2);
    expect(result.adapters).toHaveLength(2);
  });

  it('rejects when operating_rules is empty', () => {
    const data = makeValidPackage();
    data.operating_rules = [];
    expect(() => AvatarPackageSchema.parse(data)).toThrow();
  });

  it('rejects when adapters is empty', () => {
    const data = makeValidPackage();
    data.adapters = [];
    expect(() => AvatarPackageSchema.parse(data)).toThrow();
  });

  it('rejects when privacy.consents is missing', () => {
    const data = makeValidPackage();
    // @ts-expect-error testing missing field
    delete data.privacy;
    expect(() => AvatarPackageSchema.parse(data)).toThrow();
  });

  it('rejects when operating_rules is missing entirely', () => {
    const data = makeValidPackage();
    // @ts-expect-error testing missing field
    delete data.operating_rules;
    expect(() => AvatarPackageSchema.parse(data)).toThrow();
  });

  it('accepts optional modes', () => {
    const data = makeValidPackage();
    data.modes = [
      {
        id: 'cto_mode',
        activation_phrases: ['CTO'],
        deactivation_phrases: ['exit CTO'],
        persistence: 'session',
      },
    ];
    const result = AvatarPackageSchema.parse(data);
    expect(result.modes).toHaveLength(1);
  });

  it('accepts optional routing', () => {
    const data = makeValidPackage();
    data.routing = [
      { id: 'r1', intent: 'code', skill_or_tool: 'coder.skill', approval_class: 'auto' },
    ];
    const result = AvatarPackageSchema.parse(data);
    expect(result.routing?.[0]?.id).toBe('r1');
  });

  it('accepts optional knowledge_sources and projects', () => {
    const data = makeValidPackage();
    data.knowledge_sources = [
      'https://docs.example.com/guide.pdf',
      {
        type: 'connector-reme',
        config: { workspaceDir: '/custom/reme', servicePort: 9999 },
      },
    ];
    data.projects = ['https://github.com/user/project-a'];
    const result = AvatarPackageSchema.parse(data);
    expect(result.knowledge_sources).toHaveLength(2);
    expect(result.knowledge_sources?.[0]).toBe('https://docs.example.com/guide.pdf');
    expect(result.knowledge_sources?.[1]?.type).toBe('connector-reme');
    expect((result.knowledge_sources?.[1] as KnowledgeSource)?.config?.servicePort).toBe(9999);
    expect(result.projects).toContain('https://github.com/user/project-a');
  });

  it('parses a minimal avatar package (only required fields)', () => {
    const minimal = {
      metadata: {
        package_id: 'a1b2c3d4-e5f6-7777-8888-999999999999',
        owner_id: 'f6e5d4c3-b2a1-8888-7777-666666666666',
        semantic_version: '1.0.0',
        created_at: '2026-01-15T10:30:00.000Z',
        updated_at: '2026-01-16T12:00:00.000Z',
      },
      identity: { name: 'Minimal' },
      communication: { tone: 'x', structure: 'x', verbosity: 'x' },
      operating_rules: [{ id: 'r1', statement: 's', priority: 50 }],
      privacy: { consents: {} },
      adapters: [{ host_id: 'hermes', min_adapter_version: '1.0.0' }],
      evals: [],
    };
    const result = AvatarPackageSchema.parse(minimal);
    expect(result.identity.name).toBe('Minimal');
    expect(result.metadata.schema_version).toBe('1.0.0');
  });
});

// ---------------------------------------------------------------------------
// Type export smoke test
// ---------------------------------------------------------------------------

describe('Type exports', () => {
  it('exports all expected types from z.infer', () => {
    const pkg: AvatarPackage = makeValidPackage();
    const mode: Mode = pkg.modes?.[0] ?? ({} as Mode);
    const route: Route = pkg.routing?.[0] ?? ({} as Route);
    const priv: Privacy = pkg.privacy;
    const adapter: AdapterTarget = pkg.adapters[0]!;
    const meta: Metadata = pkg.metadata;
    const ident: Identity = pkg.identity;
    const comm: Communication = pkg.communication;
    const rule: Rule = pkg.operating_rules[0]!;

    expect(meta.package_id).toBeTruthy();
    expect(ident.name).toBe('Test User');
    expect(comm.tone).toBe('Direct, authoritative');
    expect(rule.id).toBe('rule.1');
    expect(priv.consents['allow-telemetry']).toBe(false);
    expect(adapter.host_id).toBe('hermes');

    // Suppress unused variable warnings
    expect(mode).toBeDefined();
    expect(route).toBeDefined();
  });
});
