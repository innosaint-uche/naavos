/**
 * NAAvOS Core Avatar Schema
 * Define and validate your cognitive profile for AI agents
 */

export const AVATAR_SCHEMA_VERSION = '1.0';

export interface FavoriteStack {
  hosting?: string[];
  frontend?: string[];
  secrets?: string[];
  strategy_framework?: string[];
}

export interface TriggerMode {
  condition: string;
  action: string;
}

export interface TriggerModes {
  focused_delivery?: TriggerMode;
  exploration?: TriggerMode;
  [key: string]: TriggerMode | undefined;
}

export interface AvatarApi {
  version: string;
  owner: string;
  endpoint_type: string;
  description: string;
  communication_style: {
    verbosity: string;
    structure: string;
    tone: string;
  };
  operating_rules: string[];
  favorite_stack: FavoriteStack;
  trigger_modes: TriggerModes;
}

export interface AvatarSchema {
  avatar_api: AvatarApi;
}

export interface CreateAvatarConfig {
  name?: string;
  description?: string;
  communication_style?: Partial<AvatarApi['communication_style']>;
  rules?: string[];
  stack?: Partial<FavoriteStack>;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Neutral default avatar schema structure.
 * Copy this to your local avatar package and replace the placeholders
 * with your own preferences. This product default intentionally contains
 * no personal identity, psychological labels, or private stack choices.
 */
export const defaultSchema: AvatarSchema = {
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
export function validateSchema(schema: unknown): ValidationResult {
  const required = ['avatar_api', 'avatar_api.version', 'avatar_api.owner'];

  for (const path of required) {
    const parts = path.split('.');
    let current: unknown = schema;
    for (const part of parts) {
      if (current === undefined || current === null || typeof current !== 'object') {
        return { valid: false, error: `Missing required field: ${path}` };
      }
      if (!(part in current)) {
        return { valid: false, error: `Missing required field: ${path}` };
      }
      current = (current as Record<string, unknown>)[part];
    }
  }

  return { valid: true };
}

/**
 * Create a new avatar schema from template
 */
export function createAvatar(userConfig: CreateAvatarConfig = {}): AvatarSchema {
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
