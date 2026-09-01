#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { PassThrough } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createGzip } from 'node:zlib';

import { compile, listTargets } from '@naavos/compiler';
import type { FileMap } from '@naavos/compiler';
import { listPacks, runEval } from '@naavos/eval-packs';
import { AvatarPackageSchema } from '@naavos/schema';
import type { AvatarPackage } from '@naavos/schema';
import chalk from 'chalk';
import { Command } from 'commander';
import inquirer from 'inquirer';
import ora from 'ora';

import type { JournalEntry } from './types.js';

const program = new Command();

const logo = `
   _   _  ____   ____   ___  ____  
  | \\ | |/ __ \\ / __ \\ / _ \\|  _ \\ 
  |  \\| | |  | | |  | | | | | |_) |
  | |\\__| |  | |  |  | | | | | |_) |
  |  \\/|_\\  | |_| |  |_|_| |_|_.__/ 
  |  |  |  | |_| | |_| | | | |    
  |  |  |  |  |_| | |_| | |_| |    
  |__|  |__\\____\\___/ \\___/|____/ 
   AI Avatar OS System
`;

program.name('naavos').description('NAAvOS: Give Every AI Your Brain').version('1.0.0');

function getAvatarPath(): string {
  return path.join(process.env['HOME'] ?? '', '.naavos', 'avatar.json');
}

function loadAvatar(): unknown {
  const avatarPath = getAvatarPath();
  if (!fs.existsSync(avatarPath)) {
    throw new Error('No avatar found. Run `naavos init` first.');
  }
  return JSON.parse(fs.readFileSync(avatarPath, 'utf-8'));
}

function getBackupsDir(): string {
  return path.join(process.env['HOME'] ?? '', '.naavos', 'backups');
}

function getBackupJournalPath(): string {
  return path.join(getBackupsDir(), 'journal.json');
}

function loadJournal(): JournalEntry[] {
  const journalPath = getBackupJournalPath();
  if (!fs.existsSync(journalPath)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(journalPath, 'utf-8')) as JournalEntry[];
}

function saveJournal(journal: JournalEntry[]): void {
  fs.mkdirSync(path.dirname(getBackupJournalPath()), { recursive: true });
  fs.writeFileSync(getBackupJournalPath(), JSON.stringify(journal, null, 2));
}

async function createBackup(target: string, data: AvatarPackage): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupId = `${timestamp}-${target}`;
  const backupDir = path.join(getBackupsDir(), backupId);
  fs.mkdirSync(backupDir, { recursive: true });

  const files = compile(data, target);
  for (const [relativePath, content] of files) {
    const dest = path.join(backupDir, relativePath);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, content);
  }

  const journal = loadJournal();
  journal.unshift({
    id: backupId,
    target,
    created_at: new Date().toISOString(),
    package_id: data.metadata?.package_id,
    files: Array.from(files.keys()),
    project_root: target === 'hermes' ? null : process.cwd(),
  });
  saveJournal(journal);

  return backupId;
}

async function restoreBackup(backupId: string): Promise<string> {
  const backupDir = path.join(getBackupsDir(), backupId);
  if (!fs.existsSync(backupDir)) {
    throw new Error(`Backup not found: ${backupId}`);
  }

  const journal = loadJournal();
  const journalEntry = journal.find((j) => j.id === backupId);
  if (!journalEntry) {
    throw new Error(`Backup not found in journal: ${backupId}`);
  }

  const target = journalEntry.target;

  // Determine restore destination based on target
  let destRoot: string;
  if (target === 'hermes') {
    destRoot = process.env['HERMES_HOME'] || path.join(process.env['HOME'] ?? '', '.hermes');
  } else if (journalEntry.project_root) {
    destRoot = journalEntry.project_root;
  } else {
    // Fallback: use current working directory for non-Hermes targets
    destRoot = process.cwd();
  }

  const entries = fs.readdirSync(backupDir, { withFileTypes: true, recursive: true });
  let restoredCount = 0;
  for (const fsEntry of entries) {
    if (fsEntry.isFile()) {
      const fullPath = path.join(fsEntry.parentPath || backupDir, fsEntry.name);
      const relativePath = path.relative(backupDir, fullPath);
      const dest = path.join(destRoot, relativePath);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, fs.readFileSync(fullPath, 'utf-8'));
      restoredCount++;
    }
  }

  if (restoredCount === 0) {
    throw new Error(`No files found in backup ${backupId}`);
  }

  return destRoot;
}

function listBackups(): JournalEntry[] {
  return loadJournal();
}

function walkDir(dir: string, base: string, files: Map<string, string>): void {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(base, fullPath);
    if (entry.isDirectory()) {
      walkDir(fullPath, base, files);
    } else if (entry.isFile()) {
      files.set(relativePath, fs.readFileSync(fullPath, 'utf-8'));
    }
  }
}

async function createTarGz(files: FileMap, outputPath: string): Promise<void> {
  const tarParts: Buffer[] = [];

  for (const [filePath, content] of files) {
    const contentBuffer = Buffer.from(content, 'utf-8');
    const header = Buffer.alloc(512);

    const nameBytes = Buffer.from(filePath, 'utf-8');
    nameBytes.copy(header, 0, 0, Math.min(100, nameBytes.length));

    const mode = Buffer.alloc(8);
    mode.write('0000644', 0, 7, 'ascii');
    mode.copy(header, 100);

    const uid = Buffer.alloc(8);
    uid.write('0000000', 0, 7, 'ascii');
    uid.copy(header, 108);

    const gid = Buffer.alloc(8);
    gid.write('0000000', 0, 7, 'ascii');
    gid.copy(header, 116);

    const size = Buffer.alloc(12);
    size.write(contentBuffer.length.toString(8).padStart(11, '0'), 0, 11, 'ascii');
    size.copy(header, 124);

    const mtime = Buffer.alloc(12);
    mtime.write('00000000000', 0, 11, 'ascii');
    mtime.copy(header, 136);

    header.fill(' ', 148, 156);

    Buffer.from('ustar', 'ascii').copy(header, 257, 0, 5);
    Buffer.from('00', 'ascii').copy(header, 262, 0, 2);

    let checksum = 0;
    for (let i = 0; i < 512; i++) {
      checksum += header[i] ?? 0;
    }
    const checksumStr = checksum.toString(8).padStart(6, '0');
    header.write(checksumStr, 148, 6, 'ascii');
    header.write('\0', 154, 1);
    header.write(' ', 155, 1);

    tarParts.push(header);

    const paddedLength = Math.ceil(contentBuffer.length / 512) * 512;
    const paddedContent = Buffer.concat([
      contentBuffer,
      Buffer.alloc(paddedLength - contentBuffer.length),
    ]);
    tarParts.push(paddedContent);
  }

  tarParts.push(Buffer.alloc(1024));

  const tarBuffer = Buffer.concat(tarParts);

  const pass = new PassThrough();
  pass.write(tarBuffer);
  pass.end();

  await pipeline(pass, createGzip(), fs.createWriteStream(outputPath));
}

program
  .command('init')
  .description('Initialize your NAAvOS avatar')
  .action(async () => {
    console.log(chalk.cyan(logo));

    const spinner = ora('Initializing your avatar...').start();

    try {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Your name:',
          default: 'Your Name',
        },
        {
          type: 'input',
          name: 'style',
          message: 'Communication style (concise / detailed / balanced):',
          default: 'concise',
        },
        {
          type: 'input',
          name: 'rules',
          message: 'Top 3 operating rules (comma-separated):',
          default:
            'Execute 70% faster, Zero fluff, Cite evidence before claiming completion',
        },
        {
          type: 'list',
          name: 'target',
          message: 'Primary AI runtime:',
          choices: listTargets(),
        },
      ]) as {
        name: string;
        style: string;
        rules: string;
        target: string;
      };

      const avatarDir = path.join(process.env['HOME'] ?? '', '.naavos');
      fs.mkdirSync(avatarDir, { recursive: true });

      const schema = {
        metadata: {
          package_id: crypto.randomUUID(),
          owner_id: crypto.randomUUID(),
          schema_version: '1.0.0',
          semantic_version: '1.0.0',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          source_provenance: 'created-from-cli',
        },
        identity: {
          name: answers.name,
          roles: [],
        },
        communication: {
          tone: 'Direct, authoritative',
          structure: 'Bulleted, action-oriented',
          verbosity: answers.style,
        },
        operating_rules: answers.rules
          .split(',')
          .map((r) => r.trim())
          .filter(Boolean)
          .map((statement, idx) => ({
            id: `rule.${idx}`,
            statement,
            priority: 80 - idx,
            tests: [],
          })),
        privacy: {
          consents: {
            'allow-cloud-sync': false,
            'allow-telemetry': false,
          },
        },
        adapters: [
          {
            host_id: answers.target,
            min_adapter_version: '1.0.0',
            unsupported_behaviour_policy: 'warn',
          },
        ],
        evals: [],
      };

      fs.writeFileSync(
        path.join(avatarDir, 'avatar.json'),
        JSON.stringify(schema, null, 2),
      );

      spinner.succeed(chalk.green('Avatar initialized!'));
      console.log(chalk.bold('\nNext steps:'));
      console.log(chalk.gray('  naavos validate            # Validate your avatar'));
      console.log(chalk.gray('  naavos compile             # Compile for your target'));
      console.log(chalk.gray('  naavos install             # Install into your AI tool'));
    } catch (error) {
      spinner.fail(chalk.red('Failed: ' + (error as Error).message));
    }
  });

program
  .command('validate')
  .description('Validate your avatar package')
  .action(() => {
    const spinner = ora('Validating avatar...').start();
    try {
      const data = loadAvatar();
      AvatarPackageSchema.parse(data);
      spinner.succeed(chalk.green('Avatar package is valid.'));
    } catch (error) {
      spinner.fail(chalk.red('Validation failed:'));
      const e = error as { errors?: { path: (string | number)[]; message: string }[] };
      console.error(
        e.errors?.map((err) => `  - ${err.path.join('.')}: ${err.message}`).join('\n') ||
          (error as Error).message,
      );
      process.exit(1);
    }
  });

program
  .command('compile')
  .description('Compile avatar for a target runtime')
  .option('--target <id>', 'Target runtime ID')
  .option('--dry-run', 'Print output without writing files')
  .option('--format <id>', 'Output format: files (default) or tar.gz (Hermes only)')
  .option('--template-dir <path>', 'Override Hermes template directory')
  .action(async (options: { target?: string; dryRun?: boolean; format?: string; templateDir?: string }) => {
    const spinner = ora('Compiling avatar...').start();
    try {
      if (options.templateDir) {
        process.env['NAAVOS_TEMPLATE_DIR'] = options.templateDir;
      }
      const data = loadAvatar();
      AvatarPackageSchema.parse(data);
      const parsed = data as AvatarPackage;

      const target = options.target || parsed.adapters?.[0]?.host_id;
      if (!target) {
        throw new Error(
          'No target specified. Use --target or set adapters in avatar.json.',
        );
      }

      const files = compile(parsed, target);

      if (options.dryRun) {
        console.log(chalk.cyan(`\nCompiled output for target: ${target}\n`));
        for (const [filePath, content] of files) {
          console.log(chalk.gray(`--- ${filePath} ---`));
          console.log(content);
        }
        spinner.succeed(chalk.green('Dry-run complete.'));
        return;
      }

      if (options.format === 'tar.gz') {
        if (target !== 'hermes') {
          throw new Error('tar.gz format is only supported for the Hermes target.');
        }
        const outputPath = path.join(
          process.env['HOME'] ?? '',
          '.naavos',
          'avatar-profile.tar.gz',
        );
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        await createTarGz(files, outputPath);
        spinner.succeed(
          chalk.green(`Exported Hermes profile bundle to ${outputPath}`),
        );
        return;
      }

      const outputDir = path.join(
        process.env['HOME'] ?? '',
        '.naavos',
        'compiled',
        target,
      );
      fs.mkdirSync(outputDir, { recursive: true });

      for (const [filePath, content] of files) {
        const fullPath = path.join(outputDir, filePath);
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, content);
      }

      spinner.succeed(
        chalk.green(`Compiled ${files.size} files to ${outputDir}`),
      );
    } catch (error) {
      spinner.fail(chalk.red('Compilation failed: ' + (error as Error).message));
      process.exit(1);
    }
  });

program
  .command('export')
  .description('Export compiled avatar as a Hermes profile bundle (.tar.gz)')
  .option('--target <id>', 'Target runtime ID (default: hermes)')
  .option('--output <path>', 'Output file path')
  .action(async (options: { target?: string; output?: string }) => {
    const spinner = ora('Exporting profile bundle...').start();
    try {
      const data = loadAvatar();
      const target = options.target || (data as AvatarPackage).adapters?.[0]?.host_id || 'hermes';

      if (target !== 'hermes') {
        throw new Error('Export is only supported for the Hermes target.');
      }

      const compiledDir = path.join(
        process.env['HOME'] ?? '',
        '.naavos',
        'compiled',
        target,
      );
      if (!fs.existsSync(compiledDir)) {
        const files = compile(data as AvatarPackage, target);
        const outputPath =
          options.output ||
          path.join(process.env['HOME'] ?? '', '.naavos', 'avatar-profile.tar.gz');
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        await createTarGz(files, outputPath);
        spinner.succeed(
          chalk.green(`Exported Hermes profile bundle to ${outputPath}`),
        );
      } else {
        const files = new Map<string, string>();
        walkDir(compiledDir, compiledDir, files);
        const outputPath =
          options.output ||
          path.join(process.env['HOME'] ?? '', '.naavos', 'avatar-profile.tar.gz');
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        await createTarGz(files, outputPath);
        spinner.succeed(
          chalk.green(`Exported Hermes profile bundle to ${outputPath}`),
        );
      }
    } catch (error) {
      spinner.fail(chalk.red('Export failed: ' + (error as Error).message));
      process.exit(1);
    }
  });

program
  .command('install')
  .description('Install compiled avatar into target')
  .option('--target <id>', 'Target runtime ID')
  .option('--dry-run', 'Show what would be installed')
  .action(async (options: { target?: string; dryRun?: boolean }) => {
    const spinner = ora('Installing avatar...').start();
    try {
      const data = loadAvatar();
      const target = options.target || (data as AvatarPackage).adapters?.[0]?.host_id;
      if (!target) {
        throw new Error('No target specified.');
      }

      const compiledDir = path.join(
        process.env['HOME'] ?? '',
        '.naavos',
        'compiled',
        target,
      );
      if (!fs.existsSync(compiledDir)) {
        throw new Error(
          `Nothing compiled for target "${target}". Run naavos compile --target ${target} first.`,
        );
      }

      if (target === 'hermes') {
        const hermesHome =
          process.env['HERMES_HOME'] || path.join(process.env['HOME'] ?? '', '.hermes');

        if (!options.dryRun) {
          const backupId = await createBackup(target, data as AvatarPackage);
          console.log(chalk.gray(`Backup created: ${backupId}`));
        }

        const files = compile(data as AvatarPackage, target);
        for (const [relativePath, content] of files) {
          const dest = path.join(hermesHome, relativePath);
          if (options.dryRun) {
            console.log(chalk.gray(`Would write: ${dest}`));
          } else {
            fs.mkdirSync(path.dirname(dest), { recursive: true });
            fs.writeFileSync(dest, content);
          }
        }
        spinner.succeed(
          chalk.green(
            options.dryRun
              ? 'Dry-run complete.'
              : `Installed into ${hermesHome}`,
          ),
        );
      } else if (target === 'reme') {
        const projectRoot = process.cwd();
        const files = compile(data as AvatarPackage, target);
        for (const [relativePath, content] of files) {
          const dest = path.join(projectRoot, relativePath);
          if (options.dryRun) {
            console.log(chalk.gray(`Would write: ${dest}`));
          } else {
            fs.mkdirSync(path.dirname(dest), { recursive: true });
            fs.writeFileSync(dest, content);
          }
        }

        const hermesSkill = path.join(projectRoot, 'skills', 'reme_memory', 'SKILL.md');
        const hermesHome =
          process.env['HERMES_HOME'] || path.join(process.env['HOME'] ?? '', '.hermes');
        const destSkill = path.join(hermesHome, 'skills', 'reme_memory', 'SKILL.md');
        if (fs.existsSync(hermesSkill)) {
          fs.mkdirSync(path.dirname(destSkill), { recursive: true });
          fs.copyFileSync(hermesSkill, destSkill);
          console.log(
            chalk.gray(`Installed ReMe skill into Hermes: ${destSkill}`),
          );
        }

        spinner.succeed(
          chalk.green(
            options.dryRun
              ? 'Dry-run complete.'
              : `Installed ReMe config into ${projectRoot}`,
          ),
        );
      } else {
        spinner.fail(
          chalk.yellow(
            `Direct install for target "${target}" is not implemented yet. Copy files from ${compiledDir} manually.`,
          ),
        );
      }
    } catch (error) {
      spinner.fail(chalk.red('Installation failed: ' + (error as Error).message));
      process.exit(1);
    }
  });

program
  .command('doctor')
  .description('Run health check')
  .action(() => {
    console.log(chalk.cyan('=== NAAvOS Health Check ===\n'));
    const checks: { name: string; pass: boolean }[] = [];
    try {
      const avatarPath = getAvatarPath();
      checks.push({ name: 'Avatar file exists', pass: fs.existsSync(avatarPath) });
      const data = loadAvatar();
      AvatarPackageSchema.parse(data);
      checks.push({ name: 'Avatar schema valid', pass: true });
      checks.push({
        name: 'Target adapters defined',
        pass: (data as AvatarPackage).adapters?.length > 0,
      });
    } catch {
      checks.push({ name: 'Avatar schema valid', pass: false });
    }

    for (const check of checks) {
      const icon = check.pass ? chalk.green('✓') : chalk.red('✗');
      console.log(`  ${icon} ${check.name}`);
    }

    const passed = checks.filter((c) => c.pass).length;
    console.log(chalk.gray(`\n${passed}/${checks.length} checks passed`));
  });

program
  .command('test')
  .description('Run conformance eval packs against your avatar')
  .option('--pack <id>', 'Specific eval pack to run')
  .option('--json', 'Output results as JSON')
  .action(async (options: { pack?: string; json?: boolean }) => {
    const spinner = ora('Running conformance tests...').start();
    try {
      const data = loadAvatar();
      AvatarPackageSchema.parse(data);

      const packs = options.pack ? [options.pack] : (data as AvatarPackage).evals || listPacks();
      if (packs.length === 0) {
        spinner.warn('No eval packs specified and none found in avatar.evals.');
        return;
      }

      const results = [];
      for (const packId of packs) {
        const result = await runEval(packId, data);
        results.push(result);
      }

      if (options.json) {
        console.log(JSON.stringify(results, null, 2));
        spinner.succeed('Test run complete.');
        return;
      }

      console.log(chalk.cyan('\n=== Conformance Results ===\n'));
      for (const result of results) {
        const color =
          result.score === 100
            ? chalk.green
            : result.score >= 80
              ? chalk.yellow
              : chalk.red;
        console.log(
          `${color(result.packName)} — ${result.passed}/${result.total} passed (${result.score}%)\n`,
        );
        for (const r of result.results) {
          const icon = r.pass ? chalk.green('✓') : chalk.red('✗');
          console.log(`  ${icon} ${r.id}: ${r.evidence}`);
        }
        console.log('');
      }

      const overallPassed = results.reduce((sum, r) => sum + r.passed, 0);
      const overallTotal = results.reduce((sum, r) => sum + r.total, 0);
      const overallScore =
        overallTotal === 0 ? 0 : Math.round((overallPassed / overallTotal) * 100);
      const overallColor =
        overallScore === 100 ? chalk.green : overallScore >= 80 ? chalk.yellow : chalk.red;

      spinner.succeed(
        overallColor(
          `Fidelity score: ${overallPassed}/${overallTotal} (${overallScore}%)`,
        ),
      );
    } catch (error) {
      spinner.fail(chalk.red('Test run failed: ' + (error as Error).message));
      process.exit(1);
    }
  });

program
  .command('backups')
  .description('List available backups')
  .action(() => {
    console.log(chalk.cyan('=== NAAvOS Backups ===\n'));
    const backups = listBackups();
    if (backups.length === 0) {
      console.log(chalk.yellow('No backups found.'));
      return;
    }
    for (const backup of backups) {
      console.log(chalk.gray(backup.id));
      console.log(`  Target: ${backup.target}`);
      console.log(`  Created: ${backup.created_at}`);
      console.log(`  Package: ${backup.package_id || 'unknown'}`);
      console.log(`  Files: ${backup.files?.length || 0}`);
      console.log('');
    }
  });

program
  .command('rollback')
  .description('Rollback a previous installation')
  .option('--id <backupId>', 'Specific backup ID to restore (default: most recent)')
  .action(async (options: { id?: string }) => {
    console.log(chalk.cyan('=== NAAvOS Rollback ===\n'));
    try {
      const backups = listBackups();
      if (backups.length === 0) {
        console.log(chalk.yellow('No backups found. Nothing to roll back.'));
        return;
      }

      const backupId = options.id || backups[0]?.id;
      if (!backupId) {
        console.log(chalk.red('No backups available.'));
        return;
      }
      const backup = backups.find((b) => b.id === backupId);
      if (!backup) {
        console.log(chalk.red(`Backup not found: ${backupId}`));
        console.log(chalk.gray('Available backups:'));
        for (const b of backups.slice(0, 10)) {
          console.log(
            chalk.gray(`  - ${b.id} (${b.target}, ${b.created_at})`),
          );
        }
        process.exit(1);
      }

      const spinner = ora(`Rolling back to ${backupId}...`).start();

      const dest = await restoreBackup(backupId);
      spinner.succeed(
        chalk.green(`Rolled back to ${backupId}. Restored to ${dest}`),
      );
    } catch (error) {
      console.log(chalk.red('Rollback failed: ' + (error as Error).message));
      process.exit(1);
    }
  });

export { program };
export {
  loadAvatar,
  loadJournal,
  saveJournal,
  createBackup,
  restoreBackup,
  listBackups,
  listTargets,
  createTarGz,
};
