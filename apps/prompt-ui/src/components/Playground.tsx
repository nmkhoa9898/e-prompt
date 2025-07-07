import React, { useState, useEffect } from 'react';
import { usePromptStore } from '../store/promptStore';
import { generatePrompt, generateAndRunPrompt } from '@promptverse/prompt-engine';
import { ModelSettings } from './ModelSettings';
import { RefinerTools } from './RefinerTools';
import { useToast } from './Toast';

export const Playground: React.FC = () => {  const { 
    selectedTemplate, 
    currentContext, 
    currentPromptOutput, 
    setCurrentPromptOutput,
    addToHistory,
    isGenerating,
    setIsGenerating,
    error,
    setError,
    modelConfig,
    setModelConfig,
    aiResponse,
    setAiResponse,
    refinedContent,
    setRefinedContent,
    lastRefinementTool,
    setLastRefinementTool
  } = usePromptStore();

  const [previewMode, setPreviewMode] = useState<'template' | 'preview' | 'output'>('template');
  const [outputSubTab, setOutputSubTab] = useState<'generated' | 'refined' | 'ai-response'>('generated');
  const [showModelSettings, setShowModelSettings] = useState(false);
  const { showToast } = useToast();

  // Generate prompt preview when context changes
  useEffect(() => {
    if (selectedTemplate && Object.keys(currentContext).length > 0) {
      try {
        const output = generatePrompt(selectedTemplate, currentContext);
        setCurrentPromptOutput(output);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate prompt');
        setCurrentPromptOutput(null);
      }
    } else {
      setCurrentPromptOutput(null);
    }
  }, [selectedTemplate, currentContext, setCurrentPromptOutput, setError]);

  if (!selectedTemplate) {
    return null;
  }

  const handleGeneratePrompt = () => {
    if (!selectedTemplate) return;
    
    setIsGenerating(true);
    
    try {
      const output = generatePrompt(selectedTemplate, currentContext);
      setCurrentPromptOutput(output);
      
      // Add to history
      addToHistory({
        id: Date.now().toString(),
        templateId: selectedTemplate.id,
        context: { ...currentContext },
        output,
        createdAt: new Date()
      });
      
      setError(null);
      setPreviewMode('output');
      setOutputSubTab('generated'); // Auto-switch to generated prompt sub-tab
      showToast('Prompt generated successfully!', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate prompt');
      showToast('Failed to generate prompt', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateWithAI = async () => {
    if (!selectedTemplate || !currentPromptOutput?.prompt) return;
    
    setIsGenerating(true);
    setAiResponse('');
    
    try {
      showToast('Generating AI response...', 'info');
      const result = await generateAndRunPrompt(selectedTemplate, currentContext, modelConfig);
      setAiResponse(result.result);
      setPreviewMode('output');
      setOutputSubTab('ai-response'); // Auto-switch to AI response sub-tab
      setError(null);
      showToast('AI response generated successfully!', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate AI response');
      showToast('Failed to generate AI response', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyRefinedPrompt = () => {
    if (refinedContent) {
      navigator.clipboard.writeText(refinedContent);
      showToast('Refined prompt copied to clipboard!', 'success');
    }
  };

  const handleGenerateWithRefinedPrompt = async () => {
    if (!selectedTemplate || !refinedContent) return;
    
    setIsGenerating(true);
    setAiResponse('');
    
    try {
      showToast('Generating AI response with refined prompt...', 'info');
      
      // Create a temporary context with the refined content as the main prompt
      const refinedContext = { ...currentContext, refined_prompt: refinedContent };
      const tempTemplate = {
        ...selectedTemplate,
        template: '{{refined_prompt}}',
        requiredFields: ['refined_prompt']
      };
      
      const result = await generateAndRunPrompt(tempTemplate, refinedContext, modelConfig);
      setAiResponse(result.result);
      setPreviewMode('output');
      setOutputSubTab('ai-response'); // Auto-switch to AI response sub-tab
      setError(null);
      showToast('AI response generated with refined prompt!', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate AI response with refined prompt');
      showToast('Failed to generate AI response with refined prompt', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPrompt = () => {
    if (currentPromptOutput?.prompt) {
      navigator.clipboard.writeText(currentPromptOutput.prompt);
      showToast('Prompt copied to clipboard!', 'success');
    }
  };

  const handleExport = () => {
    if (!currentPromptOutput?.prompt && !aiResponse) return;
    
    const exportData = {
      template: selectedTemplate?.name || 'Unknown Template',
      context: currentContext,
      generatedPrompt: currentPromptOutput?.prompt || '',
      aiResponse: aiResponse || '',
      refinedContent: refinedContent || '',
      lastRefinementTool: lastRefinementTool || '',
      timestamp: new Date().toISOString(),
      modelConfig: aiResponse ? modelConfig : undefined
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `promptverse-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Export downloaded successfully!', 'success');
  };

  const handleRefinedContent = (refined: string, toolUsed: string) => {
    setRefinedContent(refined);
    setLastRefinementTool(toolUsed);
    setPreviewMode('output');
    setOutputSubTab('refined'); // Auto-switch to refined sub-tab
    showToast(`Content refined with ${toolUsed}!`, 'success');
  };

  const renderTemplateView = () => (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Template Preview</h4>
        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
          {selectedTemplate.template}
        </pre>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Required Fields</h4>
          <div className="space-y-1">
            {selectedTemplate.requiredFields.map(field => (
              <div key={field} className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span className="text-sm text-gray-700">{field}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Optional Fields</h4>
          <div className="space-y-1">
            {(selectedTemplate.optionalFields || []).map(field => (
              <div key={field} className="flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                <span className="text-sm text-gray-700">{field}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreviewView = () => (
    <div className="space-y-4">
      {currentPromptOutput ? (
        <>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Generated Prompt</h4>
            <div className="text-sm text-blue-800 whitespace-pre-wrap">
              {currentPromptOutput.prompt || 'No prompt generated yet'}
            </div>
          </div>
          
          {currentPromptOutput.missingFields.length > 0 && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">Missing Fields</h4>
              <div className="space-y-1">
                {currentPromptOutput.missingFields.map(field => (
                  <div key={field} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    <span className="text-sm text-yellow-800">{field}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Context Used</h4>
            <div className="space-y-1">
              {currentPromptOutput.contextUsed.map(field => (
                <div key={field} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm text-green-800">{field}: {String(currentContext[field])}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>Fill in the context fields to see a preview</p>
        </div>
      )}
    </div>
  );

  const renderOutputView = () => (
    <div className="space-y-4">
      {/* Output Sub-tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setOutputSubTab('generated')}
          className={`px-3 py-2 text-sm font-medium ${
            outputSubTab === 'generated' 
              ? 'border-b-2 border-primary-500 text-primary-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Generated Prompt
        </button>
        <button
          onClick={() => setOutputSubTab('refined')}
          className={`px-3 py-2 text-sm font-medium ${
            outputSubTab === 'refined' 
              ? 'border-b-2 border-primary-500 text-primary-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          disabled={!refinedContent}
        >
          Refined Prompt
          {refinedContent && (
            <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
              {lastRefinementTool}
            </span>
          )}
        </button>
        <button
          onClick={() => setOutputSubTab('ai-response')}
          className={`px-3 py-2 text-sm font-medium ${
            outputSubTab === 'ai-response' 
              ? 'border-b-2 border-primary-500 text-primary-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          disabled={!aiResponse}
        >
          AI Response
          {aiResponse && (
            <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
              ✓
            </span>
          )}
        </button>
      </div>

      {/* Sub-tab Content */}
      <div className="min-h-[200px]">
        {outputSubTab === 'generated' && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Generated Prompt</h4>
                <button 
                  onClick={handleCopyPrompt}
                  className="btn-secondary text-xs"
                  disabled={!currentPromptOutput?.prompt}
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </button>
              </div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {currentPromptOutput?.prompt || 'Generate a prompt to see the output'}
              </div>
            </div>
            
            {/* Actions for Generated Prompt */}
            <div className="flex gap-2">
              <button 
                onClick={handleGenerateWithAI}
                disabled={isGenerating || !currentPromptOutput?.prompt || currentPromptOutput.missingFields.length > 0}
                className="btn-primary"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    AI Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Generate with AI
                  </>
                )}
              </button>
              
              <button 
                onClick={handleExport}
                className="btn-ghost"
                disabled={!currentPromptOutput?.prompt && !aiResponse}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Export
              </button>
            </div>
          </div>
        )}

        {outputSubTab === 'refined' && (
          <div className="space-y-4">
            {refinedContent ? (
              <>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-green-900">
                      Refined Content 
                      {lastRefinementTool && (
                        <span className="text-sm font-normal text-green-700 ml-2">
                          (via {lastRefinementTool})
                        </span>
                      )}
                    </h4>
                    <button 
                      onClick={handleCopyRefinedPrompt}
                      className="btn-secondary text-xs"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Refined
                    </button>
                  </div>
                  <div className="text-sm text-green-800 whitespace-pre-wrap">
                    {refinedContent}
                  </div>
                </div>
                
                {/* Actions for Refined Content */}
                <div className="flex gap-2">
                  <button 
                    onClick={handleGenerateWithRefinedPrompt}
                    disabled={isGenerating}
                    className="btn-primary"
                  >
                    {isGenerating ? 'Generating...' : 'Generate with AI'}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="mb-4">
                  <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <p>No refined content yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Use the refiner tools to create refined versions of your content
                </p>
              </div>
            )}
          </div>
        )}

        {outputSubTab === 'ai-response' && (
          <div className="space-y-4">
            {aiResponse ? (
              <>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blue-900">AI Response</h4>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(aiResponse);
                        showToast('AI response copied to clipboard!', 'success');
                      }}
                      className="btn-secondary text-xs"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy AI Response
                    </button>
                  </div>
                  <div className="text-sm text-blue-800 whitespace-pre-wrap">
                    {aiResponse}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="mb-4">
                  <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p>No AI response yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Generate a prompt and click "Generate with AI" to get an AI response
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Refiner Tools */}
      {(aiResponse || currentPromptOutput?.prompt) && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <RefinerTools 
            content={aiResponse || currentPromptOutput?.prompt || ''}
            onRefined={handleRefinedContent}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="card h-full">
      <div className="card-header">
        <h2 className="text-lg font-semibold text-gray-900">Playground</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowModelSettings(true)}
            className="btn-ghost p-2"
            title="AI Model Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          
          <button 
            onClick={handleGeneratePrompt}
            disabled={isGenerating || !selectedTemplate}
            className="btn-secondary"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Prompt
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setPreviewMode('template')}
          className={`px-4 py-2 text-sm font-medium ${
            previewMode === 'template' 
              ? 'border-b-2 border-primary-500 text-primary-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Template
        </button>
        <button
          onClick={() => setPreviewMode('preview')}
          className={`px-4 py-2 text-sm font-medium ${
            previewMode === 'preview' 
              ? 'border-b-2 border-primary-500 text-primary-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Preview
        </button>
        <button
          onClick={() => setPreviewMode('output')}
          className={`px-4 py-2 text-sm font-medium ${
            previewMode === 'output' 
              ? 'border-b-2 border-primary-500 text-primary-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Output
        </button>
      </div>

      {/* Content */}
      <div className="overflow-y-auto">
        {previewMode === 'template' && renderTemplateView()}
        {previewMode === 'preview' && renderPreviewView()}
        {previewMode === 'output' && renderOutputView()}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      )}

    {/* Model Settings Modal */}      {showModelSettings && (
        <ModelSettings 
          isOpen={showModelSettings}
          onClose={() => setShowModelSettings(false)}
          onSave={(config) => {
            setModelConfig(config);
            setShowModelSettings(false);
          }}
          initialConfig={modelConfig}
        />
      )}
    </div>
  );
};
