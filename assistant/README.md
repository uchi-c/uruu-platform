# Uruu

A local-first personal AI operating layer: remembers how you work, observes
your activity, and acts through a permissioned tool layer. See
[CLAUDE.md](./CLAUDE.md) for the full design brief and phased build plan.

> Not the same project as the parent folder ([`uruu-platform`](../)) — they
> only share a name.

## Status

Phase 0 (Foundation) is done: a chat loop against a local model, a
persistent profile, and manual memory notes. Everything else in
[CLAUDE.md](./CLAUDE.md) section 4 is still ahead.

## Requirements

- Node.js ≥ 22
- [Ollama](https://ollama.com) running locally, with the model in
  `manifest.yaml` pulled:

  ```bash
  ollama pull qwen2.5:1.5b-instruct
  ollama serve
  ```

### This machine's install

Installed to `D:\Ollama` (not the default `%LOCALAPPDATA%\Programs\Ollama`)
because C: had essentially no free space at install time. Two things follow
from that:

- `OLLAMA_MODELS` is set (user env var) to `D:\Ollama\models` — models pulled
  without this set would go to `C:\Users\<you>\.ollama\models` and likely
  fail on a full C:.
- The installer's tray app (auto-start on login) was bypassed when the
  server got restarted to pick up `OLLAMA_MODELS`, so `ollama serve` does
  **not** currently restart itself after a reboot. Either run
  `D:\Ollama\ollama app.exe` (tray app, sets up auto-start) or `ollama serve`
  manually before using `uruu chat`.

## Setup

```bash
npm install
npm run build
npm link   # exposes the `uruu` command globally
```

Or, without linking, during development:

```bash
npm run dev
```

## Usage

```bash
uruu               # start an interactive chat session (default command)
uruu chat          # same, explicit
uruu remember "prefers terse commit messages"   # log a manual memory note
```

Chat is grounded in `data/profile.md`, created automatically on first run
and never committed (see `.gitignore`) — it's personal data. `uruu remember`
appends to `data/episodic.db`, also gitignored. Both live outside `src/` and
`dist/` so a rebuild never wipes them.

## Configuration

All runtime behavior — which LLM backend, which observers/triggers/tools are
active — is declared in [`manifest.yaml`](./manifest.yaml), never hardcoded.
Nothing runs unless it's listed there.

## Tests

```bash
npm test
```

Covers the memory read/write path: `EpisodicStore` persistence and
`profile.md` creation/reload.
