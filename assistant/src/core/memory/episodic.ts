import { DatabaseSync } from 'node:sqlite';
import { ensureDirFor, EPISODIC_DB_PATH } from '../paths.js';

export interface EpisodicEvent {
  id: number;
  timestamp: string;
  type: string;
  content: string;
}

/**
 * Append-only log of discrete events (manual notes, later: commits, sessions,
 * corrections). This is raw material — callers should summarize it, never
 * load it wholesale into an LLM context.
 */
export class EpisodicStore {
  private readonly db: DatabaseSync;

  constructor(path: string = EPISODIC_DB_PATH) {
    ensureDirFor(path);
    this.db = new DatabaseSync(path);
    this.db.exec('PRAGMA journal_mode = WAL');
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        type TEXT NOT NULL,
        content TEXT NOT NULL
      );
    `);
  }

  /** Appends one event to the log and returns it, timestamp included. */
  addEvent(type: string, content: string): EpisodicEvent {
    const timestamp = new Date().toISOString();
    const result = this.db.prepare('INSERT INTO events (timestamp, type, content) VALUES (?, ?, ?)').run(timestamp, type, content);
    return { id: Number(result.lastInsertRowid), timestamp, type, content };
  }

  /** Returns the most recent events, newest first. */
  getRecentEvents(limit = 20): EpisodicEvent[] {
    return this.db.prepare('SELECT id, timestamp, type, content FROM events ORDER BY id DESC LIMIT ?').all(limit) as unknown as EpisodicEvent[];
  }

  close(): void {
    this.db.close();
  }
}
