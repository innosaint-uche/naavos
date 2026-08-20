# NAAvOS API Reference

## MCP Server Endpoints

### Base URL

```
https://api.naavos.io/mcp/v1
```

### Authentication

Include your API key in the `X-NAAVOS-User-ID` header:

```
X-NAAVOS-User-ID: your-user-id
```

## Endpoints

### `GET /health`

Check server health.

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-05-22T12:00:00Z"
}
```

---

### `GET /load`

Load your avatar profile.

**Headers:**
- `X-NAAVOS-User-ID` (required)

**Response:**
```json
{
  "avatar_api": {
    "version": "1.0",
    "owner": "Your Name",
    "cognitive_profile": {
      "mbti_oscillations": ["ENTP-A"],
      "neuro_signature": ["2e"],
      "communication_style": {
        "verbosity": "minimal",
        "structure": "bulleted"
      }
    },
    "strict_operational_rules": [
      "Execute 70% faster",
      "Zero fluff"
    ]
  }
}
```

---

### `POST /sync`

Sync your avatar across all connected platforms.

**Request:**
```json
{
  "avatar": { ... },
  "platforms": ["claude-code", "gemini", "cursor"]
}
```

**Response:**
```json
{
  "success": true,
  "synced": {
    "timestamp": "2026-05-22T12:00:00Z",
    "platforms": ["claude-code", "gemini", "cursor"],
    "avatar_hash": "abc123"
  }
}
```

---

### `POST /avatar`

Create or update your avatar.

**Request:**
```json
{
  "avatar": {
    "avatar_api": {
      "version": "1.0",
      "owner": "Your Name",
      ...
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "avatar": { ... },
  "saved_at": "2026-05-22T12:00:00Z"
}
```

---

### `GET /kb`

Get your knowledge base.

**Response:**
```json
{
  "projects": [
    {
      "id": "proj-123",
      "name": "My Project",
      "description": "...",
      "tags": ["nextjs", "react"],
      "status": "Active"
    }
  ],
  "last_updated": "2026-05-22T12:00:00Z"
}
```

---

## Rate Limits

| Tier | Requests/minute | Requests/day |
|------|-----------------|--------------|
| Free | 60 | 1,000 |
| Pro | 300 | 10,000 |
| Team | 1,000 | 100,000 |

## Error Codes

| Code | Meaning |
|------|--------|
| 400 | Bad request |
| 401 | Unauthorized |
| 404 | Not found |
| 429 | Rate limited |
| 500 | Server error |