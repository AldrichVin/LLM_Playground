import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RadarScores } from '../../types';
import { RadarChart } from './RadarChart';
import { cn } from '../../lib/utils';

interface RadarPanelProps {
  scores?: RadarScores;
  onUpdate: (scores: RadarScores) => void;
  compact?: boolean;
}

const DIMENSIONS: Array<{
  key: keyof RadarScores;
  label: string;
  description: string;
}> = [
  { key: 'accuracy', label: 'Accuracy', description: 'Factual correctness' },
  { key: 'relevance', label: 'Relevance', description: 'Addresses the prompt' },
  { key: 'conciseness', label: 'Conciseness', description: 'Appropriate length' },
  { key: 'creativity', label: 'Creativity', description: 'Novel & interesting' },
  { key: 'format', label: 'Format', description: 'Follows constraints' },
  { key: 'reasoning', label: 'Reasoning', description: 'Logical coherence' },
];

const QUICK_PRESETS: Array<{
  name: string;
  scores: RadarScores;
  description: string;
}> = [
  {
    name: 'Accurate & Verbose',
    description: 'High accuracy but wordy',
    scores: { accuracy: 5, relevance: 5, conciseness: 1, creativity: 2, format: 4, reasoning: 5 },
  },
  {
    name: 'Creative & Off-topic',
    description: 'Interesting but misses the point',
    scores: { accuracy: 2, relevance: 1, conciseness: 3, creativity: 5, format: 3, reasoning: 2 },
  },
  {
    name: 'Concise & Accurate',
    description: 'Perfect balance',
    scores: { accuracy: 5, relevance: 5, conciseness: 5, creativity: 3, format: 5, reasoning: 4 },
  },
];

export function RadarPanel({ scores, onUpdate, compact = false }: RadarPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localScores, setLocalScores] = useState<RadarScores>(
    scores || {
      accuracy: 3,
      relevance: 3,
      conciseness: 3,
      creativity: 3,
      format: 3,
      reasoning: 3,
    }
  );

  const handleScoreChange = (key: keyof RadarScores, value: number) => {
    const newScores = { ...localScores, [key]: value };
    setLocalScores(newScores);
    onUpdate(newScores);
  };

  const handlePresetApply = (preset: RadarScores) => {
    setLocalScores(preset);
    onUpdate(preset);
  };

  if (compact && !isExpanded) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(true);
        }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-[#119a6a] transition-colors text-sm text-slate-600 hover:text-[#119a6a]"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        Multi-dimensional rating
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-4 border-t border-slate-200 pt-4 mt-4"
    >
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-700 flex items-center gap-2">
          <svg className="w-4 h-4 text-[#119a6a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Evaluation Radar
        </label>
        {compact && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(false);
            }}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            Collapse
          </button>
        )}
      </div>

      <div className="flex gap-4">
        {/* Radar visualization */}
        <div className="flex-shrink-0">
          <RadarChart scores={localScores} size={140} showLabels={false} />
        </div>

        {/* Dimension sliders */}
        <div className="flex-1 space-y-2">
          {DIMENSIONS.map((dim) => (
            <div key={dim.key} className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-600">{dim.label}</label>
                <span className="text-xs text-slate-400">{localScores[dim.key]}/5</span>
              </div>
              <div className="flex items-center gap-1">
                {[0, 1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleScoreChange(dim.key, value);
                    }}
                    className={cn(
                      'w-6 h-6 rounded-full border-2 transition-all text-xs font-medium',
                      localScores[dim.key] === value
                        ? 'border-[#119a6a] bg-[#119a6a] text-white scale-110'
                        : 'border-slate-200 hover:border-[#119a6a] text-slate-400 hover:text-[#119a6a]'
                    )}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick presets */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-500">Quick presets:</label>
        <div className="flex gap-2">
          {QUICK_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={(e) => {
                e.stopPropagation();
                handlePresetApply(preset.scores);
              }}
              className="px-2 py-1 text-xs rounded-md border border-slate-200 hover:border-[#119a6a] hover:bg-[#e6f7f0] hover:text-[#119a6a] transition-colors"
              title={preset.description}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
