import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  streamGenerate,
  buildGenerateOptions,
  checkConnection,
  listLocalModels,
  OllamaModel,
} from '../lib/ollama-client';
import { Message, ModelParameters, Experiment, ExperimentMetrics } from '../types';
import { getModelById } from '../lib/model-registry';
import { useExperimentStore } from './useExperiments';

interface UseOllamaOptions {
  model: string;
  parameters: ModelParameters;
  systemPrompt?: string;
}

interface UseOllamaReturn {
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
  error: string | null;
  isConnected: boolean | null;
  localModels: OllamaModel[];
  sendMessage: (content: string) => Promise<void>;
  stopGeneration: () => void;
  clearMessages: () => void;
  checkOllamaConnection: () => Promise<void>;
}

export function useOllama(options: UseOllamaOptions): UseOllamaReturn {
  const { model, parameters, systemPrompt } = options;

  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [localModels, setLocalModels] = useState<OllamaModel[]>([]);

  const abortControllerRef = useRef<AbortController | null>(null);
  const addExperiment = useExperimentStore((s) => s.addExperiment);

  const checkOllamaConnection = useCallback(async () => {
    const connected = await checkConnection();
    setIsConnected(connected);
    if (connected) {
      const models = await listLocalModels();
      setLocalModels(models);
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      setError(null);
      setStreamingContent('');
      setIsStreaming(true);

      const userMessage: Message = {
        id: uuidv4(),
        role: 'user',
        content: content.trim(),
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);

      const startTime = performance.now();
      let timeToFirstToken = 0;
      let firstTokenReceived = false;
      let fullContent = '';
      let tokenCount = 0;

      abortControllerRef.current = new AbortController();

      try {
        const generateOptions = buildGenerateOptions(
          model,
          content.trim(),
          parameters,
          systemPrompt
        );

        const generator = streamGenerate(
          generateOptions,
          abortControllerRef.current.signal
        );

        for await (const token of generator) {
          if (!firstTokenReceived) {
            timeToFirstToken = performance.now() - startTime;
            firstTokenReceived = true;
          }

          fullContent += token;
          tokenCount++;
          setStreamingContent(fullContent);
        }

        const endTime = performance.now();
        const latencyMs = endTime - startTime;

        const assistantMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: fullContent,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setStreamingContent('');

        // Create experiment record
        const modelInfo = getModelById(model);
        const metrics: ExperimentMetrics = {
          totalTokens: tokenCount,
          promptTokens: content.split(/\s+/).length, // Rough estimate
          completionTokens: tokenCount,
          latencyMs: Math.round(latencyMs),
          tokensPerSecond: tokenCount > 0 ? tokenCount / (latencyMs / 1000) : 0,
          timeToFirstToken: Math.round(timeToFirstToken),
        };

        const experiment: Experiment = {
          id: uuidv4(),
          createdAt: Date.now(),
          modelId: model,
          modelName: modelInfo?.displayName || model,
          parameters: { ...parameters },
          messages: [userMessage, assistantMessage],
          metrics,
          tags: [],
        };

        addExperiment(experiment);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // Generation was stopped by user
          if (fullContent) {
            const assistantMessage: Message = {
              id: uuidv4(),
              role: 'assistant',
              content: fullContent + ' [stopped]',
              timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
          }
        } else {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        setIsStreaming(false);
        setStreamingContent('');
        abortControllerRef.current = null;
      }
    },
    [model, parameters, systemPrompt, isStreaming, addExperiment]
  );

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setStreamingContent('');
    setError(null);
  }, []);

  return {
    messages,
    isStreaming,
    streamingContent,
    error,
    isConnected,
    localModels,
    sendMessage,
    stopGeneration,
    clearMessages,
    checkOllamaConnection,
  };
}
