# tools/

Phase 2+. Each add-on is self-contained: a name, a permission tier, an input
schema, and an execute function — treat it like MCP tool design, small and
single-purpose. See CLAUDE.md section 3.3 for the candidate list and value
ordering.

Empty until Phase 2. `core/permissions.ts` (the confirmation gate every
add-on must go through) is deferred until the first tool needs it.
