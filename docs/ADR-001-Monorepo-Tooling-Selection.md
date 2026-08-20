# ADR-001: Monorepo Tooling Selection

- **Status:** Accepted
- **Date:** 2026-08-11
- **Owner:** Uchenna Innocent
- **Project:** NAAvOS

## Decision question

Which tool should we use to manage the NAAvOS monorepo?

## Project context

The NAAvOS project is a TypeScript-based monorepo containing multiple applications (dashboard, classroom) and shared packages (schema, compiler, cli, etc.), as defined in the `NAAS-Avatar-OS-Productisation-System-Design.pdf`. We need a tool that can efficiently manage dependencies, orchestrate builds, and leverage caching to ensure a fast and reliable development workflow.

## Options

1.  **Turborepo:** A high-performance build system for JavaScript and TypeScript codebases. Known for its speed, remote caching capabilities, and simple configuration.
2.  **Nx:** A more feature-rich "smart monorepo" tool with deeper integrations, code generation, and dependency graph visualization.
3.  **Lerna:** A classic monorepo tool, now primarily in maintenance mode.

## Decision

We will use **Turborepo** as our monorepo management tool.

## Why this option won

1.  **Performance:** Turborepo's caching strategy is extremely effective, significantly speeding up builds and tests by never re-computing work that has already been done.
2.  **Simplicity:** Its configuration is lighter and more intuitive than Nx, which is ideal for getting our open-source project off the ground quickly.
3.  **Vercel Synergy:** As a Vercel product, it has seamless integration with Vercel's hosting platform, which is part of our recommended stack for previews and the dashboard application.

## Consequences

- A `turbo.json` file will be added to the root of the repository to define the pipeline tasks.
- All `package.json` scripts will be orchestrated via `turbo run <script>`.