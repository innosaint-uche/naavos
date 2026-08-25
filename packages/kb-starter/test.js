import assert from 'node:assert/strict';
import { createKnowledgeBase, KNOWLEDGE_BASE_VERSION } from './index.js';

const result = createKnowledgeBase([{ id: 'fixture-1', content: 'synthetic' }]);
assert.equal(result.version, KNOWLEDGE_BASE_VERSION);
assert.deepEqual(result.entries, [{ id: 'fixture-1', content: 'synthetic' }]);
assert.throws(() => createKnowledgeBase(null), TypeError);
console.log('kb-starter tests: PASS');
