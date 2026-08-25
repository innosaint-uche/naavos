/**
 * NAAvOS Core smoke tests
 */

import assert from 'node:assert/strict';
import { AVATAR_SCHEMA_VERSION, createAvatar, defaultSchema, validateSchema } from './index.js';

// Default schema should validate
const defaultResult = validateSchema(defaultSchema);
assert.equal(defaultResult.valid, true, 'default schema should be valid');

// Missing owner should fail
const missingOwner = { avatar_api: { version: AVATAR_SCHEMA_VERSION } };
const missingOwnerResult = validateSchema(missingOwner);
assert.equal(missingOwnerResult.valid, false, 'schema without owner should be invalid');
assert.ok(missingOwnerResult.error.includes('owner'), 'error should mention missing owner');

// Missing avatar_api should fail
const missingApi = {};
const missingApiResult = validateSchema(missingApi);
assert.equal(missingApiResult.valid, false, 'schema without avatar_api should be invalid');

// createAvatar should apply overrides
const custom = createAvatar({
  name: 'Sanitized Test User',
  rules: ['Rule one', 'Rule two'],
});
assert.equal(custom.avatar_api.owner, 'Sanitized Test User');
assert.deepEqual(custom.avatar_api.operating_rules, ['Rule one', 'Rule two']);
assert.equal(custom.avatar_api.version, AVATAR_SCHEMA_VERSION);

// Custom created schema should validate
const customResult = validateSchema(custom);
assert.equal(customResult.valid, true, 'created schema should be valid');

console.log('✓ core tests passed');
