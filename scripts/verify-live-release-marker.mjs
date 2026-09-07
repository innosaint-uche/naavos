import { execFileSync } from 'node:child_process';

const endpoint = 'https://naavos.radoss.agency/release.json';
const expected = JSON.parse(
  execFileSync(process.execPath, ['scripts/write-release-manifest.mjs', '--print'], {
    encoding: 'utf8',
  })
);

const response = await fetch(endpoint, { signal: AbortSignal.timeout(15_000) });
if (!response.ok) throw new Error(`Live release marker returned HTTP ${response.status}`);
const actual = await response.json();

if (
  actual.product !== 'NAAvOS' ||
  actual.surface !== 'public-dashboard' ||
  actual.source_marker !== expected.source_marker
) {
  throw new Error(
    `Live release marker mismatch: expected ${expected.source_marker}, received ${actual.source_marker || 'missing'}`
  );
}

console.log(
  JSON.stringify({
    status: 'pass',
    endpoint,
    source_marker: actual.source_marker,
    source_marker_kind: 'content-derived',
  })
);
