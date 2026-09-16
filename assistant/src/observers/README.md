# observers/

Phase 1+. Each observer is a small, isolated module that watches one passive
signal source (git activity, terminal history, calendar) and writes
structured events to `core/memory/episodic.ts`. One module per source, each
with its own on/off switch in `manifest.yaml`. Do not add a generic
"watch everything" observer.

Empty until Phase 1 (git activity is the recommended first observer).
