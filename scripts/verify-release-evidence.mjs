import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
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

assert(release.endpoint === canonicalEndpoint, `release endpoint must be ${canonicalEndpoint}`);
assert(!release.endpoint.includes(retiredEndpoint), 'release endpoint uses the retired api.naavos.io route');
assert(hostedRoute?.hostname === 'mcp.naavos.radoss.agency', 'hosted route hostname is not canonical');
assert(hostedRoute?.path === '/mcp', 'hosted route path is not canonical');
assert(`${hostedRoute?.hostname}${hostedRoute?.path}` === 'mcp.naavos.radoss.agency/mcp', 'hosted route identity drifted');
assert(hostedRoute?.status === 'protocol_verified', 'hosted route is not marked protocol_verified');
assert(release.remote_gateway?.branded_route === 'verified', 'branded route is not marked verified');
assert(release.remote_gateway?.tenant_isolation === 'not_verified_two_live_users', 'tenant gate must remain explicit until two live users pass');
assert(release.host_acceptance?.chatgpt === 'pending_named_host_acceptance', 'ChatGPT acceptance must remain explicit until named-host proof exists');
assert(release.host_acceptance?.claude === 'pending_named_host_acceptance', 'Claude acceptance must remain explicit until named-host proof exists');
assert(release.dashboard_release_identity?.status === 'verified', 'dashboard deployment identity is not verified');
assert(release.deployment_automation?.status === 'verified', 'deployment automation is not verified');
assert(release.deployment_automation?.webhook_url === 'https://radoss.cloud/webhooks/source/github/events/manual', 'Coolify webhook route is not canonical');
assert(release.deployment_automation?.event === 'push', 'deployment automation must listen for push events');
assert(release.deployment_automation?.last_verified_deployed_commit === '518783b977857534ab9b1937eff8dd1fa7267e1a', 'last verified automated deployment commit is not recorded');
assert(new RegExp('source commit `' + release.dashboard_release_identity.source_marker + '`').test(deploymentEvidence), 'deployment evidence does not contain the current dashboard source marker');
assert(new RegExp('Coolify deployment\\s+`' + release.dashboard_release_identity.deployment_id + '`').test(deploymentEvidence), 'deployment evidence does not contain the current dashboard deployment id');
assert(release.current_qa?.status === 'pass', 'current central QA status is not pass');
assert(typeof release.current_qa?.artifact === 'string' && release.current_qa.artifact.includes('/.radoss-qa/artifacts/'), 'current QA artifact must point to the central QA store');
if (requireArtifact) assert(fs.existsSync(release.current_qa.artifact), `current QA artifact is missing: ${release.current_qa.artifact}`);

if (failures.length) {
  console.error(JSON.stringify({ status: 'fail', failures }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({
    status: 'pass',
    endpoint: release.endpoint,
    dashboard_source_marker: release.dashboard_release_identity.source_marker,
    dashboard_deployment_id: release.dashboard_release_identity.deployment_id,
    qa_artifact: release.current_qa.artifact,
    artifact_present: fs.existsSync(release.current_qa.artifact),
    token_values_read: false
  }, null, 2));
}
