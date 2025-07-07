// OpenAI API integration for PromptVerse
import type { ModelConfig, PromptResult } from './types';

export interface OpenAIConfig {
  apiHost: string;
  apiKey: string;
  model: string;
}

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenAIClient {
  private config: OpenAIConfig;

  constructor(config: OpenAIConfig) {
    this.config = config;
  }

  async generateCompletion(
    prompt: string,
    options: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    } = {}
  ): Promise<{
    content: string;
    tokensUsed: number;
  }> {
    const messages: OpenAIMessage[] = [];
    
    // Add system prompt if provided
    if (options.systemPrompt) {
      messages.push({
        role: 'system',
        content: options.systemPrompt
      });
    }
    
    // Add user prompt
    messages.push({
      role: 'user',
      content: prompt
    });

    const requestBody = {
      model: this.config.model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2000,
      stream: false
    };

    try {
      const response = await fetch(`${this.config.apiHost}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.config.apiKey
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json() as OpenAIResponse;
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from OpenAI API');
      }

      return {
        content: data.choices[0].message.content,
        tokensUsed: data.usage?.total_tokens ?? 0
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate completion: ${error.message}`);
      }      throw new Error('Failed to generate completion: Unknown error');
    }
  }

  async generateStreamingCompletion(
    prompt: string,
    options: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
      onChunk?: (chunk: string) => void;
      signal?: AbortSignal;
    } = {}
  ): Promise<{
    content: string;
    tokensUsed: number;
  }> {
    const messages: OpenAIMessage[] = [];
    
    // Add system prompt if provided
    if (options.systemPrompt) {
      messages.push({
        role: 'system',
        content: options.systemPrompt
      });
    }
    
    // Add user prompt
    messages.push({
      role: 'user',
      content: prompt
    });

    const requestBody = {
      model: this.config.model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2000,
      stream: true
    };

    try {
      const response = await fetch(`${this.config.apiHost}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.config.apiKey
        },
        body: JSON.stringify(requestBody),
        signal: options.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      const decoder = new TextDecoder();
      let fullContent = '';
      let tokensUsed = 0;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim() !== '');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                break;
              }

              try {
                const parsed = JSON.parse(data);
                const deltaContent = parsed.choices?.[0]?.delta?.content;
                if (deltaContent) {
                  fullContent += deltaContent;
                  options.onChunk?.(deltaContent);
                }
                
                // Track token usage if available
                if (parsed.usage?.total_tokens) {
                  tokensUsed = parsed.usage.total_tokens;
                }
              } catch (parseError) {
                // Skip invalid JSON chunks
                continue;
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      return {
        content: fullContent,
        tokensUsed
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate streaming completion: ${error.message}`);
      }
      throw new Error('Failed to generate streaming completion: Unknown error');
    }
  }
}

// Default OpenAI configuration
export const DEFAULT_OPENAI_CONFIG: OpenAIConfig = {
  apiHost: 'https://aiportalapi.stu-platform.live/jpe/v1',
  apiKey: 'Bearer sk-dwFEogyru-tSQqgObMgpKw',
  model: 'GPT-4o'
};

// Helper function to create OpenAI client with default config
export function createOpenAIClient(config?: Partial<OpenAIConfig>): OpenAIClient {
  return new OpenAIClient({
    ...DEFAULT_OPENAI_CONFIG,
    ...config
  });
}

// Helper function to create OpenAI client from ModelConfig
export function createOpenAIClientFromModelConfig(modelConfig: ModelConfig): OpenAIClient {
  const config: OpenAIConfig = {
    apiHost: modelConfig.customApiHost || DEFAULT_OPENAI_CONFIG.apiHost,
    apiKey: modelConfig.customApiKey || DEFAULT_OPENAI_CONFIG.apiKey,
    model: modelConfig.model || DEFAULT_OPENAI_CONFIG.model
  };
  
  return new OpenAIClient(config);
}
