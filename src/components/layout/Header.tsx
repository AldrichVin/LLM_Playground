import { motion } from 'framer-motion';
import { Badge } from '../ui/Badge';

interface HeaderProps {
  isConnected: boolean | null;
}

export function Header({ isConnected }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50"
    >
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-sm">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">LLM Playground</h1>
            <p className="text-xs text-slate-500">Evaluate local models with Ollama</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected === null
                  ? 'bg-slate-300 animate-pulse'
                  : isConnected
                  ? 'bg-emerald-500'
                  : 'bg-red-500'
              }`}
            />
            <span className="text-sm text-slate-600">
              {isConnected === null
                ? 'Checking...'
                : isConnected
                ? 'Ollama Connected'
                : 'Ollama Disconnected'}
            </span>
          </div>

          <Badge variant={isConnected ? 'success' : 'error'}>
            {isConnected ? 'Online' : 'Offline'}
          </Badge>
        </div>
      </div>
    </motion.header>
  );
}
