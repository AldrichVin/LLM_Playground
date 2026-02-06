import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

type ViewType = 'chat' | 'experiments' | 'compare';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  experimentCount: number;
  comparisonCount: number;
}

interface NavItem {
  id: ViewType;
  label: string;
  icon: ReactNode;
  badge?: number;
}

export function Sidebar({ currentView, onViewChange, experimentCount, comparisonCount }: SidebarProps) {
  const navItems: NavItem[] = [
    {
      id: 'chat',
      label: 'Chat',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
    },
    {
      id: 'experiments',
      label: 'Experiments',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      ),
      badge: experimentCount,
    },
    {
      id: 'compare',
      label: 'Compare',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      badge: comparisonCount > 0 ? comparisonCount : undefined,
    },
  ];

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="w-64 border-r border-slate-200 bg-slate-50/50 flex flex-col"
    >
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            whileHover={{ x: 4 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left',
              'transition-colors duration-200',
              currentView === item.id
                ? 'bg-white text-[#119a6a] shadow-sm border border-slate-200'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            )}
          >
            {item.icon}
            <span className="font-medium text-sm">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="ml-auto bg-[#e6f7f0] text-[#119a6a] text-xs font-medium px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </motion.button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <div className="text-xs text-slate-500 space-y-1">
          <p>Keyboard shortcuts:</p>
          <div className="flex justify-between">
            <span>Send message</span>
            <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-700">Enter</kbd>
          </div>
          <div className="flex justify-between">
            <span>New line</span>
            <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-700">Shift+Enter</kbd>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
