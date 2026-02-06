import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Experiment, ComparisonExperiment } from '../../types';
import { Button } from '../ui/Button';
import { MetricsComparison } from './MetricsDisplay';
import { useExperimentStore } from '../../hooks/useExperiments';
import { getModelColor } from '../../lib/model-registry';
import { cn } from '../../lib/utils';

interface ComparisonViewProps {
  experiments: Experiment[];
  onClose: () => void;
}

export function ComparisonView({ experiments, onClose }: ComparisonViewProps) {
  const [comparisonId, setComparisonId] = useState<string | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const hasLoggedRef = useRef(false);

  const addComparison = useExperimentStore((s) => s.addComparison);
  const setComparisonWinner = useExperimentStore((s) => s.setComparisonWinner);
  const updateComparisonNotes = useExperimentStore((s) => s.updateComparisonNotes);
  const comparisons = useExperimentStore((s) => s.comparisons);

  // Log comparison when two experiments are selected
  useEffect(() => {
    if (experiments.length === 2 && !hasLoggedRef.current) {
      const [exp1, exp2] = experiments;
      const userMessage = exp1.messages.find((m) => m.role === 'user');
      const prompt = userMessage?.content || '';

      // Check if this comparison already exists
      const existingComparison = comparisons.find(
        (c) =>
          (c.experimentIds[0] === exp1.id && c.experimentIds[1] === exp2.id) ||
          (c.experimentIds[0] === exp2.id && c.experimentIds[1] === exp1.id)
      );

      if (existingComparison) {
        setComparisonId(existingComparison.id);
        setWinner(existingComparison.winner || null);
        setNotes(existingComparison.notes || '');
      } else {
        const id = addComparison(prompt, [exp1.id, exp2.id]);
        setComparisonId(id);
      }
      hasLoggedRef.current = true;
    }
  }, [experiments, addComparison, comparisons]);

  // Reset when experiments change
  useEffect(() => {
    hasLoggedRef.current = false;
  }, [experiments[0]?.id, experiments[1]?.id]);

  const handleSelectWinner = (experimentId: string) => {
    if (comparisonId) {
      setWinner(experimentId);
      setComparisonWinner(comparisonId, experimentId);
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNotes(value);
    if (comparisonId) {
      updateComparisonNotes(comparisonId, value);
    }
  };
  if (experiments.length !== 2) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Select experiments to compare</h3>
        <p className="text-sm text-slate-500 max-w-md">
          Go to the Experiments tab and select exactly 2 experiments using the checkboxes to compare
          them side by side.
        </p>
      </div>
    );
  }

  const [exp1, exp2] = experiments;
  const userMessage1 = exp1.messages.find((m) => m.role === 'user');
  const userMessage2 = exp2.messages.find((m) => m.role === 'user');
  const assistantMessage1 = exp1.messages.find((m) => m.role === 'assistant');
  const assistantMessage2 = exp2.messages.find((m) => m.role === 'assistant');

  const samePrompt = userMessage1?.content === userMessage2?.content;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-slate-900">Comparison</h2>
          <p className="text-xs text-slate-500">
            {exp1.modelName} vs {exp2.modelName}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Close
        </Button>
      </div>

      {/* Metrics comparison */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50">
        <h3 className="text-sm font-medium text-slate-700 mb-3">Performance Comparison</h3>
        <MetricsComparison
          metrics1={exp1.metrics}
          metrics2={exp2.metrics}
          label1={exp1.modelName}
          label2={exp2.modelName}
        />
      </div>

      {/* Same prompt indicator */}
      {samePrompt && (
        <div className="px-4 py-2 bg-[#e6f7f0] border-b border-[#e6f7f0]">
          <div className="flex items-center gap-2 text-sm text-[#0e7d56]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Same prompt used - ideal for direct comparison
          </div>
        </div>
      )}

      {/* Winner selection */}
      <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-[#e6f7f0] to-[#e6f7f0]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-slate-700">Select Winner</div>
            <div className="text-xs text-slate-500">Which response is better?</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleSelectWinner(exp1.id)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                winner === exp1.id
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-600'
              )}
            >
              {exp1.modelName}
              {winner === exp1.id && (
                <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <button
              onClick={() => handleSelectWinner(exp2.id)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                winner === exp2.id
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-600'
              )}
            >
              {exp2.modelName}
              {winner === exp2.id && (
                <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <button
              onClick={() => {
                setWinner(null);
                if (comparisonId) setComparisonWinner(comparisonId, '');
              }}
              className={cn(
                'px-3 py-2 rounded-lg text-sm transition-all',
                'bg-white border border-slate-200 text-slate-400 hover:text-slate-600'
              )}
            >
              Tie / Clear
            </button>
          </div>
        </div>
      </div>

      {/* Side by side comparison */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 divide-x divide-slate-200 h-full">
          {[exp1, exp2].map((exp, index) => {
            const userMessage = exp.messages.find((m) => m.role === 'user');
            const assistantMessage = exp.messages.find((m) => m.role === 'assistant');
            const isWinner = winner === exp.id;

            return (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={cn('flex flex-col', isWinner && 'bg-emerald-50/30')}
              >
                {/* Model header */}
                <div className={cn(
                  'p-4 border-b border-slate-200 sticky top-0',
                  isWinner ? 'bg-emerald-50' : 'bg-white'
                )}>
                  <div className="flex items-center gap-2">
                    <div className={cn('w-3 h-3 rounded-full', getModelColor(exp.modelId))} />
                    <span className="font-semibold text-slate-900">{exp.modelName}</span>
                    {isWinner && (
                      <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-medium flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Winner
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3 mt-2 text-xs text-slate-500">
                    <span>Temp: {exp.parameters.temperature.toFixed(1)}</span>
                    <span>Max: {exp.parameters.maxTokens}</span>
                    <span>TopP: {exp.parameters.topP.toFixed(2)}</span>
                  </div>
                </div>

                {/* Metrics bar */}
                <div className="flex justify-around py-3 bg-slate-50 border-b border-slate-200">
                  <div className="text-center">
                    <div className="text-sm font-mono font-semibold text-slate-900">
                      {exp.metrics.latencyMs}ms
                    </div>
                    <div className="text-xs text-slate-500">Latency</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-mono font-semibold text-slate-900">
                      {exp.metrics.totalTokens}
                    </div>
                    <div className="text-xs text-slate-500">Tokens</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-mono font-semibold text-[#119a6a]">
                      {exp.metrics.tokensPerSecond.toFixed(1)}
                    </div>
                    <div className="text-xs text-slate-500">t/s</div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                  {/* Prompt */}
                  <div>
                    <div className="text-xs font-medium text-slate-500 mb-2">Prompt</div>
                    <div className="p-3 bg-[#e6f7f0] rounded-lg text-sm text-slate-700">
                      {userMessage?.content}
                    </div>
                  </div>

                  {/* Response */}
                  <div>
                    <div className="text-xs font-medium text-slate-500 mb-2">Response</div>
                    <div className="p-3 bg-slate-100 rounded-lg text-sm text-slate-700 whitespace-pre-wrap">
                      {assistantMessage?.content}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Comparison notes */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <label className="block text-xs font-medium text-slate-500 mb-2">
          Comparison Notes
        </label>
        <textarea
          value={notes}
          onChange={handleNotesChange}
          placeholder="Add notes about this comparison..."
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#119a6a]/20 focus:border-[#119a6a] resize-none"
          rows={2}
        />
        {comparisonId && (
          <div className="mt-2 text-xs text-slate-400">
            Comparison logged: {comparisonId.slice(0, 12)}...
          </div>
        )}
      </div>
    </div>
  );
}
