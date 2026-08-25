/**
 * NAAvOS Core Avatar Schema
 * Define and validate your cognitive profile for AI agents
 */

export const AVATAR_SCHEMA_VERSION = '1.0';

/**
 * Neutral default avatar schema structure.
 * Copy this to your local avatar package and replace the placeholders
 * with your own preferences. This product default intentionally contains
 * no personal identity, psychological labels, or private stack choices.
 */
export const defaultSchema = {
  avatar_api: {
    version: AVATAR_SCHEMA_VERSION,
    owner: 'YOUR_NAME',
    endpoint_type: 'Static-Context-Inject',
    description:
      'JSON object to be requested or read by any AI tool to quickly adopt your cognitive framework.',

    communication_style: {
      verbosity: 'concise',
      structure: 'bulleted, action-oriented',
      tone: 'direct and factual',
    },

    operating_rules: [
      'Always cite evidence before claiming a task is complete.',
      'Prefer concrete, inspectable outputs over lengthy explanations.',
      'Ask for clarification when requirements are ambiguous instead of guessing.',
      'Respect project boundaries; do not leak context across unrelated projects.',
    ],

    favorite_stack: {
      hosting: ['YOUR_HOSTING_PLATFORM'],
      frontend: ['YOUR_FRONTEND_FRAMEWORK'],
      secrets: ['YOUR_SECRET_MANAGER'],
      strategy_framework: ['YOUR_FRAMEWORK'],
    },

    trigger_modes: {
      focused_delivery: {
        condition: 'Tight deadlines or explicit commands to move quickly.',
        action: 'Increase conciseness and deliver the smallest working fix first.',
      },
      exploration: {
        condition: 'Brainstorming, market mapping, or new product architecting.',
        action: 'Synthesize options broadly, then recommend the most testable path.',
      },
    },
  },
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
      owner: userConfig.name || 'YOUR_NAME',
      description: userConfig.description || defaultSchema.avatar_api.description,
      communication_style: {
        ...defaultSchema.avatar_api.communication_style,
        ...userConfig.communication_style,
      },
      operating_rules: userConfig.rules || defaultSchema.avatar_api.operating_rules,
      favorite_stack: {
        ...defaultSchema.avatar_api.favorite_stack,
        ...userConfig.stack,
      },
    },
  };
}

export default { defaultSchema, validateSchema, createAvatar };
