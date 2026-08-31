import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { compile } from '@naavos/compiler';
import { AvatarPackageSchema } from '@naavos/schema';
import type { AvatarPackage } from '@naavos/schema';

import type { EvalPack, EvalResult, Scenario, ScenarioResult } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKS_DIR = path.join(__dirname, '..', 'packs');

/**
 * Load an eval pack by its directory name from the packs/ directory.
 */
export function loadPack(packId: string): EvalPack {
  const packPath = path.join(PACKS_DIR, packId, 'pack.json');
  if (!fs.existsSync(packPath)) {
    throw new Error(`Eval pack not found: ${packId}`);
  }
  return JSON.parse(fs.readFileSync(packPath, 'utf-8')) as EvalPack;
}

/**
 * List all available eval pack IDs (subdirectories of packs/ containing pack.json).
 */
export function listPacks(): string[] {
  if (!fs.existsSync(PACKS_DIR)) return [];
  return fs
    .readdirSync(PACKS_DIR)
    .filter((name) => fs.existsSync(path.join(PACKS_DIR, name, 'pack.json')));
}

/**
 * Run a single eval pack against an avatar package.
 * Passes raw (unparsed) avatar data to each scenario so that
 * `schema_valid` can actually test validation.
 */
export async function runEval(packId: string, avatarData: unknown): Promise<EvalResult> {
  const pack = loadPack(packId);

  const results: ScenarioResult[] = [];

  for (const scenario of pack.scenarios) {
    const result = await runScenario(scenario, avatarData);
    results.push(result);
  }

  const passed = results.filter((r) => r.pass).length;
  const total = results.length;
  const score = total === 0 ? 0 : Math.round((passed / total) * 100);

  return {
    packId,
    packName: pack.name,
    total,
    passed,
    failed: total - passed,
    score,
    results,
  };
}

/**
 * Execute a single scenario against an avatar.
 *
 * The `schema_valid` scenario parses the avatar itself (and can fail).
 * All other scenarios require a schema-valid avatar; if parsing fails,
 * they report the parse error as a scenario failure.
 */
export async function runScenario(
  scenario: Scenario,
  avatar: unknown,
): Promise<ScenarioResult> {
  // schema_valid tests parsing independently
  if (scenario.type === 'schema_valid') {
    try {
      AvatarPackageSchema.parse(avatar);
      return {
        id: scenario.id,
        type: scenario.type,
        pass: true,
        evidence: 'Avatar package parses against Zod schema',
      };
    } catch (e) {
      return {
        id: scenario.id,
        type: scenario.type,
        pass: false,
        evidence: formatZodError(e),
      };
    }
  }

  // All other scenarios need a parsed avatar
  let parsed: AvatarPackage;
  try {
    parsed = AvatarPackageSchema.parse(avatar) as AvatarPackage;
  } catch (e) {
    return {
      id: scenario.id,
      type: scenario.type,
      pass: false,
      evidence: `Cannot run scenario: ${formatZodError(e)}`,
    };
  }

  const evidence: string[] = [];
  let pass = false;

  switch (scenario.type) {
    case 'adapter_compiles': {
      const targets = scenario.targets ?? parsed.adapters.map((a) => a.host_id);
      const failures: string[] = [];
      for (const target of targets) {
        try {
          compile(parsed, target);
        } catch (e) {
          failures.push(`${target}: ${(e as Error).message}`);
        }
      }
      pass = failures.length === 0;
      evidence.push(
        failures.length
          ? failures.join('; ')
          : `All adapters compiled: ${targets.join(', ')}`,
      );
      break;
    }

    case 'rule_present': {
      const ruleId = scenario.rule_id;
      const rule = parsed.operating_rules.find((r) => r.id === ruleId);
      pass = !!rule;
      evidence.push(pass ? `Rule ${ruleId} found` : `Rule ${ruleId} missing`);
      break;
    }

    case 'forbidden_pattern_absent': {
      const target = scenario.adapter ?? parsed.adapters[0]?.host_id ?? 'hermes';
      const files = compile(parsed, target);
      const pattern = new RegExp(scenario.pattern, 'i');
      const hits: string[] = [];
      for (const [, content] of files) {
        if (pattern.test(content)) hits.push(target);
      }
      pass = hits.length === 0;
      evidence.push(
        pass
          ? `No forbidden pattern in ${target}`
          : `Forbidden pattern found in ${hits.join(', ')}`,
      );
      break;
    }

    case 'privacy_consent_set': {
      const key = scenario.consent_key;
      const value = scenario.expected;
      const consentKey = key as keyof typeof parsed.privacy.consents;
      const actual = parsed.privacy.consents[consentKey];
      pass = actual === value;
      evidence.push(`Privacy consent ${key}: expected ${value}, got ${actual}`);
      break;
    }

    case 'uuid_fields_present': {
      const pid = parsed.metadata?.package_id ?? '';
      const oid = parsed.metadata?.owner_id ?? '';
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      pass = uuidRegex.test(pid) && uuidRegex.test(oid);
      evidence.push(`package_id=${!!pid}, owner_id=${!!oid}`);
      break;
    }

    default:
      pass = false;
      evidence.push(`Unknown scenario type: ${(scenario as { type: string }).type}`);
  }

  return {
    id: scenario.id,
    type: scenario.type,
    pass,
    evidence: evidence.join('; '),
  };
}

function formatZodError(e: unknown): string {
  if (e && typeof e === 'object' && 'errors' in e) {
    const zodErr = e as { errors: { path: (string | number)[]; message: string }[] };
    return `Schema error: ${zodErr.errors.map((i) => `${i.path.join('.')} : ${i.message}`).join('; ')}`;
  }
  return `Error: ${(e as Error).message}`;
}

export default { loadPack, listPacks, runEval, runScenario };
