import { ModelParameters, OllamaGenerateResponse } from '../types';

const OLLAMA_BASE_URL = import.meta.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434';

export interface GenerateOptions {
  model: string;
  prompt: string;
  system?: string;
  context?: number[];
  options?: {
    temperature?: number;
    num_predict?: number;
    top_p?: number;
    top_k?: number;
    repeat_penalty?: number;
  };
}

export interface StreamResult {
  content: string;
  response: OllamaGenerateResponse;
}

export async function* streamGenerate(
  options: GenerateOptions,
  signal?: AbortSignal
): AsyncGenerator<string, StreamResult | null> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...options,
      stream: true,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let fullContent = '';
  let finalResponse: OllamaGenerateResponse | null = null;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(Boolean);

      for (const line of lines) {
        try {
          const data = JSON.parse(line) as OllamaGenerateResponse;

          if (data.done) {
            finalResponse = data;
          } else if (data.response) {
            fullContent += data.response;
            yield data.response;
          }
        } catch {
          // Skip malformed JSON lines
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return finalResponse ? { content: fullContent, response: finalResponse } : null;
}

export function buildGenerateOptions(
  model: string,
  prompt: string,
  parameters: ModelParameters,
  systemPrompt?: string
): GenerateOptions {
  return {
    model,
    prompt,
    system: systemPrompt,
    options: {
      temperature: parameters.temperature,
      num_predict: parameters.maxTokens,
      top_p: parameters.topP,
      top_k: parameters.topK,
      repeat_penalty: parameters.repeatPenalty,
    },
  };
}

export interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
}

export async function listLocalModels(): Promise<OllamaModel[]> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.models || [];
  } catch {
    return [];
  }
}

export async function checkConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function pullModel(modelName: string): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: modelName }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
