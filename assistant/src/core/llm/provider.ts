import type { ManifestConfig } from '../manifest.js';

export interface CompleteOptions {
  system?: string;
  temperature?: number;
}

export interface LLMProvider {
  readonly name: string;
  complete(prompt: string, opts?: CompleteOptions): Promise<string>;
}

interface OllamaChatResponse {
  message?: { content?: string };
}

/** Talks to a local Ollama server over its HTTP chat API. */
export class OllamaProvider implements LLMProvider {
  readonly name = 'local';

  constructor(private readonly host: string, private readonly model: string) {}

  async complete(prompt: string, opts: CompleteOptions = {}): Promise<string> {
    const messages = [
      ...(opts.system ? [{ role: 'system', content: opts.system }] : []),
      { role: 'user', content: prompt },
    ];

    let res: Response;
    try {
      res = await fetch(`${this.host}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          messages,
          stream: false,
          ...(opts.temperature !== undefined ? { options: { temperature: opts.temperature } } : {}),
        }),
      });
    } catch {
      throw new Error(
        `Could not reach Ollama at ${this.host}. Is it running? Start it with "ollama serve" and make sure "${this.model}" is pulled ("ollama pull ${this.model}").`
      );
    }

    if (!res.ok) {
      throw new Error(`Ollama request failed (${res.status}): ${await res.text()}`);
    }

    const data = (await res.json()) as OllamaChatResponse;
    const content = data.message?.content;
    if (!content) {
      throw new Error('Ollama returned an empty response.');
    }
    return content;
  }
}

/** Builds the LLM backend declared in manifest.yaml. Never hardcode a backend at a call site — read it from here. */
export function createProvider(manifest: ManifestConfig): LLMProvider {
  switch (manifest.llm.backend) {
    case 'local':
      return new OllamaProvider(manifest.llm.host ?? 'http://localhost:11434', manifest.llm.model);
    case 'hf-endpoint':
      throw new Error('The "hf-endpoint" backend is not implemented yet (Phase 3+). Set llm.backend to "local" in manifest.yaml.');
    case 'claude':
      throw new Error('The "claude" backend is reserved for consolidate.ts\'s escalation call (Phase 1+), not the default chat path.');
    default:
      throw new Error(`Unknown llm.backend "${manifest.llm.backend as string}" in manifest.yaml.`);
  }
}
