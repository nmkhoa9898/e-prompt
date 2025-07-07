import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { 
  PromptTemplate, 
  PromptContext, 
  PromptOutput, 
  PromptHistoryItem, 
  UIState, 
  TemplateFilter,
  ModelConfig 
} from '@promptverse/prompt-engine';

interface PromptStore extends UIState {
  // Template management
  templates: PromptTemplate[];
  setTemplates: (templates: PromptTemplate[]) => void;
  addTemplate: (template: PromptTemplate) => void;
  updateTemplate: (id: string, updates: Partial<PromptTemplate>) => void;
  deleteTemplate: (id: string) => void;
  
  // Template selection and filtering
  setSelectedTemplate: (template: PromptTemplate | null) => void;
  templateFilter: TemplateFilter;
  setTemplateFilter: (filter: TemplateFilter) => void;
  
  // Context management
  setCurrentContext: (context: PromptContext) => void;
  updateContextField: (field: string, value: string) => void;
  clearContext: () => void;
    // Prompt generation
  currentPromptOutput: PromptOutput | null;
  setCurrentPromptOutput: (output: PromptOutput | null) => void;
  
  // AI response and refined content
  aiResponse: string;
  setAiResponse: (response: string) => void;
  refinedContent: string;
  setRefinedContent: (content: string) => void;
  lastRefinementTool: string;
  setLastRefinementTool: (tool: string) => void;
  
  // Model configuration
  modelConfig: ModelConfig;
  setModelConfig: (config: ModelConfig) => void;
  
  // History management
  addToHistory: (item: PromptHistoryItem) => void;
  clearHistory: () => void;
  
  // UI state
  setIsGenerating: (isGenerating: boolean) => void;
  setError: (error: string | null) => void;
  
  // Utility functions
  getFilteredTemplates: () => PromptTemplate[];
  getTemplateById: (id: string) => PromptTemplate | undefined;
}

export const usePromptStore = create<PromptStore>()(
  devtools(
    (set, get) => ({      // Initial state
      selectedTemplate: null,
      currentContext: {},
      promptHistory: [],
      isGenerating: false,
      error: null,
      templates: [],
      templateFilter: {},      currentPromptOutput: null,
      aiResponse: '',
      refinedContent: '',
      lastRefinementTool: '',
      modelConfig: {
        provider: 'openai',
        model: 'GPT-4o',
        temperature: 0.7,
        maxTokens: 2000
      },
      
      // Template management
      setTemplates: (templates) => set({ templates }),
      
      addTemplate: (template) => set((state) => ({
        templates: [...state.templates, template]
      })),
      
      updateTemplate: (id, updates) => set((state) => ({
        templates: state.templates.map(template => 
          template.id === id ? { ...template, ...updates, updatedAt: new Date() } : template
        )
      })),
      
      deleteTemplate: (id) => set((state) => ({
        templates: state.templates.filter(template => template.id !== id),
        selectedTemplate: state.selectedTemplate?.id === id ? null : state.selectedTemplate
      })),
      
      // Template selection and filtering
      setSelectedTemplate: (template) => set({ selectedTemplate: template }),
      
      setTemplateFilter: (filter) => set({ templateFilter: filter }),
      
      // Context management
      setCurrentContext: (context) => set({ currentContext: context }),
      
      updateContextField: (field, value) => set((state) => ({
        currentContext: { ...state.currentContext, [field]: value }
      })),
      
      clearContext: () => set({ currentContext: {} }),        // Prompt generation
        setCurrentPromptOutput: (output) => set({ currentPromptOutput: output }),
        
        // AI response and refined content
        setAiResponse: (response) => set({ aiResponse: response }),
        setRefinedContent: (content) => set({ refinedContent: content }),
        setLastRefinementTool: (tool) => set({ lastRefinementTool: tool }),
      
      // Model configuration
      setModelConfig: (config) => set({ modelConfig: config }),
      
      // History management
      addToHistory: (item) => set((state) => ({
        promptHistory: [item, ...state.promptHistory].slice(0, 100) // Keep last 100 items
      })),
      
      clearHistory: () => set({ promptHistory: [] }),
      
      // UI state
      setIsGenerating: (isGenerating) => set({ isGenerating }),
      
      setError: (error) => set({ error }),
      
      // Utility functions
      getFilteredTemplates: () => {
        const { templates, templateFilter } = get();
        return templates.filter(template => {
          if (templateFilter.role && template.role !== templateFilter.role) {
            return false;
          }
          if (templateFilter.useCase && template.useCase !== templateFilter.useCase) {
            return false;
          }
          if (templateFilter.search) {
            const searchTerm = templateFilter.search.toLowerCase();
            return (
              template.name.toLowerCase().includes(searchTerm) ||
              template.description.toLowerCase().includes(searchTerm) ||
              template.template.toLowerCase().includes(searchTerm)
            );
          }
          return true;
        });
      },
      
      getTemplateById: (id) => {
        const { templates } = get();
        return templates.find(template => template.id === id);
      }
    }),    {      name: 'prompt-store',
      partialize: (state: PromptStore) => ({
        promptHistory: state.promptHistory,
        templates: state.templates,
        currentContext: state.currentContext,
        modelConfig: state.modelConfig
      })
    }
  )
);
