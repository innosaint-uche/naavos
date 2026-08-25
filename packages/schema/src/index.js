import { z } from 'zod';

export const MetadataSchema = z.object({
  package_id: z.string().uuid().describe('Unique ID for this package instance.'),
  owner_id: z.string().uuid().describe('The user who owns this package.'),
  schema_version: z
    .string()
    .default('1.0.0')
    .describe('The version of the schema this package adheres to.'),
  semantic_version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/)
    .describe('Semantic version of the package content (e.g., 1.2.3).'),
  created_at: z.string().datetime().describe('ISO 8601 timestamp of creation.'),
  updated_at: z.string().datetime().describe('ISO 8601 timestamp of last update.'),
  source_provenance: z
    .string()
    .optional()
    .describe("Origin of the package (e.g., 'created-from-cli', 'imported-from-v0')."),
});

export const IdentitySchema = z.object({
  name: z.string().describe('Public display name.'),
  roles: z.array(z.string()).optional().describe("Public roles (e.g., 'Developer', 'Writer')."),
  self_description: z.string().optional().describe('A brief, public self-description.'),
});

export const CommunicationSchema = z.object({
  tone: z.string().describe("e.g., 'Direct, authoritative, straight-talk'"),
  structure: z.string().describe("e.g., 'Bulleted, action-oriented'"),
  verbosity: z.string().describe("e.g., 'Minimal — no preamble, no fluff'"),
  accessibility_needs: z.array(z.string()).optional().describe("e.g., 'prefer-tables-over-prose'"),
  prohibited_patterns: z
    .array(z.string())
    .optional()
    .describe("Phrases to avoid, e.g., 'As an AI...'"),
});

export const RuleSchema = z.object({
  id: z.string().describe("Unique identifier for the rule (e.g., 'evidence.no_false_completion')."),
  statement: z.string().describe('The human-readable rule statement.'),
  priority: z.number().int().min(0).max(100).describe('Precedence score (0-100, higher wins).'),
  scope: z
    .array(z.string())
    .optional()
    .describe("Contexts where this rule applies (e.g., 'engineering', 'deployment')."),
  trigger: z.string().optional().describe('Event that activates this rule check.'),
  exceptions: z
    .array(z.string())
    .optional()
    .describe('Conditions under which this rule is ignored.'),
  evidence_requirement: z
    .array(z.string())
    .optional()
    .describe("Checks required to satisfy the rule (e.g., 'command_exit_code_0')."),
  tests: z
    .array(z.string())
    .optional()
    .describe('Names of conformance tests that verify this rule.'),
});

export const ModeSchema = z.object({
  id: z.string().describe("Unique ID for the mode (e.g., 'cto_mode')."),
  activation_phrases: z.array(z.string()).describe('Phrases that trigger this mode.'),
  deactivation_phrases: z.array(z.string()).describe('Phrases that deactivate this mode.'),
  persistence: z.enum(['session', 'project', 'global']).describe('How long the mode stays active.'),
  conflicts: z
    .array(z.string())
    .optional()
    .describe('List of mode IDs this mode cannot be active with.'),
  permitted_capabilities: z
    .array(z.string())
    .optional()
    .describe('Specific tools or skills enabled by this mode.'),
});

export const RouteSchema = z.object({
  id: z.string().describe('Unique ID for the route.'),
  intent: z.string().describe("The user intent this route handles (e.g., 'create-video')."),
  skill_or_tool: z.string().describe('The target skill or tool to invoke.'),
  approval_class: z
    .enum(['auto', 'human_approval_required'])
    .default('auto')
    .describe('Approval needed for this route.'),
  fallback: z.string().optional().describe('Action to take if the primary tool fails.'),
  timeout_ms: z.number().int().optional().describe('Timeout in milliseconds.'),
});

export const PrivacySchema = z.object({
  consents: z
    .record(z.boolean())
    .describe('Record of user consents for specific data processing activities.'),
  data_residency: z.string().optional().describe('Preferred geographic region for data storage.'),
  retention_policy: z.string().optional().describe("e.g., 'delete-after-90-days'"),
  redaction_rules: z
    .array(z.string())
    .optional()
    .describe('Patterns to redact from logs and outputs.'),
});

export const AdapterTargetSchema = z.object({
  host_id: z.string().describe("The target host ID (e.g., 'claude-code', 'gemini-cli')."),
  min_adapter_version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/)
    .describe('Minimum required version of the host adapter.'),
  unsupported_behaviour_policy: z
    .enum(['fail', 'warn', 'ignore'])
    .default('warn')
    .describe("How to handle rules the host can't support."),
});

export const AvatarPackageSchema = z.object({
  metadata: MetadataSchema.describe('Package metadata and versioning.'),
  identity: IdentitySchema.describe('Public identity information.'),
  communication: CommunicationSchema.describe('Preferred communication style for AI interactions.'),
  operating_rules: z
    .array(RuleSchema)
    .min(1)
    .describe('A list of testable, prioritized operational rules.'),
  privacy: PrivacySchema.describe('User consents and data handling policies.'),
  adapters: z
    .array(AdapterTargetSchema)
    .min(1)
    .describe('A list of target AI hosts this package is configured for.'),
  evals: z
    .array(z.string())
    .describe('References to evaluation packs required for release gating.'),
  modes: z
    .array(ModeSchema)
    .optional()
    .describe("Defines persistent persona overlays like 'CTO Mode'."),
  routing: z
    .array(RouteSchema)
    .optional()
    .describe('Rules for routing user intents to specific tools or skills.'),
  knowledge_sources: z
    .array(z.string())
    .optional()
    .describe('References (URIs/paths) to external knowledge sources. Secrets are never embedded.'),
  projects: z
    .array(z.string())
    .optional()
    .describe('References (URIs/paths) to canonical project definitions.'),
});
