# Public release contract

NAAvOS has two distinct release claims:

| Claim | Required proof |
|---|---|
| Local development | tests, typecheck, lint, build, local browser and MCP checks |
| Public/customer release | all local proof plus hosted OAuth, two-user tenant isolation, named ChatGPT/Claude acceptance, signed/notarised artifacts, security scan, source visibility, and exact deployment identity |

The current checkout is a controlled development release. Its source
repository is public for open-source contributors at
`https://github.com/innosaint-uche/naavos`. This source-public state is
deliberately separate from a public/customer release: no unresolved GitHub URL
may be advertised as the official source, and no customer-ready claim may be
made until the evidence manifest is complete.

## Release sequence

1. Run `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, and the secret scan.
2. Run the local and packaged no-code E2E journeys.
3. Deploy the hosted MCP Worker from the reviewed source commit.
4. Verify the branded custom domain, OAuth discovery, MCP conformance, and two live tenants.
5. Obtain named ChatGPT and Claude acceptance.
6. Build signed and notarised desktop artifacts for every advertised platform.
7. Update `docs/qa/RELEASE_EVIDENCE_CURRENT.json` with observed evidence.
8. Only then publish customer-facing install instructions, signed release
   artifacts, and public/customer claims. The source repository may remain
   publicly readable during controlled development, but its status must stay
   explicit until these gates pass.

If any item is missing, the correct label is `development baseline` or
`local validation`, never `public release`.
