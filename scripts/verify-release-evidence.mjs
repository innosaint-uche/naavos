import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readJson = (relativePath) =>
  JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
const release = readJson('docs/qa/RELEASE_EVIDENCE_CURRENT.json');
const routes = readJson('docs/qa/ROUTE_MATRIX.json');
const deploymentEvidence = fs.readFileSync(path.join(root, 'docs/DEPLOYMENT_EVIDENCE.md'), 'utf8');

const canonicalEndpoint = 'https://mcp.naavos.radoss.agency/mcp';
const retiredEndpoint = 'https://api.naavos.io/mcp/v1';
const hostedRoute = routes.routes.find((route) => route.service === 'hosted-mcp-gateway');
const requireArtifact = process.argv.includes('--require-artifact');
const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

const validateQaArtifact = () => {
  const artifactPath = release.current_qa?.artifact;
  if (!requireArtifact || typeof artifactPath !== 'string' || !fs.existsSync(artifactPath)) return;

  let summary;
  try {
    summary = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  } catch (error) {
    failures.push(`current QA artifact is not valid JSON: ${error.message}`);
    return;
  }

  assert(summary.status === 'pass', 'current QA artifact status is not pass');
  assert(Array.isArray(summary.adapters), 'current QA artifact has no adapter results');
  const declaredAdapters = [...new Set(release.current_qa.adapters || [])].sort();
  const recordedAdapters = Array.isArray(summary.adapters)
    ? summary.adapters.map((adapter) => adapter.adapter).sort()
    : [];
  assert(
    JSON.stringify(recordedAdapters) === JSON.stringify(declaredAdapters),
    `current QA adapters do not match the release manifest: ${recordedAdapters.join(', ')}`
  );

  for (const adapter of summary.adapters || []) {
    assert(adapter.status === 'pass', `QA adapter ${adapter.adapter} did not pass`);
    assert(adapter.exit_code === 0, `QA adapter ${adapter.adapter} did not exit successfully`);
    if (typeof adapter.evidence !== 'string') {
      failures.push(`QA adapter ${adapter.adapter} has no evidence path`);
      continue;
    }
    const evidencePath = path.resolve(root, adapter.evidence);
    assert(fs.existsSync(evidencePath), `QA adapter evidence is missing: ${evidencePath}`);
    if (!fs.existsSync(evidencePath)) continue;
    try {
      const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
      assert(evidence.status === 'pass', `QA evidence ${adapter.adapter} status is not pass`);
      assert(
        evidence.token_values_written !== true,
        `QA evidence ${adapter.adapter} reports token values written`
      );
    } catch (error) {
      failures.push(`QA adapter evidence is not valid JSON (${adapter.adapter}): ${error.message}`);
    }
  }
  const publicAdapter = (summary.adapters || []).find((adapter) => adapter.adapter === 'naas-public');
  if (publicAdapter?.evidence) {
    try {
      const evidencePath = path.resolve(root, publicAdapter.evidence);
      const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
      const checkNames = new Set((evidence.checks || []).filter((check) => check.status === 'pass').map((check) => check.name));
      for (const requiredCheck of [
        'browser.dashboard',
        'http.mcp-health',
        'http.oauth-protected-resource',
        'http.oauth-authorization-server',
        'http.release-identity',
        'mcp.unauthenticated-fail-closed',
      ]) {
        assert(checkNames.has(requiredCheck), `NAAvOS public QA is missing required check: ${requiredCheck}`);
      }
    } catch (error) {
      failures.push(`NAAvOS public QA contract could not be inspected: ${error.message}`);
    }
  }
};

const validatePackagedTauriEvidence = () => {
  const packaged = release.current_qa?.packaged_tauri_reverification;
  assert(packaged?.status === 'pass', 'current packaged Tauri re-verification is not pass');
  assert(Array.isArray(packaged?.artifacts), 'current packaged Tauri evidence has no artifact list');
  for (const artifactPath of packaged?.artifacts || []) {
    assert(fs.existsSync(artifactPath), `packaged Tauri evidence is missing: ${artifactPath}`);
    if (!fs.existsSync(artifactPath)) continue;
    try {
      const evidence = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
      assert(evidence.status === 'pass', `packaged Tauri evidence is not pass: ${artifactPath}`);
      assert(evidence.token_values_written !== true, `packaged Tauri evidence reports token values written: ${artifactPath}`);
      assert(
        (evidence.checks || []).some((check) => check.name === 'tauri.sidecar-ready' && check.status === 'pass'),
        `packaged Tauri evidence has no passing sidecar check: ${artifactPath}`
      );
    } catch (error) {
      failures.push(`packaged Tauri evidence is not valid JSON (${artifactPath}): ${error.message}`);
    }
  }
};

assert(release.endpoint === canonicalEndpoint, `release endpoint must be ${canonicalEndpoint}`);
assert(
  !release.endpoint.includes(retiredEndpoint),
  'release endpoint uses the retired api.naavos.io route'
);
assert(
  hostedRoute?.hostname === 'mcp.naavos.radoss.agency',
  'hosted route hostname is not canonical'
);
assert(hostedRoute?.path === '/mcp', 'hosted route path is not canonical');
assert(
  `${hostedRoute?.hostname}${hostedRoute?.path}` === 'mcp.naavos.radoss.agency/mcp',
  'hosted route identity drifted'
);
assert(hostedRoute?.status === 'protocol_verified', 'hosted route is not marked protocol_verified');
assert(
  release.remote_gateway?.branded_route === 'verified',
  'branded route is not marked verified'
);
assert(
  release.remote_gateway?.tenant_isolation === 'not_verified_two_live_users',
  'tenant gate must remain explicit until two live users pass'
);
assert(
  release.host_acceptance?.chatgpt === 'pending_named_host_acceptance',
  'ChatGPT acceptance must remain explicit until named-host proof exists'
);
assert(
  release.host_acceptance?.claude === 'pending_named_host_acceptance',
  'Claude acceptance must remain explicit until named-host proof exists'
);
assert(
  release.distribution?.signing === 'ad_hoc_local_only',
  'distribution signing must remain explicit until production signing is evidenced'
);
assert(
  release.distribution?.notarization === 'not_verified',
  'notarization must remain explicit until production notarization is evidenced'
);
assert(
  release.distribution?.platforms === 'not_verified',
  'cross-platform distribution must remain explicit until each advertised platform is evidenced'
);
assert(
  release.customer_release === null,
  'customer release must remain unset until every external release gate passes'
);
assert(
  ['verified', 'content_verified'].includes(release.dashboard_release_identity?.status),
  'dashboard release identity is not verified at any accepted evidence level'
);
assert(
  /^[a-f0-9]{64}$/.test(release.dashboard_release_identity?.source_marker || ''),
  'dashboard source marker must be a 64-character hexadecimal digest'
);
assert(
  release.deployment_automation?.status === 'verified',
  'deployment automation is not verified'
);
assert(
  release.deployment_automation?.webhook_url ===
    'https://radoss.cloud/webhooks/source/github/events/manual',
  'Coolify webhook route is not canonical'
);
assert(
  release.deployment_automation?.event === 'push',
  'deployment automation must listen for push events'
);
assert(
  release.deployment_automation?.last_verified_deployed_commit ===
    '518783b977857534ab9b1937eff8dd1fa7267e1a',
  'last verified automated deployment commit is not recorded'
);
if (release.dashboard_release_identity.status === 'content_verified') {
  assert(
    release.dashboard_release_identity.source_marker_kind === 'content-derived',
    'content-verified dashboard identity must declare content-derived marker kind'
  );
  assert(
    new RegExp(
      `content-derived source marker\\s+\`${release.dashboard_release_identity.source_marker}\``
    ).test(deploymentEvidence),
    'deployment evidence does not contain the current content-derived dashboard marker'
  );
  assert(
    deploymentEvidence.includes(
      'Coolify deployment ID for this marker: not independently verified'
    ),
    'deployment evidence must retain the unverified current Coolify deployment-ID limitation'
  );
} else {
  assert(
    new RegExp('source commit `' + release.dashboard_release_identity.source_marker + '`').test(
      deploymentEvidence
    ),
    'deployment evidence does not contain the current dashboard source marker'
  );
  assert(
    new RegExp(
      'Coolify deployment\\s+`' + release.dashboard_release_identity.deployment_id + '`'
    ).test(deploymentEvidence),
    'deployment evidence does not contain the current dashboard deployment id'
  );
}
assert(release.current_qa?.status === 'pass', 'current central QA status is not pass');
validatePackagedTauriEvidence();
assert(
  typeof release.current_qa?.artifact === 'string' &&
    release.current_qa.artifact.includes('/.radoss-qa/artifacts/'),
  'current QA artifact must point to the central QA store'
);
if (requireArtifact)
  assert(
    fs.existsSync(release.current_qa.artifact),
    `current QA artifact is missing: ${release.current_qa.artifact}`
  );
validateQaArtifact();

if (failures.length) {
  console.error(JSON.stringify({ status: 'fail', failures }, null, 2));
  process.exitCode = 1;
} else {
  console.log(
    JSON.stringify(
      {
        status: 'pass',
        endpoint: release.endpoint,
        dashboard_source_marker: release.dashboard_release_identity.source_marker,
        dashboard_deployment_id: release.dashboard_release_identity.deployment_id,
        qa_artifact: release.current_qa.artifact,
        artifact_present: fs.existsSync(release.current_qa.artifact),
        token_values_read: false,
      },
      null,
      2
    )
  );
}
