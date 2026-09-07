import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const configuredEntry = packageJson.bin?.naavos;
const expectedEntry = 'packages/cli/bin/naavos.js';

if (configuredEntry !== expectedEntry) {
  throw new Error(`Root naavos bin must point to ${expectedEntry}`);
}

const output = execFileSync('pnpm', ['exec', 'naavos', '--version'], {
  cwd: root,
  encoding: 'utf8',
}).trim();

if (!/^\d+\.\d+\.\d+$/.test(output)) {
  throw new Error(`Root naavos entrypoint returned an invalid version: ${output}`);
}

console.log(JSON.stringify({ status: 'pass', command: 'naavos --version', version: output }));
