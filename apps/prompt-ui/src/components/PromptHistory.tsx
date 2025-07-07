import React, { useState } from 'react';
import { usePromptStore } from '../store/promptStore';
import { formatDistanceToNow } from 'date-fns';

export const PromptHistory: React.FC = () => {
  const { 
    promptHistory, 
    clearHistory,
    setSelectedTemplate,
    setCurrentContext,
    getTemplateById
  } = usePromptStore();

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleReuse = (item: any) => {
    const template = getTemplateById(item.templateId);
    if (template) {
      setSelectedTemplate(template);
      setCurrentContext(item.context);
    }
  };

  const formatDate = (date: Date) => {
    try {
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-lg font-semibold text-gray-900">Prompt History</h2>
        <div className="flex gap-2">
          <span className="badge badge-secondary">
            {promptHistory.length}
          </span>
          {promptHistory.length > 0 && (
            <button 
              onClick={clearHistory}
              className="btn-ghost text-xs"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3 overflow-y-auto max-h-96">
        {promptHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No prompt history yet</p>
            <p className="text-sm">Generated prompts will appear here</p>
          </div>
        ) : (
          promptHistory.map((item) => {
            const template = getTemplateById(item.templateId);
            const isExpanded = expandedItems.has(item.id);
            
            return (
              <div 
                key={item.id} 
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {template?.name || 'Unknown Template'}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-2">
                    <button
                      onClick={() => toggleExpanded(item.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg 
                        className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleReuse(item)}
                      className="text-primary-600 hover:text-primary-700"
                      title="Reuse this prompt"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Template and Role badges */}
                <div className="flex gap-2 mb-3">
                  <span className="badge badge-primary text-xs">
                    {template?.role || 'Unknown'}
                  </span>
                  <span className="badge badge-secondary text-xs">
                    {template?.useCase || 'Unknown'}
                  </span>
                </div>

                {/* Prompt Preview */}
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <div className={`text-gray-700 ${isExpanded ? '' : 'line-clamp-3'}`}>
                    {item.output.prompt || 'No prompt generated'}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-3 space-y-3">
                    {/* Context Used */}
                    {item.output.contextUsed.length > 0 && (
                      <div>
                        <h5 className="text-xs font-medium text-gray-900 mb-2">Context Used</h5>
                        <div className="space-y-1">
                          {item.output.contextUsed.map(field => (
                            <div key={field} className="flex items-start gap-2">
                              <span className="text-xs text-gray-600 min-w-0 flex-1">
                                <span className="font-medium">{field}:</span> {item.context[field]}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing Fields */}
                    {item.output.missingFields.length > 0 && (
                      <div>
                        <h5 className="text-xs font-medium text-gray-900 mb-2">Missing Fields</h5>
                        <div className="flex flex-wrap gap-1">
                          {item.output.missingFields.map(field => (
                            <span key={field} className="badge badge-warning text-xs">
                              {field}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-gray-200">
                      <button 
                        onClick={() => navigator.clipboard.writeText(item.output.prompt)}
                        className="btn-ghost text-xs"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </button>
                      <button className="btn-ghost text-xs">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Export
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
