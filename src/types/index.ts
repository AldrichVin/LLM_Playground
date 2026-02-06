export interface Model {
  id: string;
  name: string;
  displayName: string;
  size: string;
  description: string;
  color: string;
  defaultParameters: ModelParameters;
}

export interface ModelParameters {
  temperature: number;
  maxTokens: number;
  topP: number;
  topK: number;
  repeatPenalty: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface RadarScores {
  accuracy: number;    // 0-5: Factual correctness
  relevance: number;   // 0-5: Addresses the actual prompt
  conciseness: number; // 0-5: Appropriate length, no filler
  creativity: number;  // 0-5: Novel phrasing, interesting angles
  format: number;      // 0-5: Follows structure constraints
  reasoning: number;   // 0-5: Logical coherence, shows thinking
}

export interface Annotation {
  rating: 1 | 2 | 3 | 4 | 5 | null;
  thumbs: 'up' | 'down' | null;
  tags: string[];
  notes: string;
  createdAt: number;
  radar?: RadarScores;
}

export const ANNOTATION_TAGS = [
  'accurate',
  'creative',
  'helpful',
  'hallucination',
  'incomplete',
  'verbose',
  'concise',
  'off-topic',
] as const;

export type AnnotationTag = (typeof ANNOTATION_TAGS)[number];

export interface Experiment {
  id: string;
  createdAt: number;
  modelId: string;
  modelName: string;
  parameters: ModelParameters;
  messages: Message[];
  metrics: ExperimentMetrics;
  tags: string[];
  notes?: string;
  annotation?: Annotation;
}

export interface ComparisonExperiment {
  id: string;
  type: 'comparison';
  createdAt: number;
  prompt: string;
  experimentIds: [string, string];
  winner?: string;
  notes?: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
  createdAt: number;
}

export interface ModelStats {
  modelId: string;
  totalRuns: number;
  avgLatency: number;
  avgTokensPerSecond: number;
  preferenceRate: number;
}

export interface ExperimentMetrics {
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
  tokensPerSecond: number;
  timeToFirstToken: number;
}

export interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export type PresetType = 'creative' | 'balanced' | 'precise';

export const PARAMETER_PRESETS: Record<PresetType, Partial<ModelParameters>> = {
  creative: {
    temperature: 1.2,
    topP: 0.95,
    topK: 100,
  },
  balanced: {
    temperature: 0.7,
    topP: 0.9,
    topK: 40,
  },
  precise: {
    temperature: 0.2,
    topP: 0.5,
    topK: 10,
  },
};
