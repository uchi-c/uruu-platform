import type { LLMProvider } from './llm/provider.js';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** Orchestrates one chat turn: injects the user's profile as system context and calls the configured LLM provider. */
export class Engine {
  constructor(private readonly provider: LLMProvider, private readonly profile: string) {}

  async chat(userMessage: string, history: ChatMessage[] = []): Promise<string> {
    const transcript = history.map((m) => `${m.role === 'user' ? 'User' : 'Uruu'}: ${m.content}`).join('\n');
    const prompt = transcript ? `${transcript}\nUser: ${userMessage}` : userMessage;
    return this.provider.complete(prompt, { system: this.buildSystemPrompt() });
  }

  private buildSystemPrompt(): string {
    return [
      'You are Uruu, a local-first personal assistant.',
      'The profile below is what you know about the person you are talking to. Use it to tailor your answers. Do not invent facts that are not in it.',
      '',
      '--- PROFILE ---',
      this.profile,
      '--- END PROFILE ---',
    ].join('\n');
  }
}
