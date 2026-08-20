# NAAvOS System Product Understanding Document

**Title:** NAAvOS System — Give Every AI Your Brain
**Author:** Gemini Code Assist, Acting CTO
**Version:** 1.1

## 1. High-Level Summary

NAAvOS (Neuro AI - Avatar OS System) is an open-source **compiler and conformance platform** designed to create a portable "digital personality" for a user. This "avatar" consists of a cognitive profile, working style, technical defaults, and project history that is compiled into verified, host-specific instructions for any supported AI tool. The core mission of NAAvOS is to eliminate the repetitive process of explaining context to different AI agents, thereby making AI interactions efficient, personalized, and reliable.

## 2. The Problem

In the current AI landscape, users interact with a multitude of AI agents and tools (e.g., Claude, Gemini, Cursor). Each of these tools operates in a stateless manner, requiring the user to repeatedly provide context about their preferences, work style, and project details. This repetitive process is time-consuming, inefficient, and leads to a fragmented user experience. There is no easy way to make an AI agent "know" you and your work context from the get-go.

## 3. Target Audience

The primary target audience for NAAvOS are developers, knowledge workers, and power users of AI tools who work across multiple platforms and want to streamline their AI interactions.

*   **Developers:** Who want their AI coding assistants to know their preferred tech stack, coding style, and project architecture.
*   **Writers and Content Creators:** Who want their AI writing assistants to understand their tone of voice, style guide, and subject matter expertise.
*   **Consultants and Analysts:** Who want their AI research assistants to be aware of their industry focus, analytical frameworks, and reporting standards.

## 4. Core Components & Features

*   **Cognitive Profile:** A JSON-based schema that defines a user's cognitive profile, including their MBTI type, communication style, and neuro-signature.
*   **Operational Rules:** A set of strict rules that govern how AI agents should behave when interacting with the user (e.g., "70% faster execution," "zero fluff").
*   **Tech Stack and Preferences:** A definition of the user's preferred technologies, frameworks, and tools.
*   **Multi-Platform Support:** The ability to connect and sync the avatar profile across a wide range of AI tools and platforms.
*   **Local-First with Cloud Sync:** The user's data stays on their machine by default, with an option for cloud sync for cross-device access.
*   **CLI for Management:** A command-line interface for initializing, managing, and syncing the avatar profile.
*   **MCP (Model Context Protocol):** A protocol that allows for advanced integrations and real-time context injection.
*   **Compiler & Host Adapters:** The core engine that translates the avatar into host-specific instructions.
*   **Safe Installer:** An atomic, reversible installation mechanism with backups and rollbacks.
*   **Conformance Harness:** A testing suite to verify that AI agents adhere to the avatar's rules.

## 5. Improving the Ecosystem: Reducing Friction for Multi-Agent Workflows

The initial concept is strong, but to truly enhance the ecosystem and not restrict it, we must address the challenge of using multiple IDEs and AI agents on a single project. The goal is seamless handoffs and collaboration.

### 5.1. The "Workspace Context" Solution

Instead of only targeting user-level config files (`~/.gemini/GEMINI.md`), NAAvOS must also generate **project-level context files**.

*   **Action:** The `naavos sync` command will detect the current Git repository and generate a `.naavos/` directory within the project.
*   **Contents:** This directory will contain a `CONTEXT.md` file with project-specific instructions, tech stack details, and API schemas, derived from the user's master `projects_registry.json`.
*   **Benefit:** Any AI agent or IDE extension (VS Code, Cursor, JetBrains) that can read files within the workspace can now access immediate, relevant context without needing a deep, user-level integration. This makes handoffs between agents trivial.

### 5.2. Leveraging Open-Source Tools for Orchestration

To support a diverse ecosystem, we should integrate with existing open-source tools rather than reinventing everything.

*   **LiteLLM (litellm.ai):** This tool provides a unified interface to over 100 LLMs. A NAAvOS `Host Adapter` for LiteLLM would allow a user to define their avatar once and have it apply to any model they call through the LiteLLM proxy. This is a massive force multiplier.
*   **Continue.dev:** An open-source autopilot for IDEs. A NAAvOS integration could provide the `config.ts` for Continue, automatically populating it with the user's preferred models, custom commands, and context providers.
*   **Aider (aider.chat):** A popular command-line AI coding agent that works with a local Git repository. NAAvOS can generate the `.aider.conf.yml` file, pre-configuring it with the project's context and the user's coding style.

### 5.3. The Role of Hermes & MCP

Orchestrators like the described "Hermes" system become far more powerful in this model.

*   **MCP as the Central Hub:** The `naavos-mcp-server` acts as a local API that provides a stable, secure source of truth.
*   **Orchestrator's Job:** Hermes doesn't need to know the details of every agent. It simply queries the MCP for the current context (`mcp/v1/context?project=DeepSynth`) and passes that context to the target agent (Gemini, Claude, etc.). This decouples the orchestrator from the individual agents, making the entire system more robust and easier to maintain.

## 6. Technical Architecture

NAAvOS is a monorepo project with a modern JavaScript-based architecture:

*   **Frontend (`naavos-dashboard`):** A Next.js and React-based web dashboard for managing the avatar profile.
*   **Backend (`naavos-mcp-server`):** A serverless backend built with Cloudflare Workers that exposes the MCP API for real-time sync and data fetching.
*   **Core Library (`@naavos/core`):** A shared library that defines the avatar schema and provides validation functions.
*   **Compiler & Installer (`@naavos/compiler`):** The core engine written in TypeScript/Node.js.
*   **CLI (`@naavos/cli`):** A command-line tool that orchestrates the compiler and installer.

The system is designed to be modular and extensible, allowing for the addition of new AI agent integrations and features in the future.

## 7. Future Roadmap

*   **Cloud Version:** A hosted version of NAAvOS with real-time cross-device sync, a freemium tier, and premium features.
*   **MCP Marketplace:** A marketplace for sharing and discovering pre-built cognitive profiles, rules, and integrations.
*   **Team Features:** The ability to create and share team-level avatars for consistent AI collaboration.
*   **Deeper Integrations:** Deeper and more seamless integrations with a wider range of AI tools and IDEs.
*   **AI-Powered Profile Generation:** An AI-powered feature that helps users generate their cognitive profile based on their writing and coding samples.
*   **Visual Profile Builder:** A more advanced visual builder in the dashboard for creating and customizing the avatar profile.
*   **Version Control for Avatars:** The ability to version and roll back changes to the avatar profile.
*   **Public API for Developers:** A public API that allows third-party developers to build their own integrations and applications on top of the NAAvOS platform.