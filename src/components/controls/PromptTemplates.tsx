import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PromptTemplate } from '../../types';
import { usePromptTemplateStore, applyTemplate } from '../../hooks/usePromptTemplates';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface PromptTemplatesProps {
  onApply: (prompt: string) => void;
  currentPrompt?: string;
}

export function PromptTemplates({ onApply, currentPrompt }: PromptTemplatesProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');

  const templates = usePromptTemplateStore((s) => s.templates);
  const addTemplate = usePromptTemplateStore((s) => s.addTemplate);
  const deleteTemplate = usePromptTemplateStore((s) => s.deleteTemplate);

  const handleSelectTemplate = (template: PromptTemplate) => {
    setSelectedTemplate(template);
    setVariableValues({});
  };

  const handleApplyTemplate = () => {
    if (!selectedTemplate) return;
    const result = applyTemplate(selectedTemplate, variableValues);
    onApply(result);
    setSelectedTemplate(null);
    setVariableValues({});
    setIsExpanded(false);
  };

  const handleSaveAsTemplate = () => {
    if (!currentPrompt || !newTemplateName.trim()) return;
    addTemplate(newTemplateName.trim(), currentPrompt);
    setNewTemplateName('');
    setShowSaveDialog(false);
  };

  const allVariablesFilled = selectedTemplate
    ? selectedTemplate.variables.every((v) => variableValues[v]?.trim())
    : false;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
            />
          </svg>
          Templates
          <svg
            className={cn('w-3 h-3 transition-transform', isExpanded && 'rotate-180')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {currentPrompt && (
          <button
            onClick={() => setShowSaveDialog(true)}
            className="text-xs text-[#119a6a] hover:text-[#0e7d56]"
          >
            Save current as template
          </button>
        )}
      </div>

      {/* Save dialog */}
      <AnimatePresence>
        {showSaveDialog && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 bg-[#e6f7f0] rounded-lg space-y-2">
              <input
                type="text"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="Template name"
                className="w-full px-3 py-1.5 text-sm border border-indigo-200 rounded focus:ring-2 focus:ring-[#119a6a]/20 focus:border-[#119a6a]"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveAsTemplate} disabled={!newTemplateName.trim()}>
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowSaveDialog(false)}>
                  Cancel
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                Tip: Use {'{{variable}}'} syntax for placeholders
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template list */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-2">
              {templates.map((template) => (
                <motion.div
                  key={template.id}
                  layout
                  className={cn(
                    'p-3 rounded-lg border transition-colors cursor-pointer',
                    selectedTemplate?.id === template.id
                      ? 'border-[#119a6a] bg-[#e6f7f0]'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  )}
                  onClick={() => handleSelectTemplate(template)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-sm text-slate-900">{template.name}</div>
                      <div className="text-xs text-slate-500 mt-1 line-clamp-2">{template.content}</div>
                      {template.variables.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {template.variables.map((v) => (
                            <span
                              key={v}
                              className="px-1.5 py-0.5 text-xs rounded bg-slate-100 text-slate-600"
                            >
                              {v}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {!template.id.startsWith('default-') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTemplate(template.id);
                        }}
                        className="p-1 text-slate-400 hover:text-red-500"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Variable inputs */}
                  <AnimatePresence>
                    {selectedTemplate?.id === template.id && template.variables.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 pt-3 border-t border-slate-200 space-y-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {template.variables.map((variable) => (
                          <div key={variable}>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                              {variable}
                            </label>
                            <input
                              type="text"
                              value={variableValues[variable] || ''}
                              onChange={(e) =>
                                setVariableValues((prev) => ({ ...prev, [variable]: e.target.value }))
                              }
                              placeholder={`Enter ${variable}...`}
                              className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-[#119a6a]/20 focus:border-[#119a6a]"
                            />
                          </div>
                        ))}
                        <Button
                          size="sm"
                          onClick={handleApplyTemplate}
                          disabled={!allVariablesFilled}
                          className="w-full mt-2"
                        >
                          Apply Template
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Apply button for templates without variables */}
                  {selectedTemplate?.id === template.id && template.variables.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button size="sm" onClick={handleApplyTemplate} className="w-full">
                        Apply Template
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
