import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// `core/paths.ts` sits one level under the project root whether it's running
// from `src/` (tsx, dev) or `dist/` (built) — so resolving two levels up from
// here always lands on the project root, regardless of build state.
const PROJECT_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Where Uruu's personal memory lives. Deliberately outside src/ and dist/ so `npm run clean` / a rebuild never touches it. */
export const DATA_DIR = join(PROJECT_ROOT, 'data');

export const PROFILE_PATH = join(DATA_DIR, 'profile.md');
export const EPISODIC_DB_PATH = join(DATA_DIR, 'episodic.db');

/** Creates the parent directory of `path` if it doesn't exist yet. Call before writing any memory file. */
export function ensureDirFor(path: string): void {
  mkdirSync(dirname(path), { recursive: true });
}
