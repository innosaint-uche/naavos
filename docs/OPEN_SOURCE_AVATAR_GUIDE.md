# Building and Using NAAvOS as an Open-Source Avatar OS

## What users get

NAAvOS should let a person define a portable, inspectable context package and apply only the approved parts to supported AI hosts. It is not a personality test, a hidden surveillance layer or a promise that a model becomes the person. Radoss Agency is the maintainer; NAAvOS is the product.

## Recommended user journey

```text
Install locally
  → Quick start or import
  → Review privacy and project scope
  → Validate
  → Preview generated host files
  → Install with backup
  → Verify after reload
  → Run conformance probes
  → Correct, export or roll back
```

## Personalisation model

Keep these layers separate:

| Layer | Examples | Default |
|---|---|---|
| Identity | display name, role, public description | optional |
| Communication | tone, structure, verbosity, accessibility | user-controlled |
| Operating rules | evidence, approvals, safety, coding practices | explicit and testable |
| Modes | CTO, CCO, research, writing | opt-in and scoped |
| Projects | repository, goals, constraints, current state | project-only |
| Memory | accepted assertions, provenance, expiry | local and reviewable |
| Derived indexes | embeddings, graph, provider cache | rebuildable, never canonical |

Sensitive identity labels, psychological models and personal history must be optional, private by default and explainable. The product must work without them.

## Contributor implementation contract

Every feature should declare:

- source authority;
- data classification;
- permission required;
- persistence behavior;
- export/delete behavior;
- adapter impact;
- conformance test;
- rollback strategy;
- evidence required before public copy changes.

## Easy application usage

The public CLI should converge on these commands:

```bash
naavos init                         # quick guided package
naavos configure                    # privacy, targets, projects
naavos validate                     # schema and policy checks
naavos preview --target hermes     # exact diff, no mutation
naavos install --target hermes     # backup + managed install
naavos doctor                      # local health and target status
naavos test                        # behavioral conformance
naavos rollback                    # recover the previous state
naavos export --format avatar      # portable canonical package
naavos import ./avatar.json        # review before adoption
```

The first-run experience should explain local-only operation, show where data is stored, and never ask for a cloud credential before a user chooses a cloud feature.

## Open-source safety defaults

- local-first storage;
- cloud sync disabled until consent;
- telemetry disabled until consent;
- no secrets in avatar packages, manifests or generated prompts;
- no automatic memory acceptance;
- no cross-project retrieval by default;
- read-only tools separated from mutation tools;
- explicit approval for external side effects;
- export and delete available without vendor support;
- generated files labeled with source revision and timestamp.

## Adapter contribution checklist

An adapter is ready for review only when it includes:

1. destination and precedence documentation;
2. supported/unsupported field matrix;
3. managed-block or atomic-write strategy;
4. backup and rollback implementation;
5. dry-run and diff output;
6. reload verification;
7. behavioral probe fixture;
8. secret and privacy test;
9. clean-install CI evidence;
10. maintainer and user documentation.

## Definition of “personalised and working”

Do not use the word “working” until the selected host can demonstrate, after restart:

- the selected identity and communication preferences are present;
- project scope is respected;
- a critical rule changes behavior in a controlled probe;
- private fields are not emitted to an unauthorized target;
- the generated file is traceable to the canonical package;
- rollback restores the previous behavior;
- the user can inspect and correct the result.
