import { describe, it, expect } from 'vitest';

import {
  AVATAR_SCHEMA_VERSION,
  createAvatar,
  defaultSchema,
  validateSchema,
  type ValidationResult,
} from './index.js';

describe('defaultSchema', () => {
  it('should validate', () => {
    const result: ValidationResult = validateSchema(defaultSchema);
    expect(result.valid).toBe(true);
  });

  it('should have version 1.0', () => {
    expect(defaultSchema.avatar_api.version).toBe(AVATAR_SCHEMA_VERSION);
  });

  it('should have required fields', () => {
    expect(defaultSchema.avatar_api.owner).toBeDefined();
    expect(defaultSchema.avatar_api.endpoint_type).toBeDefined();
    expect(defaultSchema.avatar_api.communication_style).toBeDefined();
    expect(defaultSchema.avatar_api.operating_rules.length).toBeGreaterThan(0);
  });
});

describe('validateSchema', () => {
  it('rejects missing avatar_api', () => {
    const result = validateSchema({});
    expect(result.valid).toBe(false);
    expect(result.error).toContain('avatar_api');
  });

  it('rejects missing version', () => {
    const result = validateSchema({ avatar_api: { owner: 'test' } });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('version');
  });

  it('rejects missing owner', () => {
    const result = validateSchema({ avatar_api: { version: '1.0' } });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('owner');
  });

  it('rejects null input', () => {
    const result = validateSchema(null);
    expect(result.valid).toBe(false);
  });

  it('rejects non-object input', () => {
    const result = validateSchema('string');
    expect(result.valid).toBe(false);
  });
});

describe('createAvatar', () => {
  it('applies name override', () => {
    const custom = createAvatar({ name: 'Sanitized Test User' });
    expect(custom.avatar_api.owner).toBe('Sanitized Test User');
  });

  it('applies description override', () => {
    const custom = createAvatar({ description: 'Custom description' });
    expect(custom.avatar_api.description).toBe('Custom description');
  });

  it('applies rules override', () => {
    const custom = createAvatar({ rules: ['Rule one', 'Rule two'] });
    expect(custom.avatar_api.operating_rules).toEqual(['Rule one', 'Rule two']);
  });

  it('applies communication_style override', () => {
    const custom = createAvatar({
      communication_style: { tone: 'playful' },
    });
    expect(custom.avatar_api.communication_style.tone).toBe('playful');
    // Other fields preserved
    expect(custom.avatar_api.communication_style.verbosity).toBe('concise');
  });

  it('applies stack override', () => {
    const custom = createAvatar({
      stack: { hosting: ['Vercel'] },
    });
    expect(custom.avatar_api.favorite_stack.hosting).toEqual(['Vercel']);
    // Other fields preserved
    expect(custom.avatar_api.favorite_stack.frontend).toEqual([
      'YOUR_FRONTEND_FRAMEWORK',
    ]);
  });

  it('produces a valid schema', () => {
    const custom = createAvatar({
      name: 'Test User',
      rules: ['Rule one'],
    });
    const result = validateSchema(custom);
    expect(result.valid).toBe(true);
  });

  it('preserves trigger_modes from default', () => {
    const custom = createAvatar({ name: 'Test' });
    expect(custom.avatar_api.trigger_modes.focused_delivery).toBeDefined();
    expect(custom.avatar_api.trigger_modes.exploration).toBeDefined();
  });
});
