import Handlebars from 'handlebars';
import type { PromptTemplate, PromptContext, PromptOutput, ModelConfig, PromptResult } from './types';
import { OpenAIClient, createOpenAIClient, DEFAULT_OPENAI_CONFIG } from './openai';

// Export types for consumers
export type { PromptTemplate, PromptContext, PromptOutput, ModelConfig, PromptResult, PromptHistoryItem, UIState, TemplateFilter, RefinerAction } from './types';

// Export OpenAI integration
export { OpenAIClient, createOpenAIClient, createOpenAIClientFromModelConfig, DEFAULT_OPENAI_CONFIG } from './openai';

/**
 * Extracts template variables from a Handlebars template string
 * @param template - The Handlebars template string
 * @returns Array of unique variable names
 */
export function extractTemplateVariables(template: string): string[] {
  const variables = new Set<string>();
  const regex = /\{\{\s*([^}]+)\s*\}\}/g;
  let match;
  
  while ((match = regex.exec(template)) !== null) {
    const variable = match[1].trim();
    // Handle simple variables only (no helpers, conditionals, etc.)
    if (!variable.includes(' ') && !variable.startsWith('#') && !variable.startsWith('/')) {
      variables.add(variable);
    }
  }
  
  return Array.from(variables);
}

/**
 * Validates that all required fields are present in the context
 * @param requiredFields - Array of required field names
 * @param context - The context object
 * @returns Array of missing field names
 */
export function validateRequiredFields(requiredFields: string[], context: PromptContext): string[] {
  return requiredFields.filter(field => 
    context[field] === undefined || 
    context[field] === null || 
    context[field] === ''
  );
}

/**
 * Determines which context fields were actually used in the template
 * @param template - The template string
 * @param context - The context object
 * @returns Array of context field names that were used
 */
export function getUsedContextFields(template: string, context: PromptContext): string[] {
  const templateVariables = extractTemplateVariables(template);
  return templateVariables.filter(variable => 
    context[variable] !== undefined && 
    context[variable] !== null && 
    context[variable] !== ''
  );
}

/**
 * Sanitizes context values to prevent injection attacks
 * @param context - The context object
 * @returns Sanitized context object
 */
export function sanitizeContext(context: PromptContext): PromptContext {
  const sanitized: PromptContext = {};
  
  for (const [key, value] of Object.entries(context)) {
    if (value !== undefined && value !== null) {
      // Convert to string and escape potentially dangerous characters
      const stringValue = String(value);
      sanitized[key] = stringValue
        .replace(/\{\{/g, '\\{\\{')
        .replace(/\}\}/g, '\\}\\}')
        .trim();
    }
  }
  
  return sanitized;
}

/**
 * Core function to generate a prompt from a template and context
 * @param template - The prompt template
 * @param context - The context object with values to fill in
 * @returns PromptOutput with the generated prompt and metadata
 */
export function generatePrompt(template: PromptTemplate, context: PromptContext): PromptOutput {
  try {
    // Validate required fields
    const missingFields = validateRequiredFields(template.requiredFields, context);
    
    // Sanitize context to prevent injection
    const sanitizedContext = sanitizeContext(context);
    
    // Compile the Handlebars template
    const compiledTemplate = Handlebars.compile(template.template);
    
    // Generate the prompt
    const prompt = compiledTemplate(sanitizedContext);
    
    // Determine which context fields were used
    const contextUsed = getUsedContextFields(template.template, sanitizedContext);
    
    return {
      prompt: prompt.trim(),
      missingFields,
      contextUsed,
      metadata: {
        templateId: template.id,
        templateName: template.name,
        generatedAt: new Date().toISOString(),
        hasRequiredFields: missingFields.length === 0
      }
    };
  } catch (error) {
    return {
      prompt: '',
      missingFields: template.requiredFields,
      contextUsed: [],
      metadata: {
        templateId: template.id,
        templateName: template.name,
        generatedAt: new Date().toISOString(),
        hasRequiredFields: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

/**
 * Generates a prompt and runs it through an AI model
 * @param template - The prompt template
 * @param context - The context object
 * @param modelConfig - Configuration for the AI model
 * @returns Promise<PromptResult> with the generated prompt and AI response
 */
export async function generateAndRunPrompt(
  template: PromptTemplate,
  context: PromptContext,
  modelConfig: ModelConfig
): Promise<PromptResult> {
  const startTime = Date.now();
  
  // Generate the prompt first
  const promptOutput = generatePrompt(template, context);
  
  // If there are missing required fields, return early
  if (promptOutput.missingFields.length > 0) {
    return {
      prompt: promptOutput.prompt,
      result: `Error: Missing required fields: ${promptOutput.missingFields.join(', ')}`,
      sections: {},
      tokensUsed: 0,
      latencyMs: Date.now() - startTime,
      modelConfig,
      timestamp: new Date()
    };
  }
  
  try {
    let result = '';
    let tokensUsed = 0;
    
    if (modelConfig.provider === 'openai') {
      // Use OpenAI integration
      const openaiClient = createOpenAIClient({
        model: modelConfig.model
      });
      
      const systemPrompt = `You are an expert ${template.role} helping with ${template.useCase}. 
Provide a comprehensive, well-structured response that directly addresses the user's request.
Format your response clearly with appropriate headings and bullet points where helpful.`;
      
      const completion = await openaiClient.generateCompletion(promptOutput.prompt, {
        temperature: modelConfig.temperature,
        maxTokens: modelConfig.maxTokens,
        systemPrompt
      });
      
      result = completion.content;
      tokensUsed = completion.tokensUsed;
    } else {
      // Fallback for other providers (mock implementation)
      result = `[Generated with ${modelConfig.provider}/${modelConfig.model}]\n\n${promptOutput.prompt}`;
      tokensUsed = Math.floor(promptOutput.prompt.length / 4); // Rough estimate
    }
    
    // Parse sections from the AI response
    const sections = parseResponseSections(result);
    
    return {
      prompt: promptOutput.prompt,
      result,
      sections,
      tokensUsed,
      latencyMs: Date.now() - startTime,
      modelConfig,
      timestamp: new Date()
    };
  } catch (error) {
    return {
      prompt: promptOutput.prompt,
      result: `Error: ${error instanceof Error ? error.message : 'Failed to generate AI response'}`,
      sections: {},
      tokensUsed: 0,
      latencyMs: Date.now() - startTime,
      modelConfig,
      timestamp: new Date()
    };
  }
}

/**
 * Parses AI response into sections based on common patterns
 * @param response - The AI response text
 * @returns Object with section names as keys and content as values
 */
function parseResponseSections(response: string): Record<string, string> {
  const sections: Record<string, string> = {};
  
  // Split by common section patterns
  const sectionPatterns = [
    /^#+\s+(.+)$/gm,      // Markdown headers
    /^(\d+\.|\*|\-)\s+(.+)$/gm, // Numbered or bulleted lists
    /^\*\*([^*]+)\*\*:?\s*$/gm  // Bold text headers
  ];
  
  let currentSection = 'Main Content';
  let currentContent = '';
  
  const lines = response.split('\n');
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check for section headers
    const headerMatch = trimmedLine.match(/^#+\s+(.+)$/) || 
                       trimmedLine.match(/^\*\*([^*]+)\*\*:?\s*$/);
    
    if (headerMatch) {
      // Save previous section
      if (currentContent.trim()) {
        sections[currentSection] = currentContent.trim();
      }
      
      // Start new section
      currentSection = headerMatch[1];
      currentContent = '';
    } else {
      // Add to current section
      currentContent += line + '\n';
    }
  }
  
  // Save final section
  if (currentContent.trim()) {
    sections[currentSection] = currentContent.trim();
  }
  
  return sections;
}

/**
 * Utility function to create a basic prompt template
 * @param config - Template configuration
 * @returns PromptTemplate object
 */
export function createTemplate(config: {
  id: string;
  name: string;
  description: string;
  template: string;
  role: string;
  useCase: string;
  requiredFields?: string[];
  optionalFields?: string[];
}): PromptTemplate {
  const templateVariables = extractTemplateVariables(config.template);
  
  return {
    id: config.id,
    name: config.name,
    description: config.description,
    template: config.template,
    role: config.role,
    useCase: config.useCase,
    requiredFields: config.requiredFields || templateVariables,
    optionalFields: config.optionalFields || [],
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date()
  };
}
