import React, { useState } from 'react';
import { usePromptStore } from '../store/promptStore';
import { createOpenAIClientFromModelConfig } from '@promptverse/prompt-engine';
import { useToast } from './Toast';

interface RefinerTool {
  id: string;
  name: string;
  icon: string;
  prompt: string;
  description: string;
  color: string;
}

const refinerTools: RefinerTool[] = [
  {
    id: 'concise',
    name: 'Make Concise',
    icon: '✂️',
    prompt: 'Optimize the following prompt to be more concise while preserving all key information and instructions:',
    description: 'Remove unnecessary words and make it shorter',
    color: 'blue'
  },
  {
    id: 'specific',
    name: 'More Specific',
    icon: '🎯',
    prompt: 'Enhance the following prompt with more specific instructions and clearer expectations:',
    description: 'Add clarity and specificity to reduce ambiguity',
    color: 'green'
  },
  {
    id: 'structured',
    name: 'Better Structure',
    icon: '🏗️',
    prompt: 'Restructure the following prompt with better organization, clear sections, and logical flow:',
    description: 'Improve organization and readability',
    color: 'indigo'
  },
  {
    id: 'context',
    name: 'Add Context',
    icon: '📋',
    prompt: 'Enhance the following prompt by adding relevant context, background information, and examples:',
    description: 'Add more comprehensive context and examples',
    color: 'orange'
  },
  {
    id: 'constraints',
    name: 'Add Constraints',
    icon: '⚙️',
    prompt: 'Improve the following prompt by adding appropriate constraints, format requirements, and output specifications:',
    description: 'Add technical constraints and output format guidance',
    color: 'gray'
  },
  {
    id: 'roleplay',
    name: 'Role-based',
    icon: '🎭',
    prompt: 'Transform the following prompt to include role-playing instructions and persona-based guidance:',
    description: 'Add role-playing elements and persona guidance',
    color: 'purple'
  }
];

interface RefinerToolsProps {
  content: string;
  onRefined: (refinedContent: string, toolUsed: string) => void;
  className?: string;
}

export const RefinerTools: React.FC<RefinerToolsProps> = ({ 
  content, 
  onRefined, 
  className = '' 
}) => {
  const { modelConfig, isGenerating, setIsGenerating } = usePromptStore();
  const { showToast } = useToast();
  const [activeRefinement, setActiveRefinement] = useState<string | null>(null);  const handleRefine = async (tool: RefinerTool) => {
    if (!content.trim()) {
      showToast('No content to refine', 'error');
      return;
    }

    setIsGenerating(true);
    setActiveRefinement(tool.id);
    
    try {
      showToast(`Applying ${tool.name}...`, 'info');
      
      // Create the refinement prompt for prompt engineering
      const refinementPrompt = `${tool.prompt}

Original Prompt:
"""
${content}
"""

Please provide only the improved prompt as your response, without any explanations or additional text. Focus on making it a better prompt for AI systems while maintaining the original intent.`;

      // Use OpenAI client directly for prompt refinement
      const openaiClient = createOpenAIClientFromModelConfig(modelConfig);
      
      const response = await openaiClient.generateCompletion(refinementPrompt, {
        temperature: modelConfig.temperature || 0.3,
        maxTokens: modelConfig.maxTokens || 2000,
        systemPrompt: 'You are an expert prompt engineer. Your task is to improve prompts to make them more effective for AI systems. Return only the refined prompt without any explanations.'
      });

      const refinedPrompt = response.content?.trim();
      
      if (refinedPrompt) {
        onRefined(refinedPrompt, tool.name);
        showToast(`${tool.name} applied successfully!`, 'success');
      } else {
        throw new Error('No refined prompt received');
      }
    } catch (error) {
      showToast(`Failed to apply ${tool.name}`, 'error');
      console.error('Refiner error:', error);
    } finally {
      setIsGenerating(false);
      setActiveRefinement(null);
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'border-blue-200 hover:bg-blue-50 text-blue-700',
      green: 'border-green-200 hover:bg-green-50 text-green-700',
      purple: 'border-purple-200 hover:bg-purple-50 text-purple-700',
      orange: 'border-orange-200 hover:bg-orange-50 text-orange-700',
      indigo: 'border-indigo-200 hover:bg-indigo-50 text-indigo-700',
      gray: 'border-gray-200 hover:bg-gray-50 text-gray-700'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.gray;
  };

  return (
    <div className={`card ${className}`}>
      <div className="card-header">        <div>
          <h3 className="text-lg font-semibold text-gray-900">Prompt Refiner Tools</h3>
          <p className="text-sm text-gray-600">Improve your prompt engineering</p>
        </div>
        {content.trim() && (
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {content.length} characters
          </div>
        )}
      </div>
      
      {!content.trim() ? (
        <div className="text-center py-8 text-gray-500">
          <div className="w-12 h-12 mx-auto mb-3 text-gray-300">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <p className="text-sm">Generate a prompt first to use refiner tools</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {refinerTools.map(tool => (
            <button
              key={tool.id}
              onClick={() => handleRefine(tool)}
              disabled={isGenerating}
              className={`
                relative flex items-center gap-3 p-3 text-left border rounded-lg 
                transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                ${getColorClasses(tool.color)}
                ${activeRefinement === tool.id ? 'ring-2 ring-primary-500' : ''}
              `}
            >
              {activeRefinement === tool.id && (
                <div className="absolute inset-0 bg-white bg-opacity-50 rounded-lg flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
              
              <span className="text-lg flex-shrink-0">{tool.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{tool.name}</div>
                <div className="text-xs opacity-75 line-clamp-2">{tool.description}</div>
              </div>
            </button>
          ))}
        </div>
      )}
      
      {isGenerating && activeRefinement && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Refining prompt with AI...</span>
          </div>
        </div>
      )}
    </div>
  );
};
