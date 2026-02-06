import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Experiment, Annotation } from '../../types';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MetricsDisplay } from './MetricsDisplay';
import { AnnotationPanel, AnnotationBadges } from './AnnotationPanel';
import { getModelColor } from '../../lib/model-registry';
import { formatRelativeTime, truncate } from '../../lib/utils';
import { cn } from '../../lib/utils';

interface ExperimentCardProps {
  experiment: Experiment;
  isSelected: boolean;
  onSelect: () => void;
  onToggleCompare: () => void;
  onDelete: () => void;
  onUpdateAnnotation: (annotation: Partial<Annotation>) => void;
  isCompareMode: boolean;
}

export function ExperimentCard({
  experiment,
  isSelected,
  onSelect,
  onToggleCompare,
  onDelete,
  onUpdateAnnotation,
  isCompareMode,
}: ExperimentCardProps) {
  const [showAnnotation, setShowAnnotation] = useState(false);
  const userMessage = experiment.messages.find((m) => m.role === 'user');
  const assistantMessage = experiment.messages.find((m) => m.role === 'assistant');

  return (
    <Card interactive selected={isSelected} onClick={onSelect}>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn('w-3 h-3 rounded-full flex-shrink-0', getModelColor(experiment.modelId))} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-900">{experiment.modelName}</span>
              <Badge variant="default">{experiment.metrics.totalTokens} tokens</Badge>
            </div>
            <p className="text-xs text-slate-500">{formatRelativeTime(experiment.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isSelected}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.stopPropagation();
              onToggleCompare();
            }}
            className="w-4 h-4 rounded border-slate-300 text-[#119a6a] focus:ring-[#119a6a]/20"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Annotation badges */}
        {experiment.annotation && (
          <AnnotationBadges annotation={experiment.annotation} />
        )}

        {/* Prompt preview */}
        <div>
          <div className="text-xs font-medium text-slate-500 mb-1">Prompt</div>
          <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-2">
            {truncate(userMessage?.content || '', 150)}
          </p>
        </div>

        {/* Response preview */}
        <div>
          <div className="text-xs font-medium text-slate-500 mb-1">Response</div>
          <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-2">
            {truncate(assistantMessage?.content || '', 200)}
          </p>
        </div>

        {/* Parameters summary */}
        <div className="flex gap-4 text-xs text-slate-500">
          <span>Temp: {experiment.parameters.temperature.toFixed(1)}</span>
          <span>Max: {experiment.parameters.maxTokens}</span>
          <span>TopP: {experiment.parameters.topP.toFixed(2)}</span>
        </div>

        {/* Annotation panel (expandable) */}
        <AnimatePresence>
          {showAnnotation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pt-3 border-t border-slate-100">
                <AnnotationPanel
                  annotation={experiment.annotation}
                  onUpdate={onUpdateAnnotation}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <MetricsDisplay metrics={experiment.metrics} compact />
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowAnnotation(!showAnnotation);
            }}
            className={cn(
              showAnnotation ? 'text-[#119a6a] bg-[#e6f7f0]' : 'text-slate-500 hover:text-slate-600'
            )}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

// Compact version for list view
export function ExperimentRow({
  experiment,
  isSelected,
  onSelect,
  onToggleCompare,
}: {
  experiment: Experiment;
  isSelected: boolean;
  onSelect: () => void;
  onToggleCompare: () => void;
}) {
  const userMessage = experiment.messages.find((m) => m.role === 'user');

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onSelect}
      className={cn(
        'cursor-pointer transition-colors duration-150',
        isSelected ? 'bg-[#e6f7f0]' : 'hover:bg-slate-50'
      )}
    >
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={isSelected}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            e.stopPropagation();
            onToggleCompare();
          }}
          className="w-4 h-4 rounded border-slate-300 text-[#119a6a] focus:ring-[#119a6a]/20"
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className={cn('w-2 h-2 rounded-full', getModelColor(experiment.modelId))} />
          <span className="font-medium text-sm">{experiment.modelName}</span>
        </div>
      </td>
      <td className="px-4 py-3 max-w-[200px]">
        <p className="text-sm text-slate-600 truncate">
          {userMessage?.content || '-'}
        </p>
      </td>
      <td className="px-4 py-3 text-right font-mono text-sm text-slate-600">
        {experiment.metrics.totalTokens}
      </td>
      <td className="px-4 py-3 text-right font-mono text-sm text-slate-600">
        {experiment.metrics.latencyMs}ms
      </td>
      <td className="px-4 py-3 text-right font-mono text-sm text-[#119a6a]">
        {experiment.metrics.tokensPerSecond.toFixed(1)} t/s
      </td>
      <td className="px-4 py-3 text-sm text-slate-500">
        {formatRelativeTime(experiment.createdAt)}
      </td>
    </motion.tr>
  );
}
