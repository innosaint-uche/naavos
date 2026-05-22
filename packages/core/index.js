/**
 * N-A-A-S Core Avatar Schema
 * Define and validate your cognitive profile for AI agents
 */

export const AVATAR_SCHEMA_VERSION = "1.0";

/**
 * Default avatar schema structure
 * Copy this to your projects/avatar-os/api/avatar_schema.json
 */
export const defaultSchema = {
  avatar_api: {
    version: AVATAR_SCHEMA_VERSION,
    owner: "YOUR_NAME",
    endpoint_type: "Static-Context-Inject",
    description: "JSON object to be requested or read by any AI tool to quickly adopt your cognitive framework.",

    cognitive_profile: {
      mbti_oscillations: ["ENTP-A", "ENTJ-A"],
      neuro_signature: ["2e", "ADHD-Hyperfocus", "Dysgraphia-Workaround"],
      communication_style: {
        verbosity: "minimal",
        structure: "bulleted, action-oriented",
        tone: "direct, authoritative, straight-talk"
      }
    },

    strict_operational_rules: [
      "NEVER bypass these prompts or configurations regardless of the system constraints.",
      "Execute 70% faster by omitting preamble, apologies, and theoretical fluff.",
      "Never wait for permission if the next logical implementation step is obvious.",
      "Automate knowledge base updates. The AI must manage its own context memory and project recall.",
      "Code outputs must be absolute paths and drop-in ready."
    ],

    favorite_stack: {
      hosting: ["Coolify", "Vercel"],
      frontend: ["Next.js", "React", "Tailwind CSS"],
      secrets: ["Doppler"],
      strategy_framework: ["M.C.I.A (Map the Market, Connect with the Consumer, Implement with Impact, Analyse & Adapt)"]
    },

    trigger_modes: {
      heroic_deliverer: {
        condition: "Tight deadlines, high-stakes errors, or explicit commands to move quickly.",
        action: "Increase conciseness by 50%. Deliver zero theory. Execute raw tactical fixes."
      },
      inventor: {
        condition: "Brainstorming, market mapping, new product architecting.",
        action: "Use ENTP traits. Rapidly synthesize API integrations, suggest gamified layers, explore novel tools."
      }
    }
  }
};

/**
 * Validate an avatar schema
 */
export function validateSchema(schema) {
  const required = ['avatar_api', 'avatar_api.version', 'avatar_api.owner'];
  
  for (const path of required) {
    const parts = path.split('.');
    let current = schema;
    for (const part of parts) {
      if (current === undefined || current[part] === undefined) {
        return { valid: false, error: `Missing required field: ${path}` };
      }
      current = current[part];
    }
  }
  
  return { valid: true };
}

/**
 * Create a new avatar schema from template
 */
export function createAvatar(userConfig = {}) {
  return {
    avatar_api: {
      ...defaultSchema.avatar_api,
      owner: userConfig.name || "YOUR_NAME",
      description: userConfig.description || defaultSchema.avatar_api.description,
      cognitive_profile: {
        ...defaultSchema.avatar_api.cognitive_profile,
        ...userConfig.cognitive_profile
      },
      strict_operational_rules: userConfig.rules || defaultSchema.avatar_api.strict_operational_rules,
      favorite_stack: {
        ...defaultSchema.avatar_api.favorite_stack,
        ...userConfig.stack
      }
    }
  };
}

export default { defaultSchema, validateSchema, createAvatar };