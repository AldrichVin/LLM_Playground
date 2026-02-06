import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Experiment, Annotation, ModelStats, ComparisonExperiment } from '../types';

interface ExperimentState {
  experiments: Experiment[];
  comparisons: ComparisonExperiment[];
  selectedIds: string[];

  addExperiment: (exp: Experiment) => void;
  deleteExperiment: (id: string) => void;
  selectExperiment: (id: string) => void;
  toggleCompare: (id: string) => void;
  clearSelection: () => void;
  exportExperiments: () => string;
  clearAllExperiments: () => void;
  updateAnnotation: (id: string, annotation: Partial<Annotation>) => void;
  getModelStats: () => ModelStats[];
  addComparison: (prompt: string, experimentIds: [string, string]) => string;
  setComparisonWinner: (comparisonId: string, winnerId: string) => void;
  updateComparisonNotes: (comparisonId: string, notes: string) => void;
}

export const useExperimentStore = create<ExperimentState>()(
  persist(
    (set, get) => ({
      experiments: [],
      comparisons: [],
      selectedIds: [],

      addExperiment: (exp) =>
        set((state) => ({
          experiments: [exp, ...state.experiments],
        })),

      deleteExperiment: (id) =>
        set((state) => ({
          experiments: state.experiments.filter((e) => e.id !== id),
          selectedIds: state.selectedIds.filter((i) => i !== id),
        })),

      selectExperiment: (id) => set({ selectedIds: [id] }),

      toggleCompare: (id) =>
        set((state) => ({
          selectedIds: state.selectedIds.includes(id)
            ? state.selectedIds.filter((i) => i !== id)
            : [...state.selectedIds, id].slice(-2), // Max 2 for comparison
        })),

      clearSelection: () => set({ selectedIds: [] }),

      exportExperiments: () => {
        const { experiments } = get();
        return JSON.stringify(experiments, null, 2);
      },

      clearAllExperiments: () => set({ experiments: [], selectedIds: [] }),

      updateAnnotation: (id, annotationUpdate) =>
        set((state) => ({
          experiments: state.experiments.map((exp) => {
            if (exp.id !== id) return exp;
            const currentAnnotation = exp.annotation || {
              rating: null,
              thumbs: null,
              tags: [],
              notes: '',
              createdAt: Date.now(),
            };
            return {
              ...exp,
              annotation: {
                ...currentAnnotation,
                ...annotationUpdate,
                createdAt: Date.now(),
              },
            };
          }),
        })),

      getModelStats: () => {
        const { experiments } = get();
        const modelMap = new Map<string, Experiment[]>();

        experiments.forEach((exp) => {
          const existing = modelMap.get(exp.modelId) || [];
          modelMap.set(exp.modelId, [...existing, exp]);
        });

        return Array.from(modelMap.entries()).map(([modelId, exps]) => {
          const totalRuns = exps.length;
          const avgLatency = exps.reduce((sum, e) => sum + e.metrics.latencyMs, 0) / totalRuns;
          const avgTokensPerSecond =
            exps.reduce((sum, e) => sum + e.metrics.tokensPerSecond, 0) / totalRuns;

          const annotatedExps = exps.filter((e) => e.annotation?.thumbs);
          const positiveCount = annotatedExps.filter((e) => e.annotation?.thumbs === 'up').length;
          const preferenceRate = annotatedExps.length > 0 ? (positiveCount / annotatedExps.length) * 100 : 0;

          return {
            modelId,
            totalRuns,
            avgLatency: Math.round(avgLatency),
            avgTokensPerSecond: Math.round(avgTokensPerSecond * 10) / 10,
            preferenceRate: Math.round(preferenceRate),
          };
        });
      },

      addComparison: (prompt, experimentIds) => {
        const id = `cmp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        set((state) => ({
          comparisons: [
            {
              id,
              type: 'comparison',
              createdAt: Date.now(),
              prompt,
              experimentIds,
            },
            ...state.comparisons,
          ],
        }));
        return id;
      },

      setComparisonWinner: (comparisonId, winnerId) =>
        set((state) => ({
          comparisons: state.comparisons.map((cmp) =>
            cmp.id === comparisonId ? { ...cmp, winner: winnerId } : cmp
          ),
        })),

      updateComparisonNotes: (comparisonId, notes) =>
        set((state) => ({
          comparisons: state.comparisons.map((cmp) =>
            cmp.id === comparisonId ? { ...cmp, notes } : cmp
          ),
        })),
    }),
    {
      name: 'llm-playground-experiments',
    }
  )
);

export function useSelectedExperiments(): Experiment[] {
  const experiments = useExperimentStore((s) => s.experiments);
  const selectedIds = useExperimentStore((s) => s.selectedIds);
  return experiments.filter((e) => selectedIds.includes(e.id));
}

export function useModelStats(): ModelStats[] {
  const getModelStats = useExperimentStore((s) => s.getModelStats);
  const experiments = useExperimentStore((s) => s.experiments);
  // Re-compute when experiments change
  return getModelStats();
}
