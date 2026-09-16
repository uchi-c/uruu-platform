import { Command } from 'commander';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { loadManifest } from '../core/manifest.js';
import { createProvider } from '../core/llm/provider.js';
import { loadProfile } from '../core/memory/profile.js';
import { Engine, type ChatMessage } from '../core/engine.js';
import { EpisodicStore } from '../core/memory/episodic.js';

/** Builds and runs the `uruu` CLI: interactive chat by default, plus `uruu remember`. */
export async function runCli(argv: string[]): Promise<void> {
  const program = new Command();
  program.name('uruu').description('Uruu — a local-first personal AI operating layer.').version('0.1.0');

  program
    .command('remember <note>')
    .description('Save a manual memory note straight to the episodic log.')
    .action((note: string) => {
      const store = new EpisodicStore();
      const event = store.addEvent('manual_note', note);
      store.close();
      console.log(`Remembered (#${event.id} at ${event.timestamp}): ${note}`);
    });

  program
    .command('chat', { isDefault: true })
    .description('Start an interactive chat session.')
    .action(async () => {
      await startChat();
    });

  await program.parseAsync(argv);
}

async function startChat(): Promise<void> {
  const manifest = loadManifest();
  const provider = createProvider(manifest);
  const profile = loadProfile();
  const engine = new Engine(provider, profile);

  console.log(`Uruu — backend "${manifest.llm.backend}" (${manifest.llm.model}). Type "exit" to quit.\n`);

  const rl = createInterface({ input: stdin, output: stdout });
  const history: ChatMessage[] = [];
  const nextLine = makeLineReader(rl);

  try {
    for (;;) {
      process.stdout.write('you> ');
      const input = await nextLine();
      if (input === null) break; // stdin closed (EOF on piped/scripted input)
      const trimmed = input.trim();
      if (!trimmed) continue;
      if (trimmed === 'exit' || trimmed === 'quit') break;

      try {
        const reply = await engine.chat(trimmed, history);
        history.push({ role: 'user', content: trimmed }, { role: 'assistant', content: reply });
        console.log(`uruu> ${reply}\n`);
      } catch (err) {
        console.error(`error: ${err instanceof Error ? err.message : String(err)}\n`);
      }
    }
  } finally {
    rl.close();
  }
}

/**
 * Wraps a readline interface's 'line' event in a queue instead of relying on
 * rl.question() in a loop. question() only listens for the *next* line while
 * its promise is pending — any line that arrives while we're mid-await on
 * something else (like an LLM call) fires with no listener and is silently
 * lost. Queuing every line as it arrives means none can be dropped, and
 * piped/scripted input (which delivers all lines up front) works the same
 * as a human typing one line at a time.
 */
function makeLineReader(rl: ReturnType<typeof createInterface>): () => Promise<string | null> {
  const queue: string[] = [];
  const waiters: Array<(line: string | null) => void> = [];
  let closed = false;

  rl.on('line', (line: string) => {
    const waiter = waiters.shift();
    if (waiter) {
      waiter(line);
    } else {
      queue.push(line);
    }
  });

  rl.on('close', () => {
    closed = true;
    for (const waiter of waiters.splice(0)) {
      waiter(null);
    }
  });

  return function nextLine(): Promise<string | null> {
    const queued = queue.shift();
    if (queued !== undefined) {
      return Promise.resolve(queued);
    }
    if (closed) {
      return Promise.resolve(null);
    }
    return new Promise((resolve) => waiters.push(resolve));
  };
}
