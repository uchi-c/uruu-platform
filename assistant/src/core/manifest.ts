import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

export type LlmBackend = 'local' | 'hf-endpoint' | 'claude';

export interface ManifestConfig {
  llm: {
    backend: LlmBackend;
    model: string;
    host?: string;
  };
  observers: unknown[];
  triggers: unknown[];
  tools: unknown[];
}

const DEFAULT_MANIFEST_PATH = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'manifest.yaml');

/** Loads and validates manifest.yaml, the single source of truth for what Uruu is allowed to run. */
export function loadManifest(path: string = DEFAULT_MANIFEST_PATH): ManifestConfig {
  if (!existsSync(path)) {
    throw new Error(`manifest.yaml not found at ${path}. Every backend, observer, trigger, and tool must be declared there.`);
  }

  const raw = parse(readFileSync(path, 'utf-8')) as Partial<ManifestConfig> | null;
  const backend = raw?.llm?.backend;
  const model = raw?.llm?.model;

  if (!backend || !model) {
    throw new Error(`manifest.yaml at ${path} must declare llm.backend and llm.model.`);
  }

  return {
    llm: { backend, model, host: raw?.llm?.host },
    observers: raw?.observers ?? [],
    triggers: raw?.triggers ?? [],
    tools: raw?.tools ?? [],
  };
}
