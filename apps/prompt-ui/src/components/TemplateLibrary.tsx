import React, { useState } from 'react';
import { usePromptStore } from '../store/promptStore';
import { useTemplateManager } from './TemplateManagerContext';
import type { PromptTemplate } from '@promptverse/prompt-engine';

export const TemplateLibrary: React.FC = () => {
  const { 
    templates, 
    selectedTemplate, 
    setSelectedTemplate, 
    templateFilter, 
    setTemplateFilter,
    getFilteredTemplates 
  } = usePromptStore();
  const { openTemplateManagerForCreate } = useTemplateManager();

  const [searchTerm, setSearchTerm] = useState('');

  const filteredTemplates = getFilteredTemplates();

  const handleTemplateSelect = (template: PromptTemplate) => {
    setSelectedTemplate(template);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setTemplateFilter({ ...templateFilter, search: value });
  };

  const roles = [...new Set(templates.map(t => t.role))];
  const useCases = [...new Set(templates.map(t => t.useCase))];

  return (
    <div className="card h-full">
      <div className="card-header">
        <h2 className="text-lg font-semibold text-gray-900">Template Library</h2>
        <span className="badge badge-secondary">
          {filteredTemplates.length} templates
        </span>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        <div>
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="input-primary w-full"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={templateFilter.role || ''}
            onChange={(e) => setTemplateFilter({ ...templateFilter, role: e.target.value || undefined })}
            className="input-primary flex-1"
          >
            <option value="">All Roles</option>
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>

          <select
            value={templateFilter.useCase || ''}
            onChange={(e) => setTemplateFilter({ ...templateFilter, useCase: e.target.value || undefined })}
            className="input-primary flex-1"
          >
            <option value="">All Use Cases</option>
            {useCases.map(useCase => (
              <option key={useCase} value={useCase}>{useCase}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Template List */}
      <div className="space-y-3 overflow-y-auto max-h-96">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>No templates found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (          filteredTemplates.map(template => (
            <div
              key={template.id}
              data-testid="template-card"
              onClick={() => handleTemplateSelect(template)}
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                selectedTemplate?.id === template.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900 truncate">
                  {template.name}
                </h3>
                <div className="flex gap-1 ml-2">
                  <span className="badge badge-primary text-xs">
                    {template.role}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {template.description}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="badge badge-secondary text-xs">
                  {template.useCase}
                </span>
                <span className="text-xs text-gray-500">
                  {template.requiredFields.length} required fields
                </span>
              </div>
            </div>
          ))
        )}
      </div>      {/* Action Buttons */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex gap-2">
          <button 
            onClick={openTemplateManagerForCreate}
            className="btn-secondary flex-1"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Template
          </button>
          <button className="btn-ghost">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
