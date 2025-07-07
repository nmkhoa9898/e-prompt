// Core types for PromptVerse

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  role: string;
  useCase: string;
  requiredFields: string[];
  optionalFields?: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PromptContext {
  [key: string]: string | number | boolean | Date | undefined;
}

export interface PromptOutput {
  prompt: string;
  missingFields: string[];
  contextUsed: string[];
  metadata?: Record<string, any>;
}

export interface ModelConfig {
  provider: 'openai' | 'anthropic' | 'google' | 'local';
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  // Optional custom API configuration
  customApiHost?: string;
  customApiKey?: string;
}

export interface PromptResult {
  prompt: string;
  result: string;
  sections?: Record<string, string>;
  tokensUsed?: number;
  latencyMs?: number;
  modelConfig: ModelConfig;
  timestamp: Date;
}

export interface PromptHistoryItem {
  id: string;
  templateId: string;
  context: PromptContext;
  output: PromptOutput;
  result?: PromptResult;
  createdAt: Date;
}

// UI-specific types
export interface UIState {
  selectedTemplate: PromptTemplate | null;
  currentContext: PromptContext;
  promptHistory: PromptHistoryItem[];
  isGenerating: boolean;
  error: string | null;
}

export interface TemplateFilter {
  role?: string;
  useCase?: string;
  search?: string;
}

export type RefinerAction = 'make-concise' | 'make-friendly' | 'make-formal' | 'add-examples' | 'simplify';
