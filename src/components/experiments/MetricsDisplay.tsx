import { motion } from 'framer-motion';
import { ExperimentMetrics } from '../../types';
import { cn } from '../../lib/utils';

interface MetricsDisplayProps {
  metrics: ExperimentMetrics;
  compact?: boolean;
}

interface MetricItemProps {
  label: string;
  value: string | number;
  unit?: string;
  highlight?: boolean;
}

function MetricItem({ label, value, unit, highlight }: MetricItemProps) {
  return (
    <div className="text-center">
      <div
        className={cn(
          'text-lg font-semibold font-mono',
          highlight ? 'text-[#119a6a]' : 'text-slate-900'
        )}
      >
        {value}
        {unit && <span className="text-sm text-slate-400 ml-0.5">{unit}</span>}
      </div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}

export function MetricsDisplay({ metrics, compact }: MetricsDisplayProps) {
  const hasTokenSplit = metrics.promptTokens > 0 || metrics.completionTokens > 0;

  if (compact) {
    return (
      <div className="flex items-center gap-4 text-sm">
        <span className="font-mono text-slate-600">
          {metrics.latencyMs}ms
        </span>
        <span className="font-mono text-slate-600" title={hasTokenSplit ? `${metrics.promptTokens} prompt + ${metrics.completionTokens} completion` : undefined}>
          {hasTokenSplit ? (
            <>{metrics.promptTokens}<span className="text-slate-400">+</span>{metrics.completionTokens}</>
          ) : (
            metrics.totalTokens
          )} tokens
        </span>
        <span className="font-mono text-[#119a6a]">
          {metrics.tokensPerSecond.toFixed(1)} t/s
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-5 gap-4 p-4 bg-slate-50 rounded-xl"
    >
      <MetricItem
        label="Latency"
        value={metrics.latencyMs}
        unit="ms"
      />
      <div className="text-center">
        <div className="text-lg font-semibold font-mono text-slate-900">
          {hasTokenSplit ? (
            <>
              <span className="text-emerald-600">{metrics.promptTokens}</span>
              <span className="text-slate-400 mx-1">+</span>
              <span className="text-blue-600">{metrics.completionTokens}</span>
            </>
          ) : (
            metrics.totalTokens
          )}
        </div>
        <div className="text-xs text-slate-500">
          {hasTokenSplit ? 'Prompt + Completion' : 'Total Tokens'}
        </div>
      </div>
      <MetricItem
        label="Total Tokens"
        value={metrics.totalTokens}
      />
      <MetricItem
        label="Speed"
        value={metrics.tokensPerSecond.toFixed(1)}
        unit="t/s"
        highlight
      />
      <MetricItem
        label="First Token"
        value={metrics.timeToFirstToken}
        unit="ms"
      />
    </motion.div>
  );
}

interface MetricsComparisonProps {
  metrics1: ExperimentMetrics;
  metrics2: ExperimentMetrics;
  label1: string;
  label2: string;
}

export function MetricsComparison({ metrics1, metrics2, label1, label2 }: MetricsComparisonProps) {
  const compare = (v1: number, v2: number, lowerIsBetter = true) => {
    const diff = ((v1 - v2) / v2) * 100;
    const isBetter = lowerIsBetter ? v1 < v2 : v1 > v2;
    return { diff: Math.abs(diff).toFixed(1), isBetter };
  };

  const latencyComp = compare(metrics1.latencyMs, metrics2.latencyMs, true);
  const speedComp = compare(metrics1.tokensPerSecond, metrics2.tokensPerSecond, false);
  const ttftComp = compare(metrics1.timeToFirstToken, metrics2.timeToFirstToken, true);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-xs text-slate-500 mb-1">Latency</div>
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className={cn('font-mono', latencyComp.isBetter ? 'text-emerald-600' : 'text-slate-600')}>
              {metrics1.latencyMs}ms
            </span>
            <span className="text-slate-400">vs</span>
            <span className={cn('font-mono', !latencyComp.isBetter ? 'text-emerald-600' : 'text-slate-600')}>
              {metrics2.latencyMs}ms
            </span>
          </div>
        </div>

        <div className="text-center">
          <div className="text-xs text-slate-500 mb-1">Speed</div>
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className={cn('font-mono', speedComp.isBetter ? 'text-emerald-600' : 'text-slate-600')}>
              {metrics1.tokensPerSecond.toFixed(1)}
            </span>
            <span className="text-slate-400">vs</span>
            <span className={cn('font-mono', !speedComp.isBetter ? 'text-emerald-600' : 'text-slate-600')}>
              {metrics2.tokensPerSecond.toFixed(1)}
            </span>
            <span className="text-slate-400">t/s</span>
          </div>
        </div>

        <div className="text-center">
          <div className="text-xs text-slate-500 mb-1">First Token</div>
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className={cn('font-mono', ttftComp.isBetter ? 'text-emerald-600' : 'text-slate-600')}>
              {metrics1.timeToFirstToken}ms
            </span>
            <span className="text-slate-400">vs</span>
            <span className={cn('font-mono', !ttftComp.isBetter ? 'text-emerald-600' : 'text-slate-600')}>
              {metrics2.timeToFirstToken}ms
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
