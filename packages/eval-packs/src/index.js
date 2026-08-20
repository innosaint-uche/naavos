import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AvatarPackageSchema } from '@naavos/schema';
import { compile, listTargets } from '@naavos/compiler';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKS_DIR = path.join(__dirname, '..', 'packs');

export function loadPack(packId) {
  const packPath = path.join(PACKS_DIR, packId, 'pack.json');
  if (!fs.existsSync(packPath)) {
    throw new Error(`Eval pack not found: ${packId}`);
  }
  return JSON.parse(fs.readFileSync(packPath, 'utf-8'));
}

export function listPacks() {
  if (!fs.existsSync(PACKS_DIR)) return [];
  return fs.readdirSync(PACKS_DIR).filter(name => {
    const p = path.join(PACKS_DIR, name, 'pack.json');
    return fs.existsSync(p);
  });
}

export async function runEval(packId, avatarData) {
  const pack = loadPack(packId);
  const parsed = AvatarPackageSchema.parse(avatarData);
  const results = [];

  for (const scenario of pack.scenarios) {
    const result = await runScenario(scenario, parsed);
    results.push(result);
  }

  const passed = results.filter(r => r.pass).length;
  const total = results.length;
  const score = total === 0 ? 0 : Math.round((passed / total) * 100);

  return {
    packId,
    packName: pack.name,
    total,
    passed,
    failed: total - passed,
    score,
    results
  };
}

export async function runScenario(scenario, avatar) {
  const ctx = { avatar, scenario };
  let pass = false;
  let evidence = [];

  switch (scenario.type) {
    case 'schema_valid':
      try {
        AvatarPackageSchema.parse(ctx.avatar);
        pass = true;
        evidence.push('Avatar package parses against Zod schema');
      } catch (e) {
        evidence.push(`Schema error: ${e.errors?.map(i => i.path.join('.') + ': ' + i.message).join('; ') || e.message}`);
      }
      break;

    case 'adapter_compiles': {
      const targets = scenario.targets || ctx.avatar.adapters.map(a => a.host_id);
      const failures = [];
      for (const target of targets) {
        try {
          compile(ctx.avatar, target);
        } catch (e) {
          failures.push(`${target}: ${e.message}`);
        }
      }
      pass = failures.length === 0;
      evidence.push(failures.length ? failures : `All adapters compiled: ${targets.join(', ')}`);
      break;
    }

    case 'rule_present': {
      const ruleId = scenario.rule_id;
      const rule = ctx.avatar.operating_rules.find(r => r.id === ruleId);
      pass = !!rule;
      evidence.push(pass ? `Rule ${ruleId} found` : `Rule ${ruleId} missing`);
      break;
    }

    case 'forbidden_pattern_absent': {
      const target = scenario.adapter || ctx.avatar.adapters[0]?.host_id;
      const files = compile(ctx.avatar, target);
      const pattern = new RegExp(scenario.pattern, 'i');
      const hits = [];
      for (const [, content] of files) {
        if (pattern.test(content)) hits.push(target);
      }
      pass = hits.length === 0;
      evidence.push(pass ? `No forbidden pattern in ${target}` : `Forbidden pattern found in ${hits.join(', ')}`);
      break;
    }

    case 'privacy_consent_set': {
      const key = scenario.consent_key;
      const value = scenario.expected;
      const actual = ctx.avatar.privacy?.consents?.[key];
      pass = actual === value;
      evidence.push(`Privacy consent ${key}: expected ${value}, got ${actual}`);
      break;
    }

    case 'uuid_fields_present': {
      const pid = ctx.avatar.metadata?.package_id;
      const oid = ctx.avatar.metadata?.owner_id;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      pass = uuidRegex.test(pid) && uuidRegex.test(oid);
      evidence.push(`package_id=${!!pid}, owner_id=${!!oid}`);
      break;
    }

    default:
      pass = false;
      evidence.push(`Unknown scenario type: ${scenario.type}`);
  }

  return {
    id: scenario.id,
    type: scenario.type,
    pass,
    evidence: evidence.join('; ')
  };
}

export default { loadPack, listPacks, runEval, runScenario };
