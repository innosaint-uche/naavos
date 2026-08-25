CREATE TABLE IF NOT EXISTS avatars (
  tenant_id TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS memory_items (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_memory_tenant ON memory_items(tenant_id);

CREATE TABLE IF NOT EXISTS mcp_sessions (
  session_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  protocol_version TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
