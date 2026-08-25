import { AvatarPackageSchema } from '@naavos/schema';
import { claudeCodeAdapter } from './adapters/claude-code.js';
import { cursorAdapter } from './adapters/cursor.js';
import { geminiAdapter } from './adapters/gemini.js';
import { hermesAdapter } from './adapters/hermes.js';
import { openclawAdapter } from './adapters/openclaw.js';
import { remeAdapter } from './adapters/reme.js';

const ADAPTERS = {
  hermes: hermesAdapter,
  'claude-code': claudeCodeAdapter,
  gemini: geminiAdapter,
  openclaw: openclawAdapter,
  cursor: cursorAdapter,
  reme: remeAdapter,
};

export function compile(packageData, target) {
  const parsed = AvatarPackageSchema.parse(packageData);
  const adapter = ADAPTERS[target];
  if (!adapter) {
    throw new Error(`Unknown target: ${target}. Supported: ${Object.keys(ADAPTERS).join(', ')}`);
  }
  return adapter(parsed);
}

export function listTargets() {
  return Object.keys(ADAPTERS);
}

export default { compile, listTargets };
