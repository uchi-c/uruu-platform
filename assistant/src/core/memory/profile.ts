import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { ensureDirFor, PROFILE_PATH } from '../paths.js';

export const DEFAULT_PROFILE = `# Profile

## Current Projects
_None recorded yet._

## Recurring Tasks
_None recorded yet._

## Preferences & Conventions
_None recorded yet._

## Vocabulary / Shorthand
_None recorded yet._

## Open Questions
_None recorded yet._
`;

/** Loads profile.md, creating it with default sections on first run so it persists across sessions. */
export function loadProfile(path: string = PROFILE_PATH): string {
  if (!existsSync(path)) {
    ensureDirFor(path);
    writeFileSync(path, DEFAULT_PROFILE, 'utf-8');
  }
  return readFileSync(path, 'utf-8');
}
