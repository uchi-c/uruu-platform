# Tasks — Uruu

## Backlog (Phase 1 — Learning loop)

- [ ] Git activity observer writing to `episodic.db`
- [ ] `consolidate.ts`: episodic entries -> proposed `profile.md` diff,
      reviewed by the user before writing
- [ ] Wire the `claude` backend to exactly `consolidate.ts`'s escalation call

## Backlog (Phase 2 — Add-ons, do not start before Phase 1 acceptance)

- [ ] `core/permissions.ts` — tiered confirmation gate (build on first need)
- [ ] Task/todo capture tool
- [ ] Calendar read + "what's next" tool

## In Progress

_None._

## Done

- [x] Phase 0: CLI chat loop wired to Ollama via `core/llm/provider.ts`
- [x] Phase 0: `profile.md` created on first run, loaded into every session
- [x] Phase 0: `uruu remember "..."` -> episodic log
- [x] Phase 0: tests for the memory read/write path
