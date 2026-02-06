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
          <img
            src="/maincode-logo.png"
            alt="Maincode"
            className="w-10 h-10 rounded-lg shadow-sm"
          />
          <div>
            <h1 className="text-lg font-semibold text-slate-900" style={{ fontFamily: 'DM Sans' }}>LLM Playground</h1>
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
                  ? 'bg-[#119a6a]'
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
