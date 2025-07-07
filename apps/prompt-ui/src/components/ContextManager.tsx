import React from 'react';
import { usePromptStore } from '../store/promptStore';

export const ContextManager: React.FC = () => {
  const { 
    selectedTemplate, 
    currentContext, 
    updateContextField, 
    clearContext 
  } = usePromptStore();

  if (!selectedTemplate) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Context Manager</h2>
        </div>
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>Select a template to manage context</p>
        </div>
      </div>
    );
  }

  const allFields = [...selectedTemplate.requiredFields, ...(selectedTemplate.optionalFields || [])];

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-lg font-semibold text-gray-900">Context Manager</h2>
        <button 
          onClick={clearContext}
          className="btn-ghost text-sm"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-4">
        {allFields.map(field => {
          const isRequired = selectedTemplate.requiredFields.includes(field);
          const value = currentContext[field] || '';
          
          return (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {field.includes('context') || field.includes('description') || field.includes('requirements') ? (
                <textarea
                  value={value}
                  onChange={(e) => updateContextField(field, e.target.value)}
                  placeholder={`Enter ${field.replace(/_/g, ' ')}...`}
                  className="textarea-primary h-24"
                />
              ) : (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => updateContextField(field, e.target.value)}
                  placeholder={`Enter ${field.replace(/_/g, ' ')}...`}
                  className="input-primary"
                />
              )}
              
              {isRequired && !value && (
                <p className="text-red-500 text-xs mt-1">This field is required</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Field Status */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {selectedTemplate.requiredFields.filter(field => currentContext[field]).length} of {selectedTemplate.requiredFields.length} required fields filled
          </span>
          <div className="flex gap-2">
            <span className="badge badge-success">
              {Object.keys(currentContext).filter(key => currentContext[key]).length} filled
            </span>
            <span className="badge badge-warning">
              {selectedTemplate.requiredFields.filter(field => !currentContext[field]).length} missing
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 flex gap-2">
        <button className="btn-secondary flex-1">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Save Context
        </button>
        <button className="btn-ghost">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
