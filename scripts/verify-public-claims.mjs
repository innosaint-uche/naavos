import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const page = readFileSync(resolve('apps/dashboard/src/app/page.tsx'), 'utf8');
const readme = readFileSync(resolve('README.md'), 'utf8');

const requiredClaims = [
  ['Hermes', 'Local verified'],
  ['Claude Code', 'Adapter available'],
  ['Cursor', 'Adapter available'],
  ['Gemini', 'Adapter available'],
  ['OpenClaw', 'Adapter available'],
  ['ReMe', 'Optional projection'],
];

for (const [target, status] of requiredClaims) {
  if (!page.includes(`name: '${target}'`) || !page.includes(`status: '${status}'`)) {
    throw new Error(`Public evidence label missing or changed for ${target}: ${status}`);
  }
}

if (page.includes("status: 'Supported'")) {
  throw new Error('Unqualified Supported status is prohibited in the public dashboard');
}

if (!page.includes('host certification is verified separately')) {
  throw new Error('Public dashboard must explain that host certification is a separate evidence layer');
}

if (!readme.includes('Available Adapters and Evidence Status')) {
  throw new Error('README must use evidence-calibrated adapter language');
}

if (readme.includes('## Supported Targets')) {
  throw new Error('Unqualified Supported Targets heading is prohibited in the README');
}

console.log(JSON.stringify({ status: 'pass', check: 'public-claims' }));
