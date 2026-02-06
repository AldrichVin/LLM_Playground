import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export type PipelineState = 'idle' | 'pending' | 'streaming' | 'complete' | 'error';

interface PipelineFlowProps {
  state: PipelineState;
  modelName?: string;
  error?: string | null;
  tokenCount?: number;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const STATE_CONFIG: Record<PipelineState, { label: string; color: string; bgColor: string }> = {
  idle: { label: 'Ready', color: 'text-slate-400', bgColor: 'bg-slate-100' },
  pending: { label: 'Sending...', color: 'text-amber-500', bgColor: 'bg-amber-50' },
  streaming: { label: 'Generating', color: 'text-[#119a6a]', bgColor: 'bg-[#e6f7f0]' },
  complete: { label: 'Complete', color: 'text-[#119a6a]', bgColor: 'bg-[#e6f7f0]' },
  error: { label: 'Error', color: 'text-red-500', bgColor: 'bg-red-50' },
};

export function PipelineFlow({
  state,
  modelName = 'Model',
  error,
  tokenCount,
  collapsed = false,
  onToggleCollapse,
}: PipelineFlowProps) {
  const config = STATE_CONFIG[state];

  if (collapsed) {
    return (
      <motion.button
        onClick={onToggleCollapse}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
          config.bgColor,
          config.color
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <StatusDot state={state} />
        <span>{config.label}</span>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-slate-700">Pipeline Status</h3>
          <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', config.bgColor, config.color)}>
            {config.label}
          </span>
        </div>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Pipeline visualization */}
      <div className="relative">
        <svg viewBox="0 0 400 80" className="w-full h-20">
          {/* Connection lines */}
          <motion.line
            x1="80" y1="40" x2="160" y2="40"
            stroke={state === 'idle' ? '#e2e8f0' : state === 'error' ? '#fca5a5' : '#a5b4fc'}
            strokeWidth="2"
            strokeDasharray={state === 'pending' ? '8 4' : '0'}
            initial={{ pathLength: 0 }}
            animate={{
              pathLength: state !== 'idle' ? 1 : 0,
              strokeDashoffset: state === 'pending' ? [0, -24] : 0,
            }}
            transition={{
              pathLength: { duration: 0.3 },
              strokeDashoffset: { duration: 0.8, repeat: Infinity, ease: 'linear' },
            }}
          />
          <motion.line
            x1="240" y1="40" x2="320" y2="40"
            stroke={['streaming', 'complete'].includes(state) ? '#a5b4fc' : state === 'error' ? '#fca5a5' : '#e2e8f0'}
            strokeWidth="2"
            strokeDasharray={state === 'streaming' ? '8 4' : '0'}
            initial={{ pathLength: 0 }}
            animate={{
              pathLength: ['streaming', 'complete'].includes(state) ? 1 : 0,
              strokeDashoffset: state === 'streaming' ? [0, -24] : 0,
            }}
            transition={{
              pathLength: { duration: 0.3 },
              strokeDashoffset: { duration: 0.8, repeat: Infinity, ease: 'linear' },
            }}
          />

          {/* Arrows */}
          <motion.polygon
            points="155,35 165,40 155,45"
            fill={state === 'idle' ? '#e2e8f0' : state === 'error' ? '#fca5a5' : '#a5b4fc'}
            animate={{ opacity: state !== 'idle' ? 1 : 0.3 }}
          />
          <motion.polygon
            points="315,35 325,40 315,45"
            fill={['streaming', 'complete'].includes(state) ? '#a5b4fc' : state === 'error' ? '#fca5a5' : '#e2e8f0'}
            animate={{ opacity: ['streaming', 'complete'].includes(state) ? 1 : 0.3 }}
          />

          {/* Input node */}
          <g>
            <motion.rect
              x="20" y="20" width="60" height="40" rx="8"
              fill={state !== 'idle' ? '#e0e7ff' : '#f1f5f9'}
              stroke={state !== 'idle' ? '#818cf8' : '#cbd5e1'}
              strokeWidth="2"
              animate={{ scale: state === 'pending' ? [1, 1.02, 1] : 1 }}
              transition={{ duration: 0.5, repeat: state === 'pending' ? Infinity : 0 }}
            />
            <text x="50" y="44" textAnchor="middle" className="text-xs font-medium fill-slate-600">
              Input
            </text>
            {state !== 'idle' && (
              <motion.circle
                cx="70" cy="25" r="6"
                fill="#22c55e"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <motion.path d="M-2,0 L0,2 L3,-2" stroke="white" strokeWidth="1.5" fill="none" />
              </motion.circle>
            )}
          </g>

          {/* Model node */}
          <g>
            <motion.rect
              x="170" y="15" width="60" height="50" rx="8"
              fill={['pending', 'streaming'].includes(state) ? '#dbeafe' : state === 'complete' ? '#d1fae5' : state === 'error' ? '#fee2e2' : '#f1f5f9'}
              stroke={['pending', 'streaming'].includes(state) ? '#3b82f6' : state === 'complete' ? '#10b981' : state === 'error' ? '#ef4444' : '#cbd5e1'}
              strokeWidth="2"
              animate={{
                scale: state === 'streaming' ? [1, 1.03, 1] : 1,
              }}
              transition={{ duration: 0.6, repeat: state === 'streaming' ? Infinity : 0 }}
            />
            <text x="200" y="38" textAnchor="middle" className="text-[10px] font-medium fill-slate-500">
              Model
            </text>
            <text x="200" y="52" textAnchor="middle" className="text-[9px] fill-slate-400">
              {modelName.length > 10 ? modelName.slice(0, 10) + '...' : modelName}
            </text>
            {state === 'streaming' && (
              <motion.g
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ transformOrigin: '200px 30px' }}
              >
                <circle cx="200" cy="20" r="3" fill="#3b82f6" />
              </motion.g>
            )}
          </g>

          {/* Output node */}
          <g>
            <motion.rect
              x="330" y="20" width="60" height="40" rx="8"
              fill={state === 'complete' ? '#d1fae5' : state === 'streaming' ? '#dbeafe' : state === 'error' ? '#fee2e2' : '#f1f5f9'}
              stroke={state === 'complete' ? '#10b981' : state === 'streaming' ? '#3b82f6' : state === 'error' ? '#ef4444' : '#cbd5e1'}
              strokeWidth="2"
              animate={{
                scale: state === 'complete' ? [1, 1.05, 1] : 1,
              }}
              transition={{ duration: 0.3 }}
            />
            <text x="360" y="38" textAnchor="middle" className="text-xs font-medium fill-slate-600">
              Output
            </text>
            {tokenCount !== undefined && state === 'streaming' && (
              <motion.text
                x="360" y="52"
                textAnchor="middle"
                className="text-[9px] fill-blue-500 font-mono"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {tokenCount} tokens
              </motion.text>
            )}
            {state === 'complete' && (
              <motion.circle
                cx="380" cy="25" r="8"
                fill="#10b981"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500 }}
              />
            )}
            {state === 'complete' && (
              <motion.path
                d="M376,25 L379,28 L384,22"
                stroke="white"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.1, duration: 0.2 }}
              />
            )}
          </g>
        </svg>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {state === 'error' && error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-xs text-red-600">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-slate-300" />
          <span>Idle</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span>Streaming</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Complete</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span>Error</span>
        </div>
      </div>
    </motion.div>
  );
}

function StatusDot({ state }: { state: PipelineState }) {
  const colors: Record<PipelineState, string> = {
    idle: 'bg-slate-300',
    pending: 'bg-amber-400',
    streaming: 'bg-blue-500',
    complete: 'bg-emerald-500',
    error: 'bg-red-500',
  };

  return (
    <motion.div
      className={cn('w-2 h-2 rounded-full', colors[state])}
      animate={
        ['pending', 'streaming'].includes(state)
          ? { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }
          : {}
      }
      transition={{ duration: 0.8, repeat: Infinity }}
    />
  );
}
