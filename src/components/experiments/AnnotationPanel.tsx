import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Annotation, ANNOTATION_TAGS, AnnotationTag, RadarScores } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { RadarPanel } from './RadarPanel';
import { cn } from '../../lib/utils';

interface AnnotationPanelProps {
  annotation?: Annotation;
  onUpdate: (annotation: Partial<Annotation>) => void;
  compact?: boolean;
}

export function AnnotationPanel({ annotation, onUpdate, compact = false }: AnnotationPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [notes, setNotes] = useState(annotation?.notes || '');

  const handleThumbsChange = (value: 'up' | 'down') => {
    onUpdate({ thumbs: annotation?.thumbs === value ? null : value });
  };

  const handleRatingChange = (rating: 1 | 2 | 3 | 4 | 5) => {
    onUpdate({ rating: annotation?.rating === rating ? null : rating });
  };

  const handleTagToggle = (tag: AnnotationTag) => {
    const currentTags = annotation?.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    onUpdate({ tags: newTags });
  };

  const handleNotesBlur = () => {
    if (notes !== annotation?.notes) {
      onUpdate({ notes });
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleThumbsChange('up');
          }}
          className={cn(
            'p-1.5 rounded-lg transition-all',
            annotation?.thumbs === 'up'
              ? 'bg-green-100 text-green-600'
              : 'text-slate-400 hover:text-green-500 hover:bg-green-50'
          )}
        >
          <ThumbsUpIcon className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleThumbsChange('down');
          }}
          className={cn(
            'p-1.5 rounded-lg transition-all',
            annotation?.thumbs === 'down'
              ? 'bg-red-100 text-red-600'
              : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
          )}
        >
          <ThumbsDownIcon className="w-4 h-4" />
        </button>
        {annotation?.tags && annotation.tags.length > 0 && (
          <Badge variant="default">{annotation.tags.length} tags</Badge>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
        >
          <ExpandIcon className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Thumbs up/down */}
      <div>
        <label className="text-xs font-medium text-slate-500 mb-2 block">Quick Rating</label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleThumbsChange('up')}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
              annotation?.thumbs === 'up'
                ? 'bg-green-50 border-green-300 text-green-700'
                : 'border-slate-200 text-slate-500 hover:border-green-300 hover:text-green-600'
            )}
          >
            <ThumbsUpIcon className="w-4 h-4" />
            <span className="text-sm">Good</span>
          </button>
          <button
            onClick={() => handleThumbsChange('down')}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
              annotation?.thumbs === 'down'
                ? 'bg-red-50 border-red-300 text-red-700'
                : 'border-slate-200 text-slate-500 hover:border-red-300 hover:text-red-600'
            )}
          >
            <ThumbsDownIcon className="w-4 h-4" />
            <span className="text-sm">Poor</span>
          </button>
        </div>
      </div>

      {/* Star rating */}
      <div>
        <label className="text-xs font-medium text-slate-500 mb-2 block">Detailed Rating</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRatingChange(star as 1 | 2 | 3 | 4 | 5)}
              className={cn(
                'p-1 transition-all',
                annotation?.rating && annotation.rating >= star
                  ? 'text-amber-400'
                  : 'text-slate-300 hover:text-amber-300'
              )}
            >
              <StarIcon className="w-6 h-6" filled={annotation?.rating ? annotation.rating >= star : false} />
            </button>
          ))}
          {annotation?.rating && (
            <span className="ml-2 text-sm text-slate-500">{annotation.rating}/5</span>
          )}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="text-xs font-medium text-slate-500 mb-2 block">Tags</label>
        <div className="flex flex-wrap gap-2">
          {ANNOTATION_TAGS.map((tag) => {
            const isSelected = annotation?.tags?.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-medium transition-all',
                  isSelected
                    ? 'bg-[#e6f7f0] text-[#0e7d56] border border-[#119a6a]'
                    : 'bg-slate-100 text-slate-600 border border-transparent hover:bg-slate-200'
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="text-xs font-medium text-slate-500 mb-2 block">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleNotesBlur}
          placeholder="Add notes about this response..."
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#119a6a]/20 focus:border-[#119a6a]"
          rows={3}
        />
      </div>

      {/* Evaluation Radar */}
      <RadarPanel
        scores={annotation?.radar}
        onUpdate={(radar: RadarScores) => onUpdate({ radar })}
        compact={false}
      />
    </div>
  );
}

// Inline annotation display for cards
export function AnnotationBadges({ annotation }: { annotation?: Annotation }) {
  if (!annotation) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {annotation.thumbs === 'up' && (
        <Badge variant="success" className="flex items-center gap-1">
          <ThumbsUpIcon className="w-3 h-3" />
          Good
        </Badge>
      )}
      {annotation.thumbs === 'down' && (
        <Badge variant="error" className="flex items-center gap-1">
          <ThumbsDownIcon className="w-3 h-3" />
          Poor
        </Badge>
      )}
      {annotation.rating && (
        <Badge variant="warning" className="flex items-center gap-1">
          <StarIcon className="w-3 h-3" filled />
          {annotation.rating}/5
        </Badge>
      )}
      {annotation.tags?.slice(0, 2).map((tag) => (
        <Badge key={tag} variant="default">
          {tag}
        </Badge>
      ))}
      {annotation.tags && annotation.tags.length > 2 && (
        <Badge variant="info">+{annotation.tags.length - 2}</Badge>
      )}
    </div>
  );
}

// Icons
function ThumbsUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
      />
    </svg>
  );
}

function ThumbsDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
      />
    </svg>
  );
}

function StarIcon({ className, filled }: { className?: string; filled: boolean }) {
  return (
    <svg className={className} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  );
}

function ExpandIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
      />
    </svg>
  );
}
