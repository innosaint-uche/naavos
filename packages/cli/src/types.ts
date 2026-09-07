/**
 * Type definitions for the NAAvOS CLI.
 */

export interface JournalEntry {
  id: string;
  target: string;
  created_at: string;
  package_id?: string;
  files: string[];
  /** Files that were written by the installation and must be removed on rollback. */
  managed_files?: string[];
  /** Version 2 contains a snapshot of the pre-install target state. */
  snapshot_version?: 2 | 3;
  /** Version 3 can snapshot more than one managed root, such as ReMe plus Hermes. */
  locations?: BackupLocation[];
  /** Project root for non-Hermes targets (null for Hermes) */
  project_root?: string | null;
}

export interface BackupLocation {
  root: string;
  backup_prefix: string;
  files: string[];
  managed_files: string[];
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
