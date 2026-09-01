#!/usr/bin/env node
/**
 * NAAvOS Core validation CLI
 */

import { defaultSchema, validateSchema } from './index.js';

const result = validateSchema(defaultSchema);
if (result.valid) {
  process.stdout.write('✓ default schema is valid\n');
  process.exit(0);
} else {
  process.stderr.write(`✗ default schema is invalid: ${result.error}\n`);
  process.exit(1);
}
