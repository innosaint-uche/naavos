import { z } from 'zod';

/**
 * Base metadata for any versioned entity in NAAvOS.
 */
const MetadataSchema = z.object({
  package_id: z.string().uuid().describe("Unique ID for this package instance."),
  owner_id: z.string().uuid().describe("The user who owns this package."),
  schema_version: z.string().default("1.0.0").describe("The version of the schema this package adheres to."),
  semantic_version: z.string().regex(/^\d+\.\d+\.\d+$/).describe("Semantic version of the package content (e.g., 1.2.3)."),
  created_at: z.string().datetime().describe("ISO 8601 timestamp of creation."),
  updated_at: z.string().datetime().describe("ISO 8601 timestamp of last update."),
  source_provenance: z.string().optional().describe("Origin of the package (e.g., 'created-from-cli', 'imported-from-v0')."),
});

/**
 * Defines the public-facing identity of the user.
 * Sensitive fields are separate and consent-gated.
 */
const IdentitySchema = z.object({
  name: z.string().describe("Public display name."),
  roles: z.array(z.string()).optional().describe("Public roles (e.g., 'Developer', 'Writer')."),
  self_description: z.string().optional().describe("A brief, public self-description."),
});

/**
 * Defines the user's preferred communication style.
 */
const CommunicationSchema = z.object({
  tone: z.string().describe("e.g., 'Direct, authoritative, straight-talk'"),
  structure: z.string().describe("e.g., 'Bulleted, action-oriented'"),
  verbosity: z.string().describe("e.g., 'Minimal — no preamble, no fluff'"),
  accessibility_needs: z.array(z.string()).optional().describe("e.g., 'prefer-tables-over-prose'"),
  prohibited_patterns: z.array(z.string()).optional().describe("Phrases to avoid, e.g., 'As an AI...'"),
});

/**
 * Defines a single, testable operational rule.
 * This moves beyond decorative prose to an enforceable contract.
 */
const RuleSchema = z.object({
  id: z.string().describe("Unique identifier for the rule (e.g., 'evidence.no_false_completion')."),
  statement: z.string().describe("The human-readable rule statement."),
  priority: z.number().int().min(0).max(100).describe("Precedence score (0-100, higher wins)."),
  scope: z.array(z.string()).optional().describe("Contexts where this rule applies (e.g., 'engineering', 'deployment')."),
  trigger: z.string().optional().describe("Event that activates this rule check."),
  exceptions: z.array(z.string()).optional().describe("Conditions under which this rule is ignored."),
  evidence_requirement: z.array(z.string()).optional().describe("Checks required to satisfy the rule (e.g., 'command_exit_code_0')."),
  tests: z.array(z.string()).optional().describe("Names of conformance tests that verify this rule."),
});

/**
 * Defines a persistent mode or persona overlay.
 */
const ModeSchema = z.object({
  id: z.string().describe("Unique ID for the mode (e.g., 'cto_mode')."),
  activation_phrases: z.array(z.string()).describe("Phrases that trigger this mode."),
  deactivation_phrases: z.array(z.string()).describe("Phrases that deactivate this mode."),
  persistence: z.enum(['session', 'project', 'global']).describe("How long the mode stays active."),
  conflicts: z.array(z.string()).optional().describe("List of mode IDs this mode cannot be active with."),
  permitted_capabilities: z.array(z.string()).optional().describe("Specific tools or skills enabled by this mode."),
});

/**
 * Defines routing logic for mapping user intent to a specific tool or skill.
 */
const RouteSchema = z.object({
  id: z.string().describe("Unique ID for the route."),
  intent: z.string().describe("The user intent this route handles (e.g., 'create-video')."),
  skill_or_tool: z.string().describe("The target skill or tool to invoke."),
  approval_class: z.enum(['auto', 'human_approval_required']).default('auto').describe("Approval needed for this route."),
  fallback: z.string().optional().describe("Action to take if the primary tool fails."),
  timeout_ms: z.number().int().optional().describe("Timeout in milliseconds."),
});

/**
 * Defines privacy consents and data handling rules.
 */
const PrivacySchema = z.object({
  consents: z.record(z.boolean()).describe("Record of user consents for specific data processing activities."),
  data_residency: z.string().optional().describe("Preferred geographic region for data storage."),
  retention_policy: z.string().optional().describe("e.g., 'delete-after-90-days'"),
  redaction_rules: z.array(z.string()).optional().describe("Patterns to redact from logs and outputs."),
});

/**
 * Defines a target AI host and its requirements.
 */
const AdapterTargetSchema = z.object({
  host_id: z.string().describe("The target host ID (e.g., 'claude-code', 'gemini-cli')."),
  min_adapter_version: z.string().regex(/^\d+\.\d+\.\d+$/).describe("Minimum required version of the host adapter."),
  unsupported_behaviour_policy: z.enum(['fail', 'warn', 'ignore']).default('warn').describe("How to handle rules the host can't support."),
});

/**
 * The primary Avatar Source Package schema.
 * This is the single source of truth for a user's AI persona.
 * Based on the contract in NAAS-Avatar-OS-Productisation-System-Design.pdf.
 */
export const AvatarPackageSchema = z.object({
  metadata: MetadataSchema.describe("Package metadata and versioning."),
  
  identity: IdentitySchema.describe("Public identity information."),
  
  communication: CommunicationSchema.describe("Preferred communication style for AI interactions."),
  
  operating_rules: z.array(RuleSchema).min(1).describe("A list of testable, prioritized operational rules."),
  
  privacy: PrivacySchema.describe("User consents and data handling policies."),
  
  adapters: z.array(AdapterTargetSchema).min(1).describe("A list of target AI hosts this package is configured for."),
  
  evals: z.array(z.string()).describe("References to evaluation packs required for release gating."),

  // Optional sections
  modes: z.array(ModeSchema).optional().describe("Defines persistent persona overlays like 'CTO Mode'."),
  
  routing: z.array(RouteSchema).optional().describe("Rules for routing user intents to specific tools or skills."),
  
  knowledge_sources: z.array(z.string()).optional().describe("References (URIs/paths) to external knowledge sources. Secrets are never embedded."),
  
  projects: z.array(z.string()).optional().describe("References (URIs/paths) to canonical project definitions."),
});

export type AvatarPackage = z.infer<typeof AvatarPackageSchema>;


// --- Example Usage ---

const exampleRule: z.infer<typeof RuleSchema> = {
  id: "evidence.no_false_completion",
  statement: "Never claim completion without observed validation evidence.",
  priority: 80,
  scope: ["engineering", "deployment", "media"],
  trigger: "assistant_about_to_claim_complete",
  evidence_requirement: ["command_exit_code_0", "artifact_exists", "semantic_check"],
  tests: ["completion_without_test_fails", "runner_blocker_is_disclosed"],
};

const examplePackage: AvatarPackage = {
  metadata: {
    package_id: "a1b2c3d4-e5f6-7777-8888-999999999999",
    owner_id: "f6e5d4c3-b2a1-8888-7777-666666666666",
    schema_version: "1.0.0",
    semantic_version: "1.0.0",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    source_provenance: "created-from-cli"
  },
  identity: {
    name: "Uchenna Innocent",
    roles: ["Founder", "Systems Architect"]
  },
  communication: {
    tone: "Direct, authoritative",
    structure: "Bulleted, action-oriented",
    verbosity: "Minimal"
  },
  operating_rules: [exampleRule],
  privacy: {
    consents: { "allow-cloud-sync": false, "allow-telemetry": true }
  },
  adapters: [
    { host_id: "claude-code", min_adapter_version: "1.0.0", unsupported_behaviour_policy: "warn" },
    { host_id: "gemini-cli", min_adapter_version: "1.1.0", unsupported_behaviour_policy: "fail" }
  ],
  evals: ["eval-pack-core-v1", "eval-pack-safety-v1.2"],
};