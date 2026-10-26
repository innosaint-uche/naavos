# Deploy the hosted NAAvOS gateway

This is an operator procedure, not evidence that a deployment has occurred. Local desktop use requires no Cloudflare,
Coolify or hosted account.

The existing public dashboard runs on Coolify. The authenticated MCP implementation is a Cloudflare Worker with D1. The
branded reverse proxy is in `deploy/mcp-proxy/`. Do not publish `.next/static` to Pages: the dashboard is a standalone
Next.js application and must use the root Dockerfile.

## Resource-bound authentication

The gateway requires a real OAuth authorization authority. A successful Hugging Face account lookup does not establish
that an access token was issued for NAAvOS. Provider integrations in the local runtime remain separate from gateway
authentication.

Configure these non-secret values for the selected environment:

| Variable                       | Meaning                                                                    |
| ------------------------------ | -------------------------------------------------------------------------- |
| `MCP_RESOURCE_URL`             | Canonical resource URI, for example `https://mcp.naavos.radoss.agency/mcp` |
| `OAUTH_ISSUER`                 | Exact issuer identifier used by the authorization server                   |
| `OAUTH_AUDIENCE`               | The dedicated audience issued for the NAAvOS resource                      |
| `OAUTH_AUTHORIZATION_ENDPOINT` | Real authorization endpoint with browser consent and S256 PKCE             |
| `OAUTH_TOKEN_ENDPOINT`         | Real token endpoint                                                        |
| `OAUTH_REGISTRATION_ENDPOINT`  | Optional real registration endpoint, only when supported                   |
| `OAUTH_INTROSPECTION_ENDPOINT` | HTTPS introspection endpoint if using opaque access tokens                 |
| `ALLOWED_ORIGINS`              | Explicit allowed browser origins                                           |
| `RELEASE_SHA`                  | Exact reviewed source commit deployed by the operator                      |

Select one validator:

- Dedicated HS256 JWT access tokens: store `JWT_SECRET` as a Worker secret. Tokens must have a finite future `exp`,
  non-empty `sub`, matching `iss` and `aud`, and appropriate scopes. Use a strong dedicated signing key supplied by the
  authorization authority.
- OAuth introspection: configure the trusted HTTPS introspection endpoint. Store `OAUTH_INTROSPECTION_CLIENT_ID` and
  `OAUTH_INTROSPECTION_CLIENT_SECRET` as secrets when the issuer requires client authentication. Introspection must
  return `active=true`, `sub`, finite `exp`, the dedicated `aud`, and scopes. An issuer mismatch is rejected.

`read-mcp` is required for access. Updates and data deletion also require `write-avatar` and explicit confirmation. The
issuer controls any signed `tenant_id` mapping; otherwise the subject is the tenant. For per-user Avatars, issue one
owner-scoped tenant per user.

Do not deploy with `NAAVOS_DEV_MODE=true`. Development fallback is accepted only on loopback without a bearer token.
Removed `HF_OAUTH_*` flags do not grant access. Never commit `.dev.vars`, environment files or secret values.

## Staged rollout

1. Back up the existing D1 database and preserve the live gateway version.
2. Create an isolated Worker and D1 binding in the intended owner's account. Use a separate reviewed Wrangler
   configuration; do not reuse the production database ID for staging.
3. Configure the real issuer, audience, resource URI, endpoints and secrets through the account's secret manager/Doppler
   integration. Wrangler `versions secret put` stages a version without immediately replacing the live deployment.
4. Apply the existing D1 schema to the isolated database:

   ```sh
   wrangler d1 migrations apply DB --local
   wrangler d1 migrations apply DB --remote
   ```

5. Deploy the reviewed configuration with the exact source revision:

   ```sh
   wrangler deploy --var "RELEASE_SHA:$(git rev-parse HEAD)"
   ```

6. Check `/health`, both resource metadata paths, authorization discovery, a real OAuth flow, refresh/revocation and
   scopes. A healthy-looking configuration response alone does not prove authentication or persistence.
7. Use two independent live accounts to test save, reload, search, cross-tenant rejection, deletion and session
   revocation. Fixtures are necessary but do not replace this check.
8. Verify named ChatGPT and Claude acceptance and the exact deployment identity. Record evidence in the central QA store
   and run `pnpm verify:release`.
9. Map existing `hf:<username>` tenants to new issuer subjects only with verified ownership. Do not guess a
   username/subject association, move another owner's data or silently delete the old database.
10. Promote the reviewed Worker and branded proxy only after those checks pass. Retain the previous version for
    rollback.

The current source change adds no D1 schema migration. Its delete tool operates on the existing tenant-scoped tables in
one transaction.

## Dashboard deployment

Use the root Dockerfile on the existing Coolify deployment. It builds self-hosted font assets, generates
`public/release.json` and runs the standalone Next server as a non-root user. Verify the resulting marker against
`pnpm release:marker` after deployment.

Do not relabel the existing unsigned desktop beta as containing these fixes. Build new desktop artifacts from the
reviewed runtime revision and verify signing, notarisation and advertised-platform installation separately.

## Primary references

- [MCP authorization and resource binding](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization)
- [Cloudflare D1 migration commands](https://developers.cloudflare.com/d1/wrangler-commands/)
- [Cloudflare Worker secret/version commands](https://developers.cloudflare.com/workers/wrangler/commands/workers/)
