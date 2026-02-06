import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Experiment, Annotation, ANNOTATION_TAGS } from '../../types';
import { ExperimentCard, ExperimentRow } from './ExperimentCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useExperimentStore } from '../../hooks/useExperiments';
import { MODELS } from '../../lib/model-registry';
import { cn } from '../../lib/utils';

interface ExperimentLogProps {
  experiments: Experiment[];
  selectedIds: string[];
  onSelectExperiment: (id: string) => void;
  onToggleCompare: (id: string) => void;
  onCompare: () => void;
}

type ViewMode = 'cards' | 'table';
type SortKey = 'createdAt' | 'latencyMs' | 'tokensPerSecond' | 'totalTokens';
type RatingFilter = 'all' | 'rated' | 'unrated' | 'positive' | 'negative';
type DateFilter = 'all' | 'today' | 'week' | 'month';

const DATE_FILTER_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Last 7 Days' },
  { value: 'month', label: 'Last 30 Days' },
];

function getDateFilterTimestamp(filter: DateFilter): number {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  switch (filter) {
    case 'today':
      return now - day;
    case 'week':
      return now - 7 * day;
    case 'month':
      return now - 30 * day;
    default:
      return 0;
  }
}

export function ExperimentLog({
  experiments,
  selectedIds,
  onSelectExperiment,
  onToggleCompare,
  onCompare,
}: ExperimentLogProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortAsc, setSortAsc] = useState(false);
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  const { deleteExperiment, exportExperiments, clearAllExperiments, updateAnnotation } = useExperimentStore();

  const filteredExperiments = useMemo(() => {
    return experiments.filter((exp) => {
      // Model filter
      if (modelFilter !== 'all' && exp.modelId !== modelFilter) {
        return false;
      }

      // Date filter
      if (dateFilter !== 'all') {
        const minTimestamp = getDateFilterTimestamp(dateFilter);
        if (exp.createdAt < minTimestamp) return false;
      }

      // Rating filter
      if (ratingFilter !== 'all') {
        const hasAnnotation = !!exp.annotation?.thumbs || !!exp.annotation?.rating;
        if (ratingFilter === 'rated' && !hasAnnotation) return false;
        if (ratingFilter === 'unrated' && hasAnnotation) return false;
        if (ratingFilter === 'positive' && exp.annotation?.thumbs !== 'up') return false;
        if (ratingFilter === 'negative' && exp.annotation?.thumbs !== 'down') return false;
      }

      // Tag filter
      if (tagFilter !== 'all') {
        if (!exp.annotation?.tags?.includes(tagFilter)) return false;
      }

      return true;
    });
  }, [experiments, modelFilter, dateFilter, ratingFilter, tagFilter]);

  const sortedExperiments = useMemo(() => {
    return [...filteredExperiments].sort((a, b) => {
      let comparison = 0;
      switch (sortKey) {
        case 'createdAt':
          comparison = a.createdAt - b.createdAt;
          break;
        case 'latencyMs':
          comparison = a.metrics.latencyMs - b.metrics.latencyMs;
          break;
        case 'tokensPerSecond':
          comparison = a.metrics.tokensPerSecond - b.metrics.tokensPerSecond;
          break;
        case 'totalTokens':
          comparison = a.metrics.totalTokens - b.metrics.totalTokens;
          break;
      }
      return sortAsc ? comparison : -comparison;
    });
  }, [filteredExperiments, sortKey, sortAsc]);

  const handleUpdateAnnotation = (id: string, annotation: Partial<Annotation>) => {
    updateAnnotation(id, annotation);
  };

  const activeFilterCount = [
    modelFilter !== 'all',
    dateFilter !== 'all',
    ratingFilter !== 'all',
    tagFilter !== 'all',
  ].filter(Boolean).length;

  const handleExportJSON = () => {
    const data = exportExperiments();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `experiments-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Created At',
      'Model',
      'Prompt',
      'Response',
      'Temperature',
      'Max Tokens',
      'Top P',
      'Total Tokens',
      'Prompt Tokens',
      'Completion Tokens',
      'Latency (ms)',
      'Tokens/Sec',
      'TTFT (ms)',
      'Rating',
      'Thumbs',
      'Tags',
      'Notes',
    ];

    const escapeCSV = (str: string) => {
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = experiments.map((exp) => {
      const userMsg = exp.messages.find((m) => m.role === 'user')?.content || '';
      const assistantMsg = exp.messages.find((m) => m.role === 'assistant')?.content || '';
      return [
        exp.id,
        new Date(exp.createdAt).toISOString(),
        exp.modelName,
        escapeCSV(userMsg),
        escapeCSV(assistantMsg),
        exp.parameters.temperature,
        exp.parameters.maxTokens,
        exp.parameters.topP,
        exp.metrics.totalTokens,
        exp.metrics.promptTokens,
        exp.metrics.completionTokens,
        exp.metrics.latencyMs,
        exp.metrics.tokensPerSecond.toFixed(2),
        exp.metrics.timeToFirstToken,
        exp.annotation?.rating || '',
        exp.annotation?.thumbs || '',
        exp.annotation?.tags?.join(';') || '',
        escapeCSV(exp.annotation?.notes || ''),
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `experiments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-slate-900">Experiments</h2>
          <p className="text-xs text-slate-500">
            {experiments.length} experiment{experiments.length !== 1 ? 's' : ''} logged
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length === 2 && (
            <Button size="sm" onClick={onCompare}>
              Compare Selected
            </Button>
          )}
          {selectedIds.length > 0 && selectedIds.length !== 2 && (
            <Badge variant="info">Select 2 to compare</Badge>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg overflow-hidden border border-slate-200">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 text-sm ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900'
                  : 'bg-slate-50 text-slate-500 hover:text-slate-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-sm ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900'
                  : 'bg-slate-50 text-slate-500 hover:text-slate-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Sort selector */}
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
          >
            <option value="createdAt">Sort by Time</option>
            <option value="latencyMs">Sort by Latency</option>
            <option value="tokensPerSecond">Sort by Speed</option>
            <option value="totalTokens">Sort by Tokens</option>
          </select>

          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
          >
            <svg
              className={`w-4 h-4 text-slate-600 transition-transform ${sortAsc ? '' : 'rotate-180'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-all',
              showFilters || activeFilterCount > 0
                ? 'bg-[#e6f7f0] border-[#119a6a] text-[#0e7d56]'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            )}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-[#119a6a] text-white text-xs rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleExportJSON} disabled={experiments.length === 0}>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            JSON
          </Button>
          <Button variant="ghost" size="sm" onClick={handleExportCSV} disabled={experiments.length === 0}>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            CSV
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllExperiments}
            disabled={experiments.length === 0}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Filter panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-b border-slate-100"
          >
            <div className="px-4 py-3 bg-slate-50/80 flex flex-wrap items-center gap-4">
              {/* Model filter */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-500">Model:</label>
                <select
                  value={modelFilter}
                  onChange={(e) => setModelFilter(e.target.value)}
                  className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-white"
                >
                  <option value="all">All Models</option>
                  {MODELS.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.displayName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date filter */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-500">Date:</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                  className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-white"
                >
                  {DATE_FILTER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating filter */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-500">Rating:</label>
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value as RatingFilter)}
                  className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-white"
                >
                  <option value="all">All</option>
                  <option value="rated">Rated</option>
                  <option value="unrated">Unrated</option>
                  <option value="positive">Positive</option>
                  <option value="negative">Negative</option>
                </select>
              </div>

              {/* Tag filter */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-500">Tag:</label>
                <select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-white"
                >
                  <option value="all">All Tags</option>
                  {ANNOTATION_TAGS.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear filters */}
              {activeFilterCount > 0 && (
                <button
                  onClick={() => {
                    setModelFilter('all');
                    setDateFilter('all');
                    setRatingFilter('all');
                    setTagFilter('all');
                  }}
                  className="text-xs text-[#119a6a] hover:text-[#0e7d56] font-medium"
                >
                  Clear filters
                </button>
              )}

              {/* Results count */}
              <div className="ml-auto text-xs text-slate-500">
                Showing {filteredExperiments.length} of {experiments.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {sortedExperiments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center p-8"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {experiments.length === 0 ? 'No experiments yet' : 'No matching experiments'}
            </h3>
            <p className="text-sm text-slate-500 max-w-md">
              {experiments.length === 0
                ? 'Start chatting with a model to record experiments. Each conversation turn is automatically logged with parameters and metrics.'
                : 'Try adjusting your filters to see more results.'}
            </p>
            {activeFilterCount > 0 && experiments.length > 0 && (
              <button
                onClick={() => {
                  setModelFilter('all');
                  setDateFilter('all');
                  setRatingFilter('all');
                  setTagFilter('all');
                }}
                className="mt-4 text-sm text-[#119a6a] hover:text-[#0e7d56] font-medium"
              >
                Clear all filters
              </button>
            )}
          </motion.div>
        ) : viewMode === 'cards' ? (
          <div className="p-4 space-y-4">
            <AnimatePresence mode="popLayout">
              {sortedExperiments.map((exp) => (
                <ExperimentCard
                  key={exp.id}
                  experiment={exp}
                  isSelected={selectedIds.includes(exp.id)}
                  onSelect={() => onSelectExperiment(exp.id)}
                  onToggleCompare={() => onToggleCompare(exp.id)}
                  onDelete={() => deleteExperiment(exp.id)}
                  onUpdateAnnotation={(annotation) => handleUpdateAnnotation(exp.id, annotation)}
                  isCompareMode={selectedIds.length > 0}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 sticky top-0">
              <tr className="text-left text-xs text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3 w-10"></th>
                <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('createdAt')}>
                  Model
                </th>
                <th className="px-4 py-3">Prompt</th>
                <th className="px-4 py-3 text-right cursor-pointer" onClick={() => handleSort('totalTokens')}>
                  Tokens
                </th>
                <th className="px-4 py-3 text-right cursor-pointer" onClick={() => handleSort('latencyMs')}>
                  Latency
                </th>
                <th className="px-4 py-3 text-right cursor-pointer" onClick={() => handleSort('tokensPerSecond')}>
                  Speed
                </th>
                <th className="px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence mode="popLayout">
                {sortedExperiments.map((exp) => (
                  <ExperimentRow
                    key={exp.id}
                    experiment={exp}
                    isSelected={selectedIds.includes(exp.id)}
                    onSelect={() => onSelectExperiment(exp.id)}
                    onToggleCompare={() => onToggleCompare(exp.id)}
                  />
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
