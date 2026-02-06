import { motion } from 'framer-motion';
import { Message } from '../../types';
import { StreamingText } from './StreamingText';
import { cn } from '../../lib/utils';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  streamingContent?: string;
}

export function MessageBubble({ message, isStreaming, streamingContent }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const content = isStreaming && streamingContent ? streamingContent : message.content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn('flex', isUser ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3',
          isUser
            ? 'bg-gradient-to-br from-indigo-500 to-violet-500 text-white'
            : 'bg-slate-100 text-slate-900'
        )}
      >
        {/* Role indicator */}
        <div
          className={cn(
            'text-xs font-medium mb-1',
            isUser ? 'text-indigo-100' : 'text-slate-500'
          )}
        >
          {isUser ? 'You' : 'Assistant'}
        </div>

        {/* Message content */}
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {isStreaming ? (
            <StreamingText content={content} isStreaming={isStreaming} />
          ) : (
            content
          )}
        </div>

        {/* Timestamp */}
        <div
          className={cn(
            'text-xs mt-2',
            isUser ? 'text-indigo-200' : 'text-slate-400'
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </motion.div>
  );
}

// Skeleton for loading state
export function MessageSkeleton() {
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-slate-100">
        <div className="space-y-2 animate-pulse">
          <div className="h-3 bg-slate-200 rounded w-16" />
          <div className="space-y-1.5">
            <div className="h-4 bg-slate-200 rounded w-full" />
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-4 bg-slate-200 rounded w-5/6" />
          </div>
        </div>
      </div>
    </div>
  );
}
