# Progressive Learning Log for NAAvOS Agents

This document tracks key learnings, architectural patterns, common errors, and important file paths discovered during the development of NAAvOS. Agents should review this file to maintain up-to-date context.

## 1. Core Concepts & Architectural Patterns

-   **Avatar OS as a Compiler:** The fundamental shift in this project is from a simple file-copying system to a sophisticated **compiler and conformance engine**. We don't just move files; we read a source of truth (`Avatar-Source-Package`), validate it, resolve its rules, and generate tailored outputs for different AI hosts via adapters.
-   **File-Based State Machine:** The ecosystem's state is managed through files on the filesystem. This is intentional. The goal of NAAvOS is to make this process robust, safe, and scalable.
-   **Host Adapters:** Extensibility is achieved through "Host Adapters." Each new AI agent, IDE, or tool we want to support requires a new adapter. This is a core architectural pattern.
-   **Data Classification:** A strict separation between `public`, `private`, and `secret` data is mandatory. Secrets must never be committed to source control. The `uchenna-reference-sanitized` profile is the test case for this.
-   **Monorepo Structure:** The project uses a monorepo structure, likely managed by npm workspaces, with a clear separation between `apps`, `packages`, and `profiles`.

## 2. Key File Paths & Project Structure

-   `/` (Project Root: `/Users/radossagency/Documents/NAAS/`)
    -   `CTO_REPORT.md`: **CRITICAL.** The strategic plan for the MVP rebuild. The source of truth for the project's direction.
    -   `AVATAR_ECOSYSTEM_ANALYSIS.md`: Analysis of the original prototype. Useful for understanding the "why" but not the "how" of the new system.
    -   `CONTRIBUTING.md`: Development process and code style guide.
    -   `package.json`: Defines workspace and scripts. `npm run doctor` is a key health check.
    -   `dashboard/`: The Next.js dashboard application for visualizing conformance scores.
    -   `naavos-mcp-server/`: The Model Context Protocol (MCP) server, for serving context to web-based agents.
    -   `packages/`: Location for core logic, CLI, and adapters.
        -   `cli/`: The main `naavos` CLI tool.
        -   `core/`: Likely location for the compiler and installer engine.
-   **External "Avatar OS" Source (Prototype)**:
    -   `Uchenna-Avatar-OS/`: The root of the original, personal Avatar OS. This is what NAAvOS aims to productize.
        -   `system_prompts/core_identity.md`: Defines the core persona.
        -   `knowledge/projects_registry.json`: The "long-term memory," known to contain plaintext secrets (SECURITY RISK).

## 3. Known Issues & Anti-Patterns (To Avoid)

-   **Prototype Brittleness:** The old system relied on fragile shell scripts (`automations/sync-avatar.sh`). **DO NOT** replicate this logic. All configuration changes must go through the new `naavos` compiler and safe installer.
-   **Security Risks:** The original `projects_registry.json` contained plaintext secrets. This is a critical vulnerability. The new system must handle secrets securely, likely through environment variables or a dedicated secrets manager, and the compiler must enforce data classification.
-   **Ignoring Context:** The old system relied on LLM cooperation. The new system aims for verification through the **Conformance Harness** (`naavos test`). The goal is to *prove* an agent adheres to the configured persona.
-   **Manual Syncing:** The manual `sync-avatar.sh` and `avatar-check.sh` steps are error-prone. These are being replaced by the automated, safe `naavos install` and `naavos doctor` commands.

## 4. Progressive Learning Log

*This section should be updated by agents with new learnings from each session.*

-   **Session (YYYY-MM-DD):**
    -   **Learning:** [Example: Discovered that the `wrangler dev` command is required for the MCP server.]
    -   **Error:** [Example: Encountered a Zod schema validation error when `identity.rules` was missing. The schema needs to be more robust.]
    -   **Decision:** [Example: Decided to use the `zod` library for schema definition as per the `CTO_REPORT.md` suggestion.]
