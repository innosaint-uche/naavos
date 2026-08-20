# NAAvOS: Ecosystem & Interoperability Strategy

**Version:** 1.3
**Author:** Gemini Code Assist, Acting CTO
**Date:** August 10, 2026

## 1. Strategic Intent

The core mission of NAAvOS is to solve AI agent statelessness. A modern developer's workflow is not monolithic; it involves multiple AI agents (e.g., GitHub Copilot, Gemini, Claude, Cursor), across multiple IDEs (e.g., VS Code, JetBrains), often working on the same project.

This document outlines the strategy for making NAAvOS an indispensable, non-restrictive layer that enables seamless context handoffs, collaboration, and consistent AI behavior across this heterogeneous ecosystem. We will not force users to abandon their favorite tools; we will make their tools better by giving them a shared brain.

## 2. Architectural Pillars

Our strategy is built on two core architectural pillars from the `CTO_REPORT.md`:

1.  **Compiler + Host Adapters:** NAAvOS is not a file copier. It compiles a single `Avatar-Source-Package` into specific, verified instructions for each "host" (an AI agent, an IDE, a CLI tool). This is inherently designed for a multi-tool world.
2.  **The "Workspace Context" Pattern:** NAAvOS will generate a `.naavos/` directory within each project's Git repository. This directory will contain project-specific context files (`CONTEXT.md`, `TECH_STACK.md`, etc.). This is the key to enabling loosely-coupled interoperability. Any file-aware agent can immediately gain project context simply by reading from this directory, without needing a deep, custom integration.

## 3. Detailed Integration Patterns & Open-Source Leverage

Here is a detailed breakdown of how NAAvOS will integrate with a wide array of tools and platforms, catering to both technical and non-technical users.

### 3.1. IDEs as First-Class Hosts

IDEs are the primary battleground for developer productivity. A NAAvOS adapter for an IDE will be a force multiplier.

#### **Visual Studio Code (`adapter-vscode`)**

This is the highest-priority adapter. It will manage context for multiple agents simultaneously.

*   **Workspace Context:** On `naavos install`, the adapter will generate `.naavos/CONTEXT.md` in the project root.
*   **GitHub Copilot:** Copilot's system prompt is not directly accessible. However, its `@workspace` participant can read files. By generating the `CONTEXT.md` file, we make the Avatar's project-specific rules and context available to Copilot queries (e.g., `"@workspace how should I format this function according to the project rules?"`).
*   **Cursor:** The adapter will generate and manage the `.cursorrules` file in the project root, directly injecting the Avatar's persona.
*   **Continue.dev:** This open-source autopilot is highly configurable. The adapter will generate/update the `config.ts` file to:
    *   Populate `systemMessage` with the Avatar's core identity.
    *   Define `customCommands` based on the Avatar's `trigger_modes` (e.g., a `/turbo` command that applies the "Heroic Deliverer" rules).
    *   Add the `.naavos/` directory to the `contextProviders`, making it a default source of context.
*   **Generic AI Extensions:** For other extensions (e.g., "Genie AI"), the adapter will update the user's `settings.json` to point the extension's "context file path" setting to `.naavos/CONTEXT.md`.

#### **JetBrains IDEs (IntelliJ, WebStorm, etc.) (`adapter-jetbrains`)**

*   **File Templates:** The adapter will create and manage IDE file templates that include the Avatar's preferred boilerplate and licensing info.
*   **AI Assistant Integration:** The JetBrains AI Assistant allows for custom prompts. The adapter will populate the prompt library with the Avatar's core rules and modes.
*   **Plugin Ecosystem:** We will investigate creating a dedicated NAAvOS plugin for JetBrains to provide a richer integration, similar to the VS Code adapter.

### 3.2. Standalone & Web-Based Agent Integration

This is crucial for supporting non-developer users and workflows outside of a code editor.

*   **Web UIs (ChatGPT, Claude.ai, Perplexity):**
    *   **Action:** Develop a NAAvOS browser extension (e.g., for Chrome, Firefox).
    *   **Mechanism:** The extension will read the compiled Avatar context from a local file or query the `naavos-mcp-server`. It will then inject this context into the system prompt area of the web UI or make it available via a sidebar.
    *   **Benefit:** This provides a simple, non-intrusive way for marketers, writers, and other professionals to bring their Avatar into the web-based tools they use daily.

*   **Desktop Apps (Kimi Desktop, etc.):**
    *   **Action:** Create dedicated `Host Adapters` for popular desktop applications.
    *   **Mechanism:** The adapter would locate the application's configuration files (e.g., `settings.json`, `.plist` files) and safely inject the Avatar's context, similar to how IDE adapters work.

*   **CLI Tools (Aider, LiteLLM, etc.):**
    *   **LiteLLM (`adapter-litellm`):** This is a critical integration for maximizing user choice. LiteLLM provides a unified API for over 100 LLMs. The NAAvOS adapter will generate the `config.yaml` for LiteLLM, injecting the Avatar's rules as a global `system_prompt`.
    *   **Action:** The NAAvOS adapter will generate the `config.yaml` for LiteLLM.
    *   **Mechanism:** It will inject the Avatar's core rules into the `litellm_settings` as a global `system_prompt` or define `presets` for different modes (e.g., `preset: cto_mode`).
    *   **Benefit:** The user defines their Avatar once, and it applies to any model they call via the LiteLLM proxy (OpenAI, Anthropic, Gemini, Mistral, etc.). This provides immense leverage.
    *   **Action:** The adapter will generate the project-specific `.aider.conf.yml`.
    *   **Mechanism:** It will populate the `system-prompt` with the Avatar's persona and the `user-prompt` with project-specific context from the `projects.json` registry.
*   **Local Model UIs (Open-WebUI, Ollama):**
    *   **Action:** The adapter will interact with the Open-WebUI API to create and update "Prompt Presets" and "Modelfiles" that embed the Avatar's system prompt. This allows users to select their persona directly from the UI.

### 3.3. The "Hermes" Orchestrator & The MCP (Model Context Protocol)

For seamless handoffs and true cross-agent collaboration, a higher-level orchestrator is needed. This is the role of the "Hermes" concept.

*   **Decoupling with MCP:** The orchestrator's job is simplified. It does not need to know the specifics of each agent's configuration.
*   **The Workflow:**
    1.  The user initiates a task via the orchestrator: `hermes "refactor the auth service" --agent=claude`.
    2.  The orchestrator queries the local `naavos-mcp-server`: `GET /mcp/v1/context?project=MyProject&mode=cto`.
    3.  The MCP server, using the `Runtime Context` engine, securely retrieves the relevant, secrets-redacted context for that project and mode.
    4.  The orchestrator takes the context provided by the MCP and injects it into the prompt for the target agent (Claude).
    5.  If the user then says `hermes "now generate tests for it" --agent=gemini`, the orchestrator repeats the process, ensuring both agents receive the exact same, consistent context from the MCP.

*   **Benefit:** This makes the system incredibly robust. We can add support for a new agent in the orchestrator without changing the core NAAvOS system. The MCP provides a stable, trusted, and secure API for "just-in-time" context.

## 4. Knowledge & Retrieval Strategy (RAG)

Local file storage is insufficient for heavy users and project continuity. NAAvOS must embrace a flexible, multi-tiered approach to knowledge management, allowing users to connect to existing cloud storage and databases.

The `Avatar-Source-Package` will not store the knowledge itself, but rather **pointers** to knowledge sources. The NAAvOS `Runtime Context` engine will use **Knowledge Connectors** to fetch and retrieve information.

### 4.1. Knowledge Connectors

These are a special class of adapter responsible for interacting with different data sources.

*   **`connector-filesystem`:** The default connector. Indexes local Markdown, PDF, and text files in a specified directory. Simple, private, and local-first.
*   **`connector-gdrive`:** Connects to a user's Google Drive via OAuth. Can be configured to index specific folders or documents. Ideal for users who store their work in Google Docs/Sheets.
*   **`connector-notion`:** Connects to a Notion workspace. Can be configured to index specific pages or entire databases. Perfect for marketers, project managers, and writers who use Notion as their second brain.
*   **`connector-airtable`:** Connects to an Airtable base, allowing the Avatar to query structured data.
*   **`connector-github`:** Indexes code and documentation from specified GitHub repositories.
*   **`connector-sql`:** A generic connector for read-only access to a MySQL or PostgreSQL database.
*   **`connector-vectorstore`:** For advanced users. Points to an existing vector database (e.g., Qdrant, Pinecone, Cloudflare Vectorize). NAAvOS will use this for high-performance semantic search.

### 4.2. User-Centric RAG

This model allows users to choose their own trade-offs between simplicity, cost, and power.

*   **Low-Risk User:** Might only use the `connector-filesystem` to keep everything local and private.
*   **Digital Marketer:** Could combine `connector-gdrive` (for strategy docs), `connector-notion` (for content calendars), and `connector-airtable` (for campaign results).
*   **Automation Specialist:** May use `connector-github` to reference scripts and `connector-sql` to query operational databases.
*   **AI Power User:** Could build a sophisticated pipeline that ingests data into a local Qdrant instance and uses the `connector-vectorstore` for deep semantic retrieval, similar to the architecture of systems like `memU`.

By defining knowledge sources as pointers and using a connector architecture, NAAvOS becomes a powerful and flexible RAG orchestration layer, not just a static context injector.

## 5. User Personas & Experience

This strategy is designed to maximize user choice and minimize friction.

*   **For the Developer:** They use the VS Code and JetBrains adapters to sync their coding style, the `aider` adapter for CLI-based refactoring, and the `connector-github` for code-aware context.
*   **For the Marketer / Digital Transformation Professional:** They use the NAAvOS browser extension to bring their persona into ChatGPT and Claude.ai. Their Avatar's knowledge is sourced from Notion and Google Drive via the respective connectors, ensuring the AI always has the latest campaign brief and performance data. The experience is simple and requires no coding.
*   **For the High-Functional Individual:** They can mix and match. They might use the CLI for some tasks but rely on the browser extension for others. Their knowledge base could be a hybrid of local files for private notes and a cloud connector for shared projects, providing seamless handover and continuity.
*   **For the Team:** A shared `Avatar-Source-Package` can be used to generate consistent configurations for all team members. The knowledge source can point to a shared Notion workspace or Google Drive folder, ensuring all AI agents work from the same playbook.

By embracing open standards, leveraging existing tools, and providing a flexible adapter-based architecture, NAAvOS will become the essential "operating system" for anyone who wants to work effectively with a diverse suite of AI tools.