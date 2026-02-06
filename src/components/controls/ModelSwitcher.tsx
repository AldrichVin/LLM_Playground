import { motion } from 'framer-motion';
import { Model, ModelStats } from '../../types';
import { MODELS, getModelColor } from '../../lib/model-registry';
import { OllamaModel } from '../../lib/ollama-client';
import { useModelStats } from '../../hooks/useExperiments';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';

interface ModelSwitcherProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  localModels: OllamaModel[];
}

export function ModelSwitcher({ selectedModel, onModelChange, localModels }: ModelSwitcherProps) {
  const modelStats = useModelStats();

  const isModelAvailable = (modelId: string) => {
    return localModels.some((m) => m.name === modelId || m.name.startsWith(modelId.split(':')[0]));
  };

  const getStatsForModel = (modelId: string): ModelStats | undefined => {
    return modelStats.find((s) => s.modelId === modelId);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-900">Model</h3>
        <Badge variant="info">{localModels.length} available</Badge>
      </div>

      <div className="space-y-2">
        {MODELS.map((model) => {
          const isSelected = selectedModel === model.id;
          const isAvailable = isModelAvailable(model.id);
          const stats = getStatsForModel(model.id);

          return (
            <motion.button
              key={model.id}
              onClick={() => onModelChange(model.id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={cn(
                'w-full p-3 rounded-xl text-left transition-all duration-200',
                'border',
                isSelected
                  ? 'border-[#119a6a] bg-[#e6f7f0]/50 ring-2 ring-[#119a6a]/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn('w-3 h-3 rounded-full mt-1 flex-shrink-0', model.color)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">{model.displayName}</span>
                    <Badge variant="default">{model.size}</Badge>
                    {!isAvailable && (
                      <Badge variant="warning">Not pulled</Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{model.description}</p>

                  {/* Model stats */}
                  {stats && stats.totalRuns > 0 && (
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="text-slate-500">
                        <span className="font-medium text-slate-700">{stats.totalRuns}</span> runs
                      </span>
                      <span className="text-slate-500">
                        <span className="font-medium text-slate-700">{stats.avgLatency}ms</span> avg
                      </span>
                      <span className="text-slate-500">
                        <span className="font-medium text-slate-700">{stats.avgTokensPerSecond}</span> t/s
                      </span>
                      {stats.preferenceRate > 0 && (
                        <span className={cn(
                          'flex items-center gap-1',
                          stats.preferenceRate >= 50 ? 'text-green-600' : 'text-red-500'
                        )}>
                          {stats.preferenceRate >= 50 ? (
                            <ThumbsUpIcon className="w-3 h-3" />
                          ) : (
                            <ThumbsDownIcon className="w-3 h-3" />
                          )}
                          <span className="font-medium">{stats.preferenceRate}%</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 rounded-full bg-[#119a6a] flex items-center justify-center flex-shrink-0"
                  >
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Pull instructions */}
      <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600">
        <p className="font-medium mb-1">Missing a model?</p>
        <code className="block bg-slate-200 px-2 py-1 rounded mt-1 text-slate-800">
          docker exec ollama ollama pull [model]
        </code>
      </div>
    </div>
  );
}

function ThumbsUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
      />
    </svg>
  );
}

function ThumbsDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
      />
    </svg>
  );
}
