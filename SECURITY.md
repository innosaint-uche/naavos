# Security policy

NAAvOS handles identity, Avatar context, memory, OAuth, and host configuration.
Security reports are treated as release-blocking evidence, not ordinary bug
reports.

## Reporting

Do not open a public issue containing credentials, OAuth codes, personal data,
tenant data, or a working exploit. Contact the repository maintainer privately
through the verified GitHub security contact or the project owner before public
disclosure. Include:

- affected version or commit;
- exact component and deployment surface;
- reproducible steps with secrets and personal data removed;
- impact, affected tenants, and whether data crossed an authorization boundary;
- a safe remediation or test case if available.

Never paste live tokens into issues, pull requests, logs, screenshots, Avatar
packages, or generated agent configuration.

## Release security requirements

Before a release is called public:

1. run the repository secret scan and investigate every finding;
2. verify OAuth issuer, redirect, PKCE, expiry, audience, and scopes;
3. prove tenant isolation with two independent live identities;
4. verify rollback, disconnect, deletion, and credential revocation;
5. verify signed and notarised desktop artifacts;
6. record the exact source and deployment identity in
   `docs/qa/RELEASE_EVIDENCE_CURRENT.json`.

The page-18 Evidence Standard in the productisation design is authoritative.
Green local tests do not replace hosted security or named host acceptance.
