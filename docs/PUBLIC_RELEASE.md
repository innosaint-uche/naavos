# Public release contract

The full product scope and delivery rules are defined in the
[Product Request and Release Charter](PRODUCT_REQUEST_AND_RELEASE_CHARTER.md).

NAAvOS has two distinct release claims:

| Claim                   | Required proof                                                                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Local development       | tests, typecheck, lint, build, local browser and MCP checks                                                                                                                                |
| Public/customer release | all local proof plus hosted OAuth, two-user tenant isolation, named ChatGPT/Claude acceptance, signed/notarised artifacts, distribution security review, source visibility, and exact deployment identity |

The current checkout is a controlled development release. Its source repository is public for open-source contributors
at `https://github.com/innosaint-uche/naavos`. This source-public state is deliberately separate from a public/customer
release: no unresolved GitHub URL may be advertised as the official source, and no customer-ready claim may be made
until the evidence manifest is complete.

## Release sequence

1. Run `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, and the secret scan.
2. Run the local and packaged no-code E2E journeys.
3. Deploy the hosted MCP Worker from the reviewed source commit.
4. Verify the branded custom domain, OAuth discovery, MCP conformance, and two live tenants. Use
   `pnpm verify:live-tenants` with two dedicated acceptance-account tokens supplied only through
   `NAAVOS_LIVE_TOKEN_A` and `NAAVOS_LIVE_TOKEN_B`; the script restores the temporary test marker.
5. Obtain named ChatGPT and Claude acceptance.
6. Complete the distribution security review and build signed and notarised desktop artifacts for every advertised platform.
7. Update `docs/qa/RELEASE_EVIDENCE_CURRENT.json` with observed evidence.
8. Only then publish customer-facing install instructions, signed release artifacts, and public/customer claims. The
   source repository may remain publicly readable during controlled development, but its status must stay explicit until
   these gates pass.

If any item is missing, the correct label is `development baseline` or `local validation`, never `public release`.

## Live tenant acceptance safety

Run the live tenant check only with two dedicated acceptance accounts, never
with a production Avatar that must not be temporarily changed. The command
reads tokens from the process environment, never from arguments, logs, or
evidence. It requires the verified branded endpoint, checks distinct owners,
performs a unique confirmed mutation for tenant A, verifies tenant B cannot see
it or reuse tenant A's session, and restores tenant A before reporting PASS.
