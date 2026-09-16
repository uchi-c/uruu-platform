import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { EpisodicStore } from '../src/core/memory/episodic.js';
import { loadProfile } from '../src/core/memory/profile.js';

function tempDir(): string {
  return mkdtempSync(join(tmpdir(), 'uruu-test-'));
}

test('EpisodicStore persists events across separate instances on the same file', () => {
  const dir = tempDir();
  const dbPath = join(dir, 'episodic.db');

  const store1 = new EpisodicStore(dbPath);
  const written = store1.addEvent('manual_note', 'remember the sky is blue');
  store1.close();

  const store2 = new EpisodicStore(dbPath);
  const events = store2.getRecentEvents(10);
  store2.close();

  assert.equal(events.length, 1);
  assert.equal(events[0]?.id, written.id);
  assert.equal(events[0]?.type, 'manual_note');
  assert.equal(events[0]?.content, 'remember the sky is blue');

  rmSync(dir, { recursive: true, force: true });
});

test('getRecentEvents returns newest first and respects the limit', () => {
  const dir = tempDir();
  const store = new EpisodicStore(join(dir, 'episodic.db'));

  store.addEvent('manual_note', 'first');
  store.addEvent('manual_note', 'second');
  store.addEvent('manual_note', 'third');

  const events = store.getRecentEvents(2);
  store.close();

  assert.equal(events.length, 2);
  assert.equal(events[0]?.content, 'third');
  assert.equal(events[1]?.content, 'second');

  rmSync(dir, { recursive: true, force: true });
});

test('loadProfile creates a default profile.md on first read and is stable on reread', () => {
  const dir = tempDir();
  const profilePath = join(dir, 'profile.md');

  const first = loadProfile(profilePath);
  assert.match(first, /## Current Projects/);
  assert.match(first, /## Recurring Tasks/);
  assert.match(first, /## Preferences & Conventions/);
  assert.match(first, /## Vocabulary \/ Shorthand/);
  assert.match(first, /## Open Questions/);

  const second = loadProfile(profilePath);
  assert.equal(second, first);

  rmSync(dir, { recursive: true, force: true });
});
