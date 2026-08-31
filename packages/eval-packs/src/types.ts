/**
 * Type definitions for NAAvOS eval packs.
 * These describe the on-disk `pack.json` format and scenario types.
 */

export type ScenarioType =
  | 'schema_valid'
  | 'uuid_fields_present'
  | 'adapter_compiles'
  | 'rule_present'
  | 'forbidden_pattern_absent'
  | 'privacy_consent_set';

interface ScenarioBase {
  id: string;
  description?: string;
}

export type Scenario =
  | (ScenarioBase & { type: 'schema_valid' })
  | (ScenarioBase & { type: 'uuid_fields_present' })
  | (ScenarioBase & { type: 'adapter_compiles'; targets?: string[] })
  | (ScenarioBase & { type: 'rule_present'; rule_id: string })
  | (ScenarioBase &
      {
        type: 'forbidden_pattern_absent';
        adapter?: string;
        pattern: string;
      })
  | (ScenarioBase &
      {
        type: 'privacy_consent_set';
        consent_key: string;
        expected: boolean;
      });

export interface EvalPack {
  name: string;
  version: string;
  description?: string;
  scenarios: Scenario[];
}

export interface ScenarioResult {
  id: string;
  type: string;
  pass: boolean;
  evidence: string;
}

export interface EvalResult {
  packId: string;
  packName: string;
  total: number;
  passed: number;
  failed: number;
  score: number;
  results: ScenarioResult[];
}
