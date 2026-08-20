import { z } from 'zod';

// Common properties for all knowledge sources
const BaseKnowledgeSourceSchema = z.object({
  id: z.string().uuid().describe('Unique identifier for the knowledge source.'),
  name: z.string().min(1).describe('Human-readable name for the knowledge source.'),
  description: z.string().optional().describe('A brief description of the knowledge source.'),
  purpose: z.string().min(1).describe('The primary purpose of this knowledge source (e.g., "project history", "academic research", "marketing assets").'),
  dataClass: z.enum(['text', 'code', 'structured', 'academic', 'multimodal', 'conversational']).describe('Classification of the data type stored in this source.'),
  retrievalPolicy: z.enum(['rag', 'direct-query', 'graph-traversal', 'semantic-search']).describe('How information should be retrieved from this source.'),
  freshness: z.string().regex(/^(daily|weekly|monthly|hourly|\d+(h|m|s))$/).describe('How often the source should be checked for updates (e.g., "daily", "24h").'),
  visibility: z.enum(['private', 'team', 'public']).describe('Who can access this knowledge source.'),
  // Secrets are never embedded, only referenced.
  credentialRef: z.string().optional().describe('Reference to a secret manager for credentials needed to access this source (e.g., "doppler://project/config/API_KEY").'),
});

// Specific schema for the Cognee connector
const CogneeKnowledgeSourceSchema = BaseKnowledgeSourceSchema.extend({
  type: z.literal('connector-cognee').describe('Type of knowledge connector.'),
  config: z.object({
    endpoint: z.string().url().optional().describe('Local endpoint for the Cognee instance, if self-hosted.'),
    indexName: z.string().optional().describe('The specific index or collection within Cognee to query.'),
    rebuildable: z.boolean().default(true).describe('Indicates if the Cognee graph can be rebuilt from canonical NAAvOS sources.'),
    // Add other Cognee specific configurations if needed
  }).describe('Configuration specific to the Cognee connector.'),
});

// Specific schema for a Filesystem connector
const FilesystemKnowledgeSourceSchema = BaseKnowledgeSourceSchema.extend({
  type: z.literal('connector-filesystem').describe('Type of knowledge connector.'),
  config: z.object({
    path: z.string().min(1).describe('Absolute path to the local directory to index.'),
    includePatterns: z.array(z.string()).optional().describe('Glob patterns for files to include (e.g., "*.md", "*.pdf").'),
    excludePatterns: z.array(z.string()).optional().describe('Glob patterns for files to exclude.'),
    recursive: z.boolean().default(true).describe('Whether to recursively scan subdirectories.'),
  }).describe('Configuration specific to the Filesystem connector.'),
});

// Specific schema for a Notion connector (example from ECOSYSTEM_INTEROPERABILITY_STRATEGY.md)
const NotionKnowledgeSourceSchema = BaseKnowledgeSourceSchema.extend({
  type: z.literal('connector-notion').describe('Type of knowledge connector.'),
  config: z.object({
    workspaceId: z.string().optional().describe('Notion workspace ID.'),
    pageIds: z.array(z.string()).optional().describe('Specific Notion page IDs to index.'),
    databaseIds: z.array(z.string()).optional().describe('Specific Notion database IDs to index.'),
    // Add other Notion specific configurations if needed
  }).describe('Configuration specific to the Notion connector.'),
});

// Specific schema for the ReMe memory connector
const ReMeKnowledgeSourceSchema = BaseKnowledgeSourceSchema.extend({
  type: z.literal('connector-reme').describe('Type of knowledge connector.'),
  config: z.object({
    workspaceDir: z.string().optional().describe('Path to the ReMe workspace directory. Defaults to .reme/ in the project root.'),
    servicePort: z.number().int().default(2333).describe('Port for the ReMe HTTP service.'),
    enableAutoMemory: z.boolean().default(true).describe('Enable automatic conversation memory capture.'),
    enableAutoDream: z.boolean().default(true).describe('Enable automatic daily memory consolidation.'),
    enableEmbeddings: z.boolean().default(false).describe('Enable embedding-based semantic retrieval. Requires LLM credentials.'),
    credentialRef: z.string().optional().describe('Reference to secret manager for LLM API credentials (e.g., "doppler://project/config/LLM_API_KEY").'),
  }).describe('Configuration specific to the ReMe connector.'),
});

// The overall KnowledgeSourceSchema as a union of all connector types
export const KnowledgeSourceSchema = z.union([
  CogneeKnowledgeSourceSchema,
  FilesystemKnowledgeSourceSchema,
  NotionKnowledgeSourceSchema,
  ReMeKnowledgeSourceSchema,
  // Add other connector schemas here as they are developed (e.g., GDrive, Airtable, GitHub, SQL, Vectorstore)
]);

// The knowledge_sources section of the Avatar-Source-Package is an array of these schemas
export const AvatarKnowledgeSourcesSchema = z.array(KnowledgeSourceSchema)
  .describe('A list of knowledge sources used by the Avatar, each defined by a specific connector and configuration.');

// --- Examples ---

// Example for connector-cognee
export const exampleCogneeSource = {
  id: 'ks-cognee-main-123',
  name: 'Main Cognitive Graph (Cognee)',
  description: 'Primary RAG and persistent memory for general knowledge and project context, powered by Cognee.',
  purpose: 'General knowledge retrieval and graph-based reasoning.',
  dataClass: 'multimodal',
  retrievalPolicy: 'graph-traversal',
  freshness: 'hourly',
  visibility: 'private',
  type: 'connector-cognee',
  config: {
    endpoint: 'http://localhost:8000/cognee-api', // Example local endpoint where Cognee is running
    indexName: 'naavos-main-graph',
    rebuildable: true,
  },
};

// Example for connector-filesystem
export const exampleFilesystemSource = {
  id: 'ks-local-docs-456',
  name: 'Local Project Documentation',
  description: 'Local markdown and PDF documents for current projects.',
  purpose: 'Retrieval for project-specific documentation.',
  dataClass: 'text',
  retrievalPolicy: 'rag',
  freshness: 'daily',
  visibility: 'team',
  type: 'connector-filesystem',
  config: {
    path: '/Users/radossagency/Documents/NAAS/projects/current-project/docs',
    includePatterns: ['*.md', '*.pdf'],
    excludePatterns: ['temp/*', 'drafts/*'],
    recursive: true,
  },
};

// Example for connector-notion
export const exampleNotionSource = {
  id: 'ks-notion-marketing-789',
  name: 'Marketing Content Calendar (Notion)',
  description: 'Notion database containing marketing content plans and assets.',
  purpose: 'Strategic planning and content generation for marketing.',
  dataClass: 'structured',
  retrievalPolicy: 'direct-query',
  freshness: 'daily',
  visibility: 'team',
  credentialRef: 'doppler://marketing-project/prd/NOTION_API_KEY',
  type: 'connector-notion',
  config: {
    databaseIds: ['a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'],
    pageIds: ['q1w2e3r4t5y6u7i8o9p0a1s2d3f4g5h6'],
  },
};

// Example for connector-reme
export const exampleReMeSource = {
  id: 'ks-reme-memory-001',
  name: 'Personal Memory (ReMe)',
  description: 'Local-first, self-evolving memory layer powered by ReMe. Stores conversations, resources, and distilled knowledge as Markdown.',
  purpose: 'Long-term memory, conversation recall, and knowledge consolidation.',
  dataClass: 'conversational',
  retrievalPolicy: 'semantic-search',
  freshness: 'hourly',
  visibility: 'private',
  type: 'connector-reme',
  config: {
    workspaceDir: '.reme',
    servicePort: 2333,
    enableAutoMemory: true,
    enableAutoDream: true,
    enableEmbeddings: false,
    credentialRef: 'doppler://naavos/LLM_API_KEY',
  },
};