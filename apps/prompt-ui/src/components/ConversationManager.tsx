import React, { useState, useEffect, useRef } from 'react';
import { usePromptStore } from '../store/promptStore';
import { useToast } from './Toast';
import type { PromptTemplate, PromptContext } from '@promptverse/prompt-engine';
import { createOpenAIClientFromModelConfig } from '@promptverse/prompt-engine';

interface ConversationMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  template?: PromptTemplate;
  context?: PromptContext;
  timestamp: Date;
  tokens?: number;
  model?: string;
}

interface ConversationThread {
  id: string;
  title: string;
  messages: ConversationMessage[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

interface ConversationManagerProps {
  className?: string;
}

export const ConversationManager: React.FC<ConversationManagerProps> = ({ 
  className = '' 
}) => {
  const { selectedTemplate, modelConfig, isGenerating } = usePromptStore();
  const { showToast } = useToast();
  
  const [conversations, setConversations] = useState<ConversationThread[]>([]);
  const [activeConversation, setActiveConversation] = useState<ConversationThread | null>(null);
  const [followUpQuery, setFollowUpQuery] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages, streamingContent]);

  const loadConversations = () => {
    const stored = localStorage.getItem('promptverse-conversations');
    if (stored) {
      const parsed = JSON.parse(stored).map((conv: any) => ({
        ...conv,
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt),
        messages: conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
      setConversations(parsed);
      
      // Set most recent as active
      const activeConv = parsed.find((c: ConversationThread) => c.isActive) || parsed[0];
      if (activeConv) {
        setActiveConversation(activeConv);
      }
    }
  };

  const saveConversations = (convs: ConversationThread[]) => {
    localStorage.setItem('promptverse-conversations', JSON.stringify(convs));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createNewConversation = (initialMessage?: ConversationMessage) => {
    const newConv: ConversationThread = {
      id: `conv-${Date.now()}`,
      title: selectedTemplate?.name || 'New Conversation',
      messages: initialMessage ? [initialMessage] : [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    const updatedConvs = conversations.map(c => ({ ...c, isActive: false }));
    updatedConvs.unshift(newConv);
    
    setConversations(updatedConvs);
    setActiveConversation(newConv);
    saveConversations(updatedConvs);
    
    return newConv;
  };

  const addMessageToConversation = (message: ConversationMessage, conversationId?: string) => {
    const targetConvId = conversationId || activeConversation?.id;
    if (!targetConvId) return;

    const updatedConvs = conversations.map(conv => {
      if (conv.id === targetConvId) {
        const updatedConv = {
          ...conv,
          messages: [...conv.messages, message],
          updatedAt: new Date()
        };
        
        if (conv.id === activeConversation?.id) {
          setActiveConversation(updatedConv);
        }
        
        return updatedConv;
      }
      return conv;
    });

    setConversations(updatedConvs);
    saveConversations(updatedConvs);
  };
  const startStreamingResponse = async (prompt: string) => {
    if (!selectedTemplate || isGenerating) return;

    setIsStreaming(true);
    setStreamingContent('');
    
    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      // Create OpenAI client using centralized credentials with optional custom config
      const openAIClient = createOpenAIClientFromModelConfig(modelConfig);
      
      let content = '';
      
      // Use the centralized streaming completion method
      const result = await openAIClient.generateStreamingCompletion(prompt, {
        temperature: modelConfig.temperature || 0.7,
        maxTokens: modelConfig.maxTokens || 2000,
        signal: abortControllerRef.current.signal,
        onChunk: (chunk: string) => {
          content += chunk;
          setStreamingContent(content);
        }
      });

      // Add final message to conversation
      const assistantMessage: ConversationMessage = {
        id: `msg-${Date.now()}`,
        type: 'assistant',
        content: result.content,
        timestamp: new Date(),
        model: modelConfig.model,
        tokens: result.tokensUsed
      };

      addMessageToConversation(assistantMessage);
      showToast('Response received successfully!', 'success');

    } catch (error: any) {
      if (error.name === 'AbortError') {
        showToast('Response generation cancelled', 'info');
      } else {
        console.error('Streaming error:', error);
        showToast('Failed to get AI response', 'error');
      }
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
      abortControllerRef.current = null;
    }
  };

  const cancelStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleFollowUp = async () => {
    if (!followUpQuery.trim() || !activeConversation) return;

    // Add user message
    const userMessage: ConversationMessage = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: followUpQuery,
      timestamp: new Date()
    };

    addMessageToConversation(userMessage);

    // Build context from conversation history
    const conversationContext = activeConversation.messages
      .slice(-5) // Last 5 messages for context
      .map(msg => `${msg.type}: ${msg.content}`)
      .join('\n\n');

    const contextualPrompt = `Previous conversation:\n${conversationContext}\n\nUser follow-up: ${followUpQuery}`;

    setFollowUpQuery('');
    await startStreamingResponse(contextualPrompt);
  };

  const switchConversation = (conv: ConversationThread) => {
    const updatedConvs = conversations.map(c => ({
      ...c,
      isActive: c.id === conv.id
    }));
    
    setConversations(updatedConvs);
    setActiveConversation(conv);
    saveConversations(updatedConvs);
  };

  const deleteConversation = (convId: string) => {
    const updatedConvs = conversations.filter(c => c.id !== convId);
    setConversations(updatedConvs);
    saveConversations(updatedConvs);
    
    if (activeConversation?.id === convId) {
      setActiveConversation(updatedConvs[0] || null);
    }
    
    showToast('Conversation deleted', 'success');
  };

  const exportConversation = (conv: ConversationThread) => {
    const exportData = {
      title: conv.title,
      created: conv.createdAt.toISOString(),
      messages: conv.messages.map(msg => ({
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp.toISOString()
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${conv.title.replace(/\s+/g, '-')}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Conversation exported!', 'success');
  };

  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Conversations</h3>
          <p className="text-sm text-gray-600">
            Ongoing AI conversations with context preservation
          </p>
        </div>
        <button
          onClick={() => createNewConversation()}
          className="btn-primary"
          disabled={isGenerating || isStreaming}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>
      </div>

      <div className="flex h-96">
        {/* Conversation List */}
        <div className="w-1/3 border-r border-gray-200 pr-4">
          <div className="space-y-2 max-h-full overflow-y-auto">
            {conversations.map(conv => (
              <div
                key={conv.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  conv.isActive 
                    ? 'bg-primary-50 border border-primary-200' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => switchConversation(conv)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 truncate">
                      {conv.title}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {conv.messages.length} messages
                    </p>
                    <p className="text-xs text-gray-500">
                      {conv.updatedAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportConversation(conv);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Export conversation"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Delete conversation"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {conversations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="w-8 h-8 mx-auto mb-2 text-gray-300">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-sm">No conversations yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 pl-4 flex flex-col">
          {activeConversation ? (
            <>
              {/* Messages */}
              <div className="flex-1 space-y-3 overflow-y-auto mb-4">
                {activeConversation.messages.map(msg => (
                  <div 
                    key={msg.id}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-3/4 p-3 rounded-lg ${
                      msg.type === 'user' 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <div className="text-sm whitespace-pre-wrap">
                        {msg.content}
                      </div>
                      <div className={`text-xs mt-1 ${
                        msg.type === 'user' ? 'text-primary-100' : 'text-gray-500'
                      }`}>
                        {msg.timestamp.toLocaleTimeString()}
                        {msg.model && ` • ${msg.model}`}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Streaming message */}
                {isStreaming && streamingContent && (
                  <div className="flex justify-start">
                    <div className="max-w-3/4 p-3 rounded-lg bg-gray-100 text-gray-900">
                      <div className="text-sm whitespace-pre-wrap">
                        {streamingContent}
                        <span className="animate-pulse">|</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Streaming... 
                        <button 
                          onClick={cancelStreaming}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Follow-up input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={followUpQuery}
                  onChange={(e) => setFollowUpQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFollowUp()}
                  placeholder="Ask a follow-up question..."
                  className="flex-1 input-primary"
                  disabled={isStreaming}
                />
                <button
                  onClick={handleFollowUp}
                  disabled={!followUpQuery.trim() || isStreaming}
                  className="btn-primary"
                >
                  {isStreaming ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 text-gray-300">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p>Start a new conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
