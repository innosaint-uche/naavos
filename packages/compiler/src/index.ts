import { AvatarPackageSchema } from '@naavos/schema';
import type { AvatarPackage } from '@naavos/schema';

import { claudeCodeAdapter } from './adapters/claude-code.js';
import { cursorAdapter } from './adapters/cursor.js';
import { geminiAdapter } from './adapters/gemini.js';
import { hermesAdapter } from './adapters/hermes.js';
import { openclawAdapter } from './adapters/openclaw.js';
import { remeAdapter } from './adapters/reme.js';

/**
 * A map of relative file paths to their generated content.
 * The key is the destination path relative to the target host root.
 */
export type FileMap = Map<string, string>;

/**
 * Function signature for all host adapters.
 * Receives a validated AvatarPackage and returns a map of file paths to content.
 */
export type AdapterFn = (pkg: AvatarPackage) => FileMap;

const ADAPTERS: Record<string, AdapterFn> = {
  hermes: hermesAdapter,
  'claude-code': claudeCodeAdapter,
  gemini: geminiAdapter,
  openclaw: openclawAdapter,
  cursor: cursorAdapter,
  reme: remeAdapter,
};

/**
 * Compile an avatar package into host-specific artifacts.
 *
 * @param packageData - Raw avatar package data (will be validated against AvatarPackageSchema)
 * @param target - The target host ID (e.g., "hermes", "claude-code", "cursor")
 * @returns A Map of relative file paths to generated file content
 * @throws {Error} If packageData fails schema validation or target is not supported
 */
export function compile(packageData: unknown, target: string): FileMap {
  const parsed = AvatarPackageSchema.parse(packageData);
  const adapter = ADAPTERS[target];

  if (!adapter) {
    throw new Error(
      `Unknown target: ${target}. Supported: ${Object.keys(ADAPTERS).join(', ')}`,
    );
  }

  return adapter(parsed);
}

/**
 * List all available compilation targets (host IDs).
 */
export function listTargets(): string[] {
  return Object.keys(ADAPTERS);
}

export default { compile, listTargets };
