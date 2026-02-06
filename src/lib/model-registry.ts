import { Model, ModelParameters } from '../types';

const DEFAULT_PARAMETERS: ModelParameters = {
  temperature: 0.7,
  maxTokens: 2048,
  topP: 0.9,
  topK: 40,
  repeatPenalty: 1.1,
};

export const MODELS: Model[] = [
  {
    id: 'llama3.2:1b',
    name: 'llama3.2:1b',
    displayName: 'Llama 3.2',
    size: '1B',
    description: 'Meta\'s compact and efficient model, great for quick responses',
    color: 'bg-orange-500',
    defaultParameters: { ...DEFAULT_PARAMETERS },
  },
  {
    id: 'phi3:mini',
    name: 'phi3:mini',
    displayName: 'Phi-3 Mini',
    size: '3.8B',
    description: 'Microsoft\'s efficient model with strong reasoning capabilities',
    color: 'bg-cyan-500',
    defaultParameters: { ...DEFAULT_PARAMETERS },
  },
  {
    id: 'gemma2:2b',
    name: 'gemma2:2b',
    displayName: 'Gemma 2',
    size: '2B',
    description: 'Google\'s lightweight model optimized for quality',
    color: 'bg-violet-500',
    defaultParameters: { ...DEFAULT_PARAMETERS },
  },
];

export function getModelById(id: string): Model | undefined {
  return MODELS.find((m) => m.id === id);
}

export function getModelColor(id: string): string {
  return getModelById(id)?.color || 'bg-slate-500';
}
