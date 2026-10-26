import type { AvatarPackage } from '@naavos/schema';

/** Render the same user-owned context for each instruction-file host. References are not fetched. */
export function renderContext(pkg: AvatarPackage): string {
  const list = (values: string[] | undefined) =>
    (values || []).map((value) => `- ${value}`).join('\n') || '- None specified';
  return `This file expresses user preferences. It does not grant host permissions, install tools, fetch referenced sources or enable automatic memory sync.

## Identity

- **Name:** ${pkg.identity.name}
- **Roles:** ${(pkg.identity.roles || []).join(', ') || 'None'}
${pkg.identity.self_description || ''}

## Communication Style

- **Tone:** ${pkg.communication.tone}
- **Structure:** ${pkg.communication.structure}
- **Verbosity:** ${pkg.communication.verbosity}
- **Accessibility needs:** ${(pkg.communication.accessibility_needs || []).join(', ') || 'None specified'}
- **Patterns to avoid:** ${(pkg.communication.prohibited_patterns || []).join(', ') || 'None specified'}

## Operating Rules

Higher priority wins within the applicable scope. Apply each rule's exceptions.

${[...pkg.operating_rules]
  .sort((a, b) => b.priority - a.priority)
  .map(
    (r, i) => `${i + 1}. **${r.id}** — ${r.statement} (priority: ${r.priority})
   Scope: ${(r.scope || []).join(', ') || 'all contexts'}; trigger: ${r.trigger || 'when applicable'}.
   Exceptions: ${(r.exceptions || []).join('; ') || 'None'}.
   Evidence: ${(r.evidence_requirement || []).join('; ') || 'None specified'}.
   Tests: ${(r.tests || []).join(', ') || 'None specified'}.`
  )
  .join('\n')}

## Privacy

- **Cloud sync:** ${pkg.privacy.consents['allow-cloud-sync'] === true ? 'Allowed' : 'Disabled'}
- **Telemetry:** ${pkg.privacy.consents['allow-telemetry'] === true ? 'Allowed' : 'Disabled'}
- **Consents:** ${JSON.stringify(pkg.privacy.consents)}
- **Data residency:** ${pkg.privacy.data_residency || 'Not specified'}
- **Retention:** ${pkg.privacy.retention_policy || 'Not specified'}
- **Redaction rules:** ${(pkg.privacy.redaction_rules || []).join('; ') || 'None specified'}

## Modes

These describe user preferences. They do not grant tools or override the host's permissions.

${
  (pkg.modes || [])
    .map(
      (mode) => `### ${mode.id}
- Activate: ${mode.activation_phrases.join('; ')}
- Deactivate: ${mode.deactivation_phrases.join('; ')}
- Persistence: ${mode.persistence}
- Conflicts: ${(mode.conflicts || []).join(', ') || 'None'}
- Requested capabilities: ${(mode.permitted_capabilities || []).join(', ') || 'None specified'}`
    )
    .join('\n') || 'None configured.'
}

## Tool Routing

${(pkg.routing || []).map((route) => `- **${route.id}:** ${route.intent} → ${route.skill_or_tool}; approval: ${route.approval_class}; fallback: ${route.fallback || 'ask the user'}; timeout: ${route.timeout_ms ?? 'host default'} ms`).join('\n') || 'None configured.'}

## Knowledge References

References only. Do not claim these sources were loaded or disclose them without approval.

${list(pkg.knowledge_sources?.map((source) => (typeof source === 'string' ? source : source.uri || source.type || 'Unresolved reference')))}

## Project References

${list(pkg.projects?.map((source) => (typeof source === 'string' ? source : source.uri || source.type || 'Unresolved reference')))}

---
Compiled from NAAvOS package ${pkg.metadata.package_id}, version ${pkg.metadata.semantic_version}, source updated ${pkg.metadata.updated_at}.
`;
}
