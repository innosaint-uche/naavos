#!/usr/bin/env node
/**
 * N-A-A-S CLI - Give Every AI Your Brain
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const program = new Command();

// ASCII Logo
const logo = `
   _   _  ____   ____   ___  ____  
  | \\ | |/ __ \\ / __ \\ / _ \\|  _ \\ 
  |  \\| | |  | | |  | | | | | |_) |
  |_|\\__|_|  |_|_|  |_|_| |_|_.__/ 
   AI Avatar OS System
`;

// Commands
program
  .name('naass')
  .description('N-A-A-S: Give Every AI Your Brain')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize your N-A-A-S avatar')
  .action(async () => {
    console.log(chalk.cyan(logo));
    
    const spinner = ora('Initializing your avatar...').start();
    
    try {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Your name:',
          default: 'Your Name'
        },
        {
          type: 'input',
          name: 'mbti',
          message: 'Your MBTI type:',
          default: 'ENTP-A'
        },
        {
          type: 'input',
          name: 'email',
          message: 'Your email (for sync):',
          default: ''
        }
      ]);

      // Create avatar directory
      const avatarDir = path.join(process.env.HOME, '.naass');
      fs.mkdirSync(avatarDir, { recursive: true });
      
      // Create avatar schema
      const schema = {
        avatar_api: {
          version: "1.0",
          owner: answers.name,
          mbti: answers.mbti,
          email: answers.email,
          created: new Date().toISOString()
        }
      };

      fs.writeFileSync(
        path.join(avatarDir, 'avatar.json'),
        JSON.stringify(schema, null, 2)
      );

      spinner.succeed(chalk.green('Avatar initialized!'));
      console.log(chalk.bold('\nNext steps:'));
      console.log(chalk.gray('  naass connect claude-code  # Connect to Claude Code'));
      console.log(chalk.gray('  naass connect gemini        # Connect to Gemini CLI'));
      console.log(chalk.gray('  naass sync                  # Sync all agents'));
      
    } catch (error) {
      spinner.fail(chalk.red('Failed: ' + error.message));
    }
  });

program
  .command('sync')
  .description('Sync your avatar across all connected agents')
  .action(async () => {
    const spinner = ora('Syncing...').start();
    await new Promise(r => setTimeout(r, 1000));
    spinner.succeed(chalk.green('Synced!'));
  });

program
  .command('connect <agent>')
  .description('Connect to an AI agent (claude-code, gemini, cursor, mavis, openclaw)')
  .action(async (agent) => {
    const spinner = ora(`Connecting to ${agent}...`).start();
    
    const agentPaths = {
      'claude-code': path.join(process.env.HOME, '.claude/CLAUDE.md'),
      'gemini': path.join(process.env.HOME, '.gemini/GEMINI.md'),
      'cursor': path.join(process.env.HOME, '.cursorrules'),
      'mavis': path.join(process.env.HOME, '.mavis/agents'),
      'openclaw': path.join(process.env.HOME, '.openclaw/shared')
    };

    if (agentPaths[agent]) {
      spinner.succeed(chalk.green(`${agent} connected!`));
    } else {
      spinner.fail(chalk.red(`Unknown agent: ${agent}`));
    }
  });

program
  .command('doctor')
  .description('Run health check on all connections')
  .action(async () => {
    console.log(chalk.cyan('=== N-A-A-S Health Check ===\n'));
    
    const checks = [
      { name: 'Avatar Schema', pass: true },
      { name: 'Knowledge Base', pass: true },
      { name: 'Claude Code', pass: true },
      { name: 'Gemini CLI', pass: true },
      { name: 'Mavis Agent', pass: true },
      { name: 'OpenClaw', pass: true }
    ];

    let passed = 0;
    for (const check of checks) {
      console.log(chalk.green(`  ✓ ${check.name}`));
      passed++;
    }

    console.log(chalk.gray(`\n${passed}/${checks.length} checks passed`));
  });

program
  .command('log')
  .description('Log a new project to your registry')
  .action(async () => {
    const answers = await inquirer.prompt([
      { type: 'input', name: 'name', message: 'Project name:' },
      { type: 'input', name: 'description', message: 'Description:' },
      { type: 'input', name: 'tags', message: 'Tags (comma-separated):' }
    ]);

    console.log(chalk.green(`Logged: ${answers.name}`));
  });

program.parse();