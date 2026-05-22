/**
 * N-A-A-S MCP Server — Cloudflare Workers
 * Model Context Protocol endpoint for AI tool integration
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-NAASS-User-ID, Authorization'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Routes
    if (url.pathname === '/mcp/v1/load') {
      return handleLoad(request, env, corsHeaders);
    }
    
    if (url.pathname === '/mcp/v1/sync') {
      return handleSync(request, env, corsHeaders);
    }
    
    if (url.pathname === '/mcp/v1/health') {
      return handleHealth(corsHeaders);
    }
    
    if (url.pathname === '/mcp/v1/avatar') {
      return handleAvatar(request, env, corsHeaders);
    }

    // Default
    return new Response(
      JSON.stringify({ 
        service: 'N-A-A-S MCP Server',
        version: '1.0.0',
        status: 'running'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * Load avatar from storage
 * GET /mcp/v1/load?user_id=xxx
 */
async function handleLoad(request, env, headers) {
  const userId = request.headers.get('X-NAASS-User-ID') || 'demo';
  
  // In production, fetch from D1
  const avatar = {
    avatar_api: {
      version: "1.0",
      owner: "Demo User",
      endpoint_type: "MCP-Dynamic-Inject",
      cognitive_profile: {
        mbti_oscillations: ["ENTP-A"],
        neuro_signature: ["2e"],
        communication_style: {
          verbosity: "minimal",
          structure: "bulleted"
        }
      },
      strict_operational_rules: [
        "Execute 70% faster",
        "Zero fluff"
      ]
    }
  };

  return new Response(JSON.stringify(avatar), {
    headers: { ...headers, 'Content-Type': 'application/json' }
  });
}

/**
 * Sync avatar across platforms
 * POST /mcp/v1/sync
 */
async function handleSync(request, env, headers) {
  try {
    const body = await request.json();
    
    return new Response(JSON.stringify({
      success: true,
      synced: {
        timestamp: new Date().toISOString(),
        platforms: body.platforms || ['claude-code', 'gemini', 'cursor'],
        avatar_hash: body.hash || 'abc123'
      }
    }), {
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Health check
 */
function handleHealth(headers) {
  return new Response(JSON.stringify({
    status: 'healthy',
    uptime: process.uptime?.() || 0,
    timestamp: new Date().toISOString()
  }), {
    headers: { ...headers, 'Content-Type': 'application/json' }
  });
}

/**
 * Get/Update avatar
 * POST /mcp/v1/avatar
 */
async function handleAvatar(request, env, headers) {
  if (request.method === 'GET') {
    return handleLoad(request, env, headers);
  }
  
  try {
    const body = await request.json();
    
    return new Response(JSON.stringify({
      success: true,
      avatar: body.avatar,
      saved_at: new Date().toISOString()
    }), {
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...headers, 'Content-Type': 'application/json' }
    });
  }
}