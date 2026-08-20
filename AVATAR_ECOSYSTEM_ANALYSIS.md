# Avatar Ecosystem: Agent Relationship & Communication Analysis

This document details the architecture, communication flow, and hierarchical relationships of the agents and tools within the Uchenna Innocent Avatar Ecosystem.

## 1. Core Philosophy: File-Based State Management

The entire ecosystem is built on a simple yet powerful premise: **the filesystem is the state machine.** Instead of relying on complex APIs or databases, the "Avatar OS" uses a structured set of markdown and JSON files as the single source of truth for Uchenna's identity, preferences, and context.

AI agents are expected to **read from these files at the beginning of a session** to "boot up" the avatar's persona.

## 2. Agent & Tool Hierarchy

The ecosystem has a clear, albeit manually enforced, hierarchy.

### Level 0: The "SOUL" - Core Identity Files
These files represent the immutable core of the avatar. All other agents and tools derive their persona from this layer.

-   **`Uchenna-Avatar-OS/`**: The root directory containing the entire persona definition.
    -   `system_prompts/core_identity.md`: The foundational document defining the user's core personality, cognitive profile (ENTP/ENTJ, 2e), and absolute operational rules.
    -   `api/avatar_schema.json`: The machine-readable "brain." It codifies the core identity, rules, and modes into a JSON format for more reliable parsing by agents.
    -   `knowledge/projects_registry.json`: The long-term memory, tracking projects, credentials (dangerously, sometimes in plaintext), and active contexts.

### Level 1: The "Modes" - Specialized Personas
These are overlays that modify the core persona for specific tasks.

-   `system_prompts/cto_mode.md`: For technical strategy and execution.
-   `system_prompts/cco_mode.md`: For creative direction and brand work.
-   Other skill-based `SKILL.md` files (`Uchenna-Avatar-OS/architecture/decision-os/SKILL.md`, etc.)

### Level 2: The "Clients" - AI Agents & IDEs
These are the consumers of the Avatar OS. They are responsible for loading and adhering to the context defined in Levels 0 and 1.

-   **Gemini CLI (`~/.gemini/GEMINI.md`)**: A primary, high-level agent expected to understand the full context.
-   **Claude (`~/.claude/CLAUDE.md`)**: Another primary agent.
-   **Cursor / VSCode**: An IDE-based agent that receives context via copy-pasted prompts or file-loading extensions.
-   **OpenClaw Workspaces (`~/.openclaw/*`)**: A containerized agent environment where the context is injected into `AGENTS.md`.
-   **Hermes (`~/.hermes/SOUL.md`)**: Appears to be an orchestrator or a meta-agent that also inherits from the core identity.

### Level 3: The "Orchestrators" & Automations
These are scripts and tools that manage the ecosystem itself.

-   **`automations/avatar-check.sh`**: A **health-check script**. It doesn't enforce anything but *verifies* that the various "Client" configuration files contain references to the core identity. It acts as a linter for the ecosystem's integrity.
-   **`automations/sync-avatar.sh`**: The **synchronization script**. It's the active component responsible for propagating changes from the core identity (Level 0) to the client configurations (Level 2). It likely uses `cp`, `sed`, or `rsync` to update files like `~/.gemini/GEMINI.md`.
-   **`automations/log_project.js`**: A utility to update the `projects_registry.json`, centralizing project memory management.

## 3. Communication, Sync & Handshake Protocol

The "protocol" is entirely file-based and can be broken down into these phases:

1.  **Initialization (Manual)**: The user manually edits the core identity files within the `Uchenna-Avatar-OS` repository (e.g., adds a new rule to `core_identity.md`).
2.  **Synchronization (Scripted)**: The user runs `sync-avatar.sh`. This script copies or injects the core context into the configuration files of the various agents (`~/.gemini/GEMINI.md`, `~/.claude/CLAUDE.md`, etc.). This is the **"handshake"**—the core OS pushes its state to the clients.
3.  **Agent Boot-up (Implicit)**: When the user starts a session with an agent (e.g., Gemini CLI), that agent's pre-configured bootstrap instructions load the updated `GEMINI.md` file into its context window. The agent is now "running" the avatar's persona.
4.  **Health Check (Manual/CI)**: The user runs `avatar-check.sh` to confirm that the synchronization worked and that all agents are pointing to the correct, consistent identity.

## 4. Loopholes & Areas for Improvement

This file-based system is elegant in its simplicity but has significant vulnerabilities:

-   **No True Enforcement**: The system relies on the *cooperation* of the LLM. An agent can choose to ignore the context provided in `GEMINI.md`. There is no "compiler" that forces compliance.
-   **Fragile Sync Script**: The `sync-avatar.sh` script is a single point of failure. If it fails or contains a bug, the entire ecosystem becomes desynchronized. It's also likely brittle, relying on fixed file paths.
-   **Security Risks**: As identified previously, `projects_registry.json` contains plaintext secrets. The synchronization process could potentially propagate these insecure values across the system.
-   **Manual Overhead**: The user must manually run `sync-avatar.sh` and `avatar-check.sh`. This is prone to error and can be forgotten.
-   **Stateless by Nature**: While it simulates state, the system is fundamentally stateless. Every new session requires the agent to re-read the context files. There's no persistent, in-memory representation of the avatar for an agent.
