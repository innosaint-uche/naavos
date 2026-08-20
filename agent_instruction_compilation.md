# Agent Instruction Compilation for NAAvOS Development

This document provides a compilation of instructions, goals, and protocols for AI agents assisting in the development of the NAAvOS (Neuro AI - Avatar OS) system. Adherence to these guidelines is critical for project success.

## 1. Core Mission & Vision

**Your primary objective is to build the NAAvOS system, a compiler and conformance engine for personal AI Avatars.**

-   **Vision:** To solve AI agent statelessness by creating a portable, personal "AI Operating System."
-   **Current State:** We are executing a **controlled rebuild** of a Phase 0 prototype. The goal is to build a robust, local-first, open-source product.
-   **Core Architecture:** The system is a **compiler and conformance platform**. It is NOT a simple file-copying utility.

## 2. Guiding Principles & Philosophy

These principles, derived from the project's core documents, must guide all development actions.

-   **Filesystem as State Machine:** The filesystem is the single source of truth for an avatar's state. However, interaction with it must be managed by the compiler, not ad-hoc scripts.
-   **Compiler-Driven:** The `naavos` compiler is the heart of the system. It reads a user's `Avatar-Source-Package`, resolves rule precedence, and translates it into host-specific artifacts using **Host Adapters**.
-   **Safety First:** All file operations that modify user configurations must be:
    -   **Atomic:** Changes are all-or-nothing.
    -   **Reversible:** Backups must be created before any changes.
    -   **Transparent:** Users should be shown a `diff` of proposed changes before they are applied (`--dry-run`).
-   **Extensibility via Adapters:** The system must be easily extensible to new AI agents and IDEs by creating new "Host Adapter" packages.
-   **Local-First & Open-Source:** The MVP will be a fully functional local tool. Cloud services are a future consideration.
-   **Data Segregation:** Strictly enforce the public/private/secret data classification policy. Never commit private or secret data.

## 3. High-Level MVP Rebuild Plan

Your tasks will align with the following milestones. Be aware of the current milestone to understand the context of your work.

### **Milestone 0: Foundation & Sanitation (1 Week)**
*Goal: Establish a clean, secure foundation.*
1.  Reorganize the monorepo to the `Recommended Repository Topology` (apps, packages, profiles).
2.  Formalize the `Avatar-Package` contract in JSON Schema or Zod (Schema v1).
3.  Implement the public/private/secret data classification policy.
4.  Create a sanitized `uchenna-reference-sanitized` profile for testing.

### **Milestone 1: The Compiler (3 Weeks)**
*Goal: Translate a source package into host-specific artifacts.*
1.  Build the Policy Engine for rule precedence and conflict resolution.
2.  Build the Compiler Core to produce a normalized Intermediate Representation (IR).
3.  Develop initial Host Adapters for Gemini CLI and Claude.

### **Milestone 2: The Safe Local Product (3 Weeks)**
*Goal: A usable, safe CLI tool for local installations.*
1.  Build the Safe Installer engine (dry-runs, backups, atomic writes, rollbacks).
2.  Develop CLI v2 (`init`, `compile`, `install`, `doctor`).
3.  Develop Host Adapters for Cursor and VS Code.
4.  Update project documentation (`README.md`, `SETUP.md`).

### **Milestone 3: Conformance & Pilot (4 Weeks)**
*Goal: Prove it works and gather user feedback.*
1.  Build the Conformance Harness (`naavos test`).
2.  Create a Fidelity Dashboard to visualize test results.
3.  Onboard pilot users and iterate based on feedback.

## 4. Development Workflow & Code Standards

Adhere to the standards defined in `CONTRIBUTING.md`.

-   **Git Workflow:**
    1.  Fork the repository.
    2.  Create a feature branch: `git checkout -b feature/amazing-feature`.
    3.  Commit your changes.
    4.  Push to your branch.
    5.  Open a Pull Request.
-   **Commit Messages:**
    -   **Format:** `type(scope): description`
    -   **Types:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.
-   **Code Style:**
    -   ES Modules (ESM).
    -   2-space indentation.
    -   Single quotes for strings.
    -   No semicolons.
-   **Testing:** Run `npm test` to validate changes.
-   **Local Development Commands:**
    -   Dashboard: `cd dashboard && npm run dev`
    -   MCP Server: `cd naavos-mcp-server && wrangler dev`
    -   CLI: `cd packages/cli && node bin/naavos.js`

This document is the primary source of truth for agent instructions. It should be updated as the project evolves.
