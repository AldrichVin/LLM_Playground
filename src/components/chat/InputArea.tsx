import { useState, useRef, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { PromptTemplates } from '../controls/PromptTemplates';
import { cn } from '../../lib/utils';

interface InputAreaProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export function InputArea({ onSend, onStop, isStreaming, disabled }: InputAreaProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleApplyTemplate = (prompt: string) => {
    setInput(prompt);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
      textareaRef.current.focus();
    }
  };

  const handleSubmit = () => {
    if (input.trim() && !isStreaming && !disabled) {
      onSend(input);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="border-t border-slate-200 bg-white p-4"
    >
      {/* Prompt Templates */}
      <div className="mb-3">
        <PromptTemplates onApply={handleApplyTemplate} currentPrompt={input.trim() || undefined} />
      </div>

      <div className="flex gap-3 items-end">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? 'Ollama not connected...' : 'Type a message...'}
            disabled={disabled || isStreaming}
            rows={1}
            className={cn(
              'w-full px-4 py-3 pr-12',
              'bg-slate-50 border border-slate-200 rounded-xl',
              'text-sm text-slate-900 placeholder:text-slate-400',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500',
              'transition-all duration-200',
              'resize-none overflow-hidden',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          />
          <div className="absolute right-3 bottom-3 text-xs text-slate-400">
            {input.length > 0 && `${input.length} chars`}
          </div>
        </div>

        {isStreaming ? (
          <Button
            variant="danger"
            onClick={onStop}
            className="h-12 w-12 p-0 flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!input.trim() || disabled}
            className="h-12 w-12 p-0 flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </Button>
        )}
      </div>

      {isStreaming && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 mt-2 text-sm text-slate-500"
        >
          <div className="flex gap-1">
            <motion.div
              className="w-1.5 h-1.5 bg-indigo-500 rounded-full"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="w-1.5 h-1.5 bg-indigo-500 rounded-full"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
              className="w-1.5 h-1.5 bg-indigo-500 rounded-full"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
            />
          </div>
          <span>Generating response...</span>
        </motion.div>
      )}
    </motion.div>
  );
}
