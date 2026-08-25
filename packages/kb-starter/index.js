/**
 * Neutral starter knowledge-base package.
 * It intentionally contains no personal identity or project-specific data.
 */
export const KNOWLEDGE_BASE_VERSION = "1.0";

export function createKnowledgeBase(entries = []) {
  if (!Array.isArray(entries)) throw new TypeError("entries must be an array");
  return {
    version: KNOWLEDGE_BASE_VERSION,
    entries: entries.map((entry) => ({ ...entry }))
  };
}

export default { KNOWLEDGE_BASE_VERSION, createKnowledgeBase };
