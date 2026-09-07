import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const root = resolve(process.cwd());
const outputPath = resolve(root, 'apps/dashboard/public/release.json');
const sourceRoots = [
  'apps/dashboard/src',
  'apps/dashboard/next.config.mjs',
  'apps/dashboard/package.json',
  'apps/dashboard/postcss.config.js',
  'apps/dashboard/tailwind.config.js',
  'package.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'turbo.json',
];

const files = [];
const collect = (relativePath) => {
  const absolutePath = resolve(root, relativePath);
  if (!existsSync(absolutePath)) throw new Error(`Release source path is missing: ${relativePath}`);
  const stats = statSync(absolutePath);
  if (stats.isDirectory()) {
    for (const entry of readdirSync(absolutePath).sort()) collect(join(relativePath, entry));
    return;
  }
  files.push(relativePath.replaceAll('\\', '/'));
};

for (const sourceRoot of sourceRoots) collect(sourceRoot);

const hash = createHash('sha256');
for (const file of files.sort()) {
  hash.update(file);
  hash.update('\0');
  hash.update(readFileSync(resolve(root, file)));
  hash.update('\0');
}

const manifest = {
  product: 'NAAvOS',
  surface: 'public-dashboard',
  source_marker: hash.digest('hex'),
  source_files: files,
};

if (process.argv.includes('--print')) {
  console.log(JSON.stringify(manifest, null, 2));
} else {
  mkdirSync(resolve(root, 'apps/dashboard/public'), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(JSON.stringify({ status: 'pass', output: relative(root, outputPath), ...manifest }));
}
