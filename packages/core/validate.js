#!/usr/bin/env node
/**
 * NAAvOS Core validation CLI
 */

import { defaultSchema, validateSchema } from './index.js';

const result = validateSchema(defaultSchema);
if (result.valid) {
  console.log('✓ default schema is valid');
  process.exit(0);
} else {
  console.error('✗ default schema is invalid:', result.error);
  process.exit(1);
}
