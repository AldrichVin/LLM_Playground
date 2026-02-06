import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PromptTemplate } from '../types';

interface PromptTemplateState {
  templates: PromptTemplate[];
  addTemplate: (name: string, content: string) => void;
  deleteTemplate: (id: string) => void;
  updateTemplate: (id: string, updates: Partial<Omit<PromptTemplate, 'id'>>) => void;
}

function extractVariables(content: string): string[] {
  const regex = /\{\{(\w+)\}\}/g;
  const variables: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }
  return variables;
}

export const usePromptTemplateStore = create<PromptTemplateState>()(
  persist(
    (set) => ({
      templates: [
        {
          id: 'default-explain',
          name: 'Explain Concept',
          content: 'Explain {{concept}} in simple terms that a beginner could understand.',
          variables: ['concept'],
          createdAt: Date.now(),
        },
        {
          id: 'default-compare',
          name: 'Compare Two Things',
          content: 'Compare and contrast {{thing1}} and {{thing2}}. List the key similarities and differences.',
          variables: ['thing1', 'thing2'],
          createdAt: Date.now(),
        },
        {
          id: 'default-code',
          name: 'Code Task',
          content: 'Write a {{language}} function that {{task}}. Include comments explaining the code.',
          variables: ['language', 'task'],
          createdAt: Date.now(),
        },
      ],

      addTemplate: (name, content) =>
        set((state) => ({
          templates: [
            {
              id: `tmpl_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
              name,
              content,
              variables: extractVariables(content),
              createdAt: Date.now(),
            },
            ...state.templates,
          ],
        })),

      deleteTemplate: (id) =>
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        })),

      updateTemplate: (id, updates) =>
        set((state) => ({
          templates: state.templates.map((t) => {
            if (t.id !== id) return t;
            const newContent = updates.content ?? t.content;
            return {
              ...t,
              ...updates,
              variables: updates.content ? extractVariables(newContent) : t.variables,
            };
          }),
        })),
    }),
    {
      name: 'llm-playground-templates',
    }
  )
);

export function applyTemplate(template: PromptTemplate, variables: Record<string, string>): string {
  let result = template.content;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return result;
}
