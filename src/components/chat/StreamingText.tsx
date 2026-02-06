import { motion } from 'framer-motion';

interface StreamingTextProps {
  content: string;
  isStreaming: boolean;
}

export function StreamingText({ content, isStreaming }: StreamingTextProps) {
  // Split content into words for smoother animation
  const words = content.split(/(\s+)/);

  return (
    <span className="inline">
      {words.map((word, index) => (
        <motion.span
          key={`${index}-${word}`}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.1, ease: 'easeOut' }}
        >
          {word}
        </motion.span>
      ))}

      {/* Blinking cursor */}
      {isStreaming && (
        <motion.span
          className="inline-block w-2 h-4 ml-0.5 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-sm align-middle"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
      )}
    </span>
  );
}
