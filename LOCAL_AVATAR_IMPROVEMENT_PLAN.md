# Local Avatar OS: Solidification & Enhancement Plan

This document outlines a strategic plan to tighten, clean up, and enhance the local Avatar OS, evolving it from a collection of files into a robust, automated, and secure system.

## 1. File Arrangement & Structure Refinement

The current structure has some redundancy. We will consolidate and simplify it.

**Proposed New Structure:**

```
/Users/radossagency/Documents/Uchenna-Avatar-OS/
├── .gitignore
├── README.md
├── avatar.toml         # NEW: Single source of truth for config
├── schema/
│   ├── avatar.json     # Formerly avatar_schema.json
│   └── project.json    # NEW: Schema for project entries
├── persona/
│   ├── core.md         # Formerly core_identity.md
│   ├── style.md        # Formerly working_style.md
│   └── modes/
│       ├── cto.md
│       └── cco.md
├── knowledge/
│   └── projects.json   # Formerly projects_registry.json
└── automations/
    ├── sync.sh         # Formerly sync-avatar.sh
    ├── check.sh        # Formerly avatar-check.sh
    ├── secrets.sh      # NEW: Secrets scanner
    └── test.sh         # NEW: Conformance tester
```

**Key Changes:**

-   **`avatar.toml`**: A new top-level configuration file. It will define paths to all other files, removing hardcoded paths from scripts. This makes the entire system more portable.
-   **`persona/` directory**: Consolidates all markdown-based identity files.
-   **`schema/` directory**: Centralizes all JSON schemas.
-   **Simplified Script Names**: `sync.sh`, `check.sh` are more standard.

## 2. System Tightening & Enhancements

### 2.1. Automated Conformance Testing (`automations/test.sh`)

Move beyond just checking if files exist. We need to test if agents *behave* correctly.

**`test.sh` would:**
1.  Define a series of test prompts (e.g., "What is your primary directive?", "What is my preferred tech stack?").
2.  Use a CLI tool (like `oai`, `claude-cli`, or a custom script) to send these prompts to the configured agents.
3.  Compare the agent's output against an expected output derived from `avatar.toml` and persona files.
4.  Report a pass/fail score.

This turns the "health check" into a true unit test for the avatar's personality.

### 2.2. Robust Secret Management (`automations/secrets.sh`)

Address the critical security flaw.

**`secrets.sh` would:**
1.  Integrate with a tool like `trufflehog` or `gitleaks`.
2.  Scan `knowledge/projects.json` and other key files for anything resembling a secret (API keys, passwords).
3.  If a secret is found, it will **fail the build/check** and refuse to sync.
4.  **Action:** Immediately run this and replace all found plaintext secrets in `projects.json` with Doppler references (e.g., `doppler://traveltank-2026/prd/API_KEY`).

### 2.3. Automated, Watch-Based Syncing

The manual `sync.sh` step is unreliable. We will automate it.

-   **Use a file watcher**: A tool like `fswatch` (macOS) or `entr` can be used to monitor the `persona/` and `knowledge/` directories.
-   **Trigger `sync.sh` automatically**: On any change, the watcher will automatically trigger `sync.sh` and then `test.sh`.

The new workflow:
`User edits core.md` -> `fswatch detects change` -> `sync.sh runs` -> `test.sh verifies changes` -> `User gets notification of success/failure`.

## 3. Unified "Build" Prompt for Any IDE/Agent

This single prompt can be used to bootstrap any AI agent, instructing it on how to load and use the local Avatar OS.

---

### **Universal Avatar OS Bootloader Prompt**

**Objective:** Initialize my persona, "Uchenna Innocent," by loading and adhering to the context defined in my local Avatar Operating System.

**Instructions:**

1.  **Locate Root Configuration:** The master configuration file for my avatar is located at `/Users/radossagency/Documents/Uchenna-Avatar-OS/avatar.toml`. Parse this file to find the paths to my core persona, knowledge base, and schemas.
2.  **Load Core Persona:**
    *   Read my core identity and absolute rules from the `persona.core` path specified in `avatar.toml`.
    *   Read my working style and preferences from the `persona.style` path.
    *   These documents are your primary directives. Internalize and follow them strictly.
3.  **Load Knowledge Base:**
    *   Read my project history and context from the `knowledge.projects` path in `avatar.toml`. This is your long-term memory. Use it to understand current and past work.
4.  **Confirm Initialization:** Once you have loaded the persona and knowledge files, confirm with the following message:
    `"Uchenna Innocent Avatar OS v[Read version from avatar.toml] initialized. Core directives and project knowledge loaded. Ready for execution."`
5.  **Adherence:** All subsequent responses and actions MUST conform to the rules and styles defined in the loaded persona files. Failure to do so will result in immediate session termination and correction.
