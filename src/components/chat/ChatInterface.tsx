import { useRef, useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '../../types';
import { MessageBubble, MessageSkeleton } from './MessageBubble';
import { InputArea } from './InputArea';
import { Button } from '../ui/Button';
import { PipelineFlow, PipelineState } from './PipelineFlow';

interface ChatInterfaceProps {
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
  error: string | null;
  isConnected: boolean | null;
  modelName?: string;
  onSend: (message: string) => void;
  onStop: () => void;
  onClear: () => void;
}

export function ChatInterface({
  messages,
  isStreaming,
  streamingContent,
  error,
  isConnected,
  modelName = 'Model',
  onSend,
  onStop,
  onClear,
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [pipelineCollapsed, setPipelineCollapsed] = useState(true);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Calculate pipeline state
  const pipelineState: PipelineState = useMemo(() => {
    if (error) return 'error';
    if (isStreaming && streamingContent) return 'streaming';
    if (isStreaming) return 'pending';
    if (messages.length > 0) return 'complete';
    return 'idle';
  }, [error, isStreaming, streamingContent, messages.length]);

  const tokenCount = streamingContent ? streamingContent.split(/\s+/).length : undefined;

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="font-semibold text-slate-900">Chat</h2>
            <p className="text-xs text-slate-500">
              {messages.length} message{messages.length !== 1 ? 's' : ''} in conversation
            </p>
          </div>
          {/* Compact Pipeline Status Button */}
          <button
            onClick={() => setPipelineCollapsed(!pipelineCollapsed)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors text-sm"
          >
            <div className={`w-2 h-2 rounded-full ${
              pipelineState === 'error' ? 'bg-red-500' :
              pipelineState === 'streaming' ? 'bg-indigo-500 animate-pulse' :
              pipelineState === 'pending' ? 'bg-amber-500 animate-pulse' :
              pipelineState === 'complete' ? 'bg-emerald-500' :
              'bg-slate-300'
            }`} />
            <span className="text-slate-700">
              {pipelineState === 'error' ? 'Error' :
               pipelineState === 'streaming' ? 'Streaming' :
               pipelineState === 'pending' ? 'Processing' :
               pipelineState === 'complete' ? 'Complete' :
               'Ready'}
            </span>
            <svg
              className={`w-3 h-3 text-slate-400 transition-transform ${!pipelineCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Clear
          </Button>
        )}
      </div>

      {/* Expanded Pipeline View */}
      <AnimatePresence>
        {!pipelineCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-slate-200 overflow-hidden"
          >
            <div className="p-4 bg-slate-50/50">
              <PipelineFlow
                state={pipelineState}
                modelName={modelName}
                error={error}
                tokenCount={tokenCount}
                collapsed={false}
                onToggleCollapse={() => setPipelineCollapsed(true)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.length === 0 && !isStreaming && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Start a conversation</h3>
            <p className="text-sm text-slate-500 max-w-md">
              Send a message to begin chatting with the selected model. Adjust parameters in the
              controls panel to customize the response behavior.
            </p>
          </motion.div>
        )}

        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isStreaming={false}
            />
          ))}
        </AnimatePresence>

        {/* Streaming message */}
        {isStreaming && streamingContent && (
          <MessageBubble
            message={{
              id: 'streaming',
              role: 'assistant',
              content: streamingContent,
              timestamp: Date.now(),
            }}
            isStreaming={true}
            streamingContent={streamingContent}
          />
        )}

        {/* Error display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <InputArea
        onSend={onSend}
        onStop={onStop}
        isStreaming={isStreaming}
        disabled={isConnected === false}
      />
    </div>
  );
}
