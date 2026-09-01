/**
 * Type definitions for the NAAvOS CLI.
 */

export interface JournalEntry {
  id: string;
  target: string;
  created_at: string;
  package_id?: string;
  files: string[];
  /** Project root for non-Hermes targets (null for Hermes) */
  project_root?: string | null;
}

export interface CompileOptions {
  target?: string;
  dryRun?: boolean;
  format?: string;
}

export interface ExportOptions {
  target?: string;
  output?: string;
}

export interface InstallOptions {
  target?: string;
  dryRun?: boolean;
}

export interface RollbackOptions {
  id?: string;
}

export interface TestOptions {
  pack?: string;
  json?: boolean;
}
