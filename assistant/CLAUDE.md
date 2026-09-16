# CLAUDE.md — Uruu (personal AI operating layer)

This file gives Claude Code the context it needs to keep building **Uruu**
correctly. It is instructions *to* Claude Code, not marketing copy — keep it
that way when you edit it.

**Naming note:** this is a different product from the parent folder,
[`uruu-platform`](../) (Shadow Root Security Technologies' threat-intel /
compliance platform). They share the "Uruu" name by the user's choice and
nothing else — do not mix code, dependencies, or docs between them. This
subproject is self-contained: its own `package.json`, own `node_modules`,
own `.gitignore`.

## 1. What this is

A local-first personal assistant that runs on a **pluggable, mostly-local
model backend** (small open-source models via Ollama by default, escalating
to Claude only for the one step that needs it) and does three things
ordinary chat doesn't:

1. **Remembers** — builds a persistent, structured model of how this
   specific person works: projects, vocabulary, recurring tasks, tools,
   preferences — without re-explaining context every session.
2. **Observes** — passively ingests signals from the user's actual work
   (git activity, file changes, calendar, terminal history) into that
   memory model, instead of relying only on what gets typed into chat.
3. **Acts** — executes real tasks through a permissioned tool layer, and can
   be triggered proactively (schedule or event), not just reactively.

Voice I/O, home automation, and multi-device sync are cosmetic layers on top
of the three things above — build those last, not first.

## 2. Non-negotiable constraints

- **Local-first.** All persistent memory lives on disk under the user's
  control (plain files + a local DB). Nothing about the user's work patterns
  leaves the machine except explicit, opt-in API calls to Claude.
- **Every write to memory is inspectable.** Memory files are human-readable
  (Markdown/YAML/JSON), not an opaque vector blob the user can't audit or
  correct.
- **Every destructive or external action requires an explicit permission
  tier** — read-only (free), reversible (confirm once), irreversible/external
  (confirm every time). Nothing emails, deletes, deploys, or spends money
  without a confirmation step, regardless of how "smart" the learning system
  gets.
- **Ship in phases. Do not start Phase 2 until Phase 1 has passing tests and
  the user has actually used it for a few days.** A memory/learning system
  tuned against zero real usage data is fiction.
- **No new persistent background process, cron job, or file-watcher gets
  added without being listed in `manifest.yaml`**, readable and disable-able
  line by line.

## 3. Architecture (as built)

```
assistant/
├── manifest.yaml            # every backend/observer/trigger/tool, toggleable
├── data/                    # personal memory, gitignored, created on first run
│   ├── profile.md            # created by core/memory/profile.ts
│   └── episodic.db           # created by core/memory/episodic.ts
├── src/
│   ├── index.ts              # CLI entrypoint
│   ├── core/
│   │   ├── manifest.ts        # loads + validates manifest.yaml
│   │   ├── paths.ts           # resolves data/ independent of src/ vs dist/
│   │   ├── engine.ts          # orchestration: profile -> system prompt -> provider
│   │   ├── llm/
│   │   │   └── provider.ts    # swappable backend: local (Ollama) / hf-endpoint / claude
│   │   └── memory/
│   │       ├── profile.ts     # load/create data/profile.md
│   │       └── episodic.ts    # EpisodicStore — SQLite-backed append-only log
│   ├── observers/             # Phase 1+, empty
│   ├── tools/                 # Phase 2+, empty
│   ├── triggers/              # Phase 3+, empty
│   └── interfaces/
│       ├── cli.ts             # `uruu chat` (default) and `uruu remember`
│       ├── voice/             # Phase 3, empty
│       └── gui/                # Phase 4, empty
└── tests/
    └── memory.test.ts         # profile + episodic read/write path
```

`data/` is deliberately outside `src/` and `dist/` — `core/paths.ts` resolves
it relative to the project root regardless of whether code is running from
`src/` (tsx, dev) or `dist/` (built), so `npm run clean` / a rebuild can
never wipe memory. Don't add a path constant anywhere else; route all memory
file access through `core/paths.ts`.

`core/permissions.ts` (the confirmation gate) does not exist yet — Phase 0
has no destructive or external actions to gate. Add it when the first Phase 2
tool needs it, not before.

### 3.1 Memory system (the core differentiator)

- `profile.md`: sections for *Current Projects*, *Recurring Tasks*,
  *Preferences & Conventions*, *Vocabulary/Shorthand*, *Open Questions*.
  Loaded into every chat session's system prompt — same pattern as this
  repo's own `CLAUDE.md`, applied to a person instead of a codebase.
- `episodic.db` (via `EpisodicStore`): append-only log of discrete events
  (right now: manual `uruu remember` notes; later: commits, sessions,
  corrections). Raw material — never load it wholesale into context.
- `consolidate.ts` (Phase 1, not built): runs on a schedule or on-demand.
  Reads new episodic entries, proposes edits to `profile.md`, **shows the
  diff before writing**. This is the "learning" step — it must be a
  reviewable diff, not silent rewriting.

### 3.2 Observers (Phase 1+)

One isolated module per passive signal source, each with its own on/off
switch in `manifest.yaml`. Start with git activity, prove it works, then add
the next. No generic "watch everything" observer.

### 3.3 Tools / add-ons (Phase 2+)

Self-contained: name, permission tier, input schema, execute function.
Treat it like MCP tool design. Candidates in `manifest.yaml`'s `tools:`
list, roughly in value-to-effort order: task/todo capture, calendar
read/"what's next", repo-aware Q&A (reuse Claude Code, don't rebuild it),
email drafting (draft only, never auto-send), voice I/O.

### 3.4 Proactive triggers (Phase 3, after memory is trustworthy)

Schedule-based and event-based, both firing through the same permission gate
as a manual command.

## 4. Phased build plan (do not skip ahead)

**Phase 0 — Foundation — done**
- ✅ CLI chat loop wired through `core/llm/provider.ts` to Ollama (`local`)
- ✅ `profile.md` created on first run, loaded into every session
- ✅ `uruu remember "..."` writes straight to the episodic log
- ✅ Tests for the memory read/write path
- *Acceptance: close the terminal, reopen a day later, it still knows what
  you told it.* — holds as long as `src/core/memory/*` isn't deleted.

**Phase 1 — Learning loop — not started**
- One real observer (git activity)
- `consolidate.ts` with the diff-review step
- *Acceptance: after a week of real use, `profile.md` contains at least one
  fact you never typed in directly.*

**Phase 2 — Add-ons — not started**
- 2–3 tools from 3.3, each with its own permission tier and tests
- `core/permissions.ts` built here, first use gates it
- *Acceptance: you use at least one add-on daily without babysitting it.*

**Phase 3 — Proactive + voice — not started**
- One schedule-based trigger, reviewed a week before adding a second
- Voice I/O as a thin wrapper over `interfaces/cli.ts`
- *Acceptance: a proactive trigger fires correctly, respects the permission
  gate, and isn't turned off within a week.*

**Phase 4 — Everything else — not started** (GUI, multi-device, home
automation). Only scope once Phase 3 is stable and daily-used.

## 5. Model strategy

`core/llm/provider.ts` exposes one interface — `complete(prompt, opts) ->
response` — with the backend chosen in `manifest.yaml`, never hardcoded at a
call site:

- `local` (default, implemented) — a quantized instruct model served by
  Ollama. Requires `ollama serve` running and the model in `manifest.yaml`
  pulled (`ollama pull <model>`).
- `hf-endpoint` (Phase 3+, not implemented) — Hugging Face Inference
  Endpoints, for local hardware that can't keep up but still wants a
  specific open model over a closed API.
- `claude` (Phase 1+, not implemented) — escalation backend wired to exactly
  one call site, `consolidate.ts`. **Never** the default chat path: a 1–7B
  local model is fine for chat/retrieval/routing but a bad automated
  consolidation silently corrupts `profile.md`, the one file everything else
  depends on. Keep that single call site on the strongest backend available.

Growth path: swap `model:` in `manifest.yaml` for a larger local model as
hardware/task complexity justifies it — zero code changes. Fine-tuning on
`episodic.db` (Kaggle notebook, pushed to a private HF repo) is Phase 3+ and
optional; Kaggle has no role in the running CLI.

## 6. Stack

- Runtime: TypeScript on Node ≥22, strict mode (see
  `../knowledge/typescript-conventions.md` if editing from the parent
  workspace — one-line JSDoc on public classes/functions, no `any`, handle
  `noUncheckedIndexedAccess` explicitly).
- CLI: Commander.
- Memory store: SQLite via Node's built-in `node:sqlite` (`DatabaseSync`,
  experimental but unflagged on Node ≥22.5) for the episodic log — deliberately
  avoids a native-compiled dependency (`better-sqlite3` needs a C++ toolchain
  that isn't guaranteed to be present on Windows). Plain Markdown for the
  profile. No vector DB / embeddings until a concrete query needs one.
- Manifest parsing: `yaml`.
- Tests: Node's built-in test runner via `tsx --test`.

## 7. Explicit non-goals for v1 — do not build these yet

- Always-on voice wake-word / ambient listening
- Multi-user or multi-device sync
- Any action tier above "reversible" running without per-instance
  confirmation
- A GUI
- Home automation / IoT control
- Autonomous scheduling of the user's calendar without confirmation

If asked to build any of these before Phase 3 is done and daily-used, push
back — that's scope creep.
