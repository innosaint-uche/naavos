# ADR-000: Adopt Controlled Rebuild Strategy

- **Status:** Accepted
- **Date:** 2026-08-11
- **Owner:** Uchenna Innocent
- **Project:** NAAvOS

## Decision question

How should we proceed from the "Phase 0" prototype to a secure, scalable, and reusable product?

## Project context

The existing `NAAS` repository and the local `Uchenna-Avatar-OS` represent a successful proof-of-concept. They validate the core user need for a portable AI personality. However, as documented in `AVATAR_ECOSYSTEM_ANALYSIS.md` and the `NAAS-Avatar-OS-Productisation-System-Design.pdf`, the current implementation is a "file copier." It is brittle, insecure (plaintext secrets), lacks verification, and is not safe for public use.

## Decision

We will adopt the **"controlled rebuild"** strategy.

We will not attempt to patch the current prototype. Instead, we will use it as a blueprint to build the real engine: a **compiler and conformance platform**.

This decision is based on the `CTO_REPORT.md`, which outlines a clear path from the prototype's identified weaknesses to a robust architectural solution.

## Why this option won

1.  **Security:** A compiler architecture allows us to implement security gates, such as secret scanning, before any files are generated.
2.  **Reliability:** A "Safe Installer" with atomic writes, backups, and rollbacks prevents users' configurations from being left in a broken state, a key risk of the current `sync.sh` script.
3.  **Extensibility:** A "Host Adapter" model makes supporting new AI tools a modular and scalable process, rather than requiring manual script edits.
4.  **Verification:** A "Conformance Harness" allows us to prove that the system works as intended, moving beyond the "hope-based" enforcement of the current prototype.

## Consequences

- The existing CLI commands (`connect`, `sync`) will be replaced by a new `compile` and `install` workflow.
- The `LOCAL_AVATAR_IMPROVEMENT_PLAN.md` is now superseded by the official NAAvOS MVP rebuild plan outlined in the `CTO_REPORT.md`.
- Development will begin with **Milestone 0: Foundation & Sanitation**.