import React, { useState, useEffect } from 'react';
import { usePromptStore } from '../store/promptStore';
import type { PromptTemplate } from '@promptverse/prompt-engine';

interface TemplateManagerProps {
  isOpen: boolean;
  onClose: () => void;
  openInCreateMode?: boolean;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  isOpen,
  onClose,
  openInCreateMode = false
}) => {
  const { templates, addTemplate, updateTemplate, deleteTemplate } = usePromptStore();
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(openInCreateMode);

  const emptyTemplate: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
    name: '',
    description: '',
    role: 'Developer',
    useCase: 'Code Review',
    template: '',
    requiredFields: [],
    optionalFields: []
  };

  const [formData, setFormData] = useState(emptyTemplate);

  // Handle opening in create mode
  useEffect(() => {
    if (isOpen && openInCreateMode) {
      handleCreate();
    }
  }, [isOpen, openInCreateMode]);

  const handleCreate = () => {
    setIsCreating(true);
    setEditingTemplate(null);
    setFormData(emptyTemplate);
  };

  const handleEdit = (template: PromptTemplate) => {
    setEditingTemplate(template);
    setIsCreating(false);
    setFormData({
      name: template.name,
      description: template.description,
      role: template.role,
      useCase: template.useCase,
      template: template.template,
      requiredFields: template.requiredFields,
      optionalFields: template.optionalFields || []
    });
  };

  const handleSave = () => {
    if (isCreating) {
      const newTemplate: PromptTemplate = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      addTemplate(newTemplate);
    } else if (editingTemplate) {
      updateTemplate(editingTemplate.id, formData);
    }
    
    handleCancel();
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingTemplate(null);
    setFormData(emptyTemplate);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteTemplate(id);
    }
  };

  const parseFields = (value: string): string[] => {
    return value.split(',').map(field => field.trim()).filter(field => field.length > 0);
  };

  const fieldsToString = (fields: string[]): string => {
    return fields.join(', ');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Template Manager</h3>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="btn-primary">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Template
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {(isCreating || editingTemplate) ? (
          <div className="space-y-4">
            <h4 className="text-lg font-medium">
              {isCreating ? 'Create New Template' : 'Edit Template'}
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-primary w-full"
                  placeholder="Template name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="input-primary w-full"
                >
                  <option value="Developer">Developer</option>
                  <option value="PM">Product Manager</option>
                  <option value="BA">Business Analyst</option>
                  <option value="QA">QA Engineer</option>
                  <option value="PO">Product Owner</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-primary w-full h-20"
                placeholder="Template description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Use Case
              </label>
              <input
                type="text"
                value={formData.useCase}
                onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
                className="input-primary w-full"
                placeholder="e.g., Code Review, Requirements Analysis"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Content
              </label>
              <textarea
                value={formData.template}
                onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                className="input-primary w-full h-32 font-mono"
                placeholder="Use {{fieldName}} for variables"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required Fields (comma-separated)
                </label>
                <input
                  type="text"
                  value={fieldsToString(formData.requiredFields)}
                  onChange={(e) => setFormData({ ...formData, requiredFields: parseFields(e.target.value) })}
                  className="input-primary w-full"
                  placeholder="field1, field2, field3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Optional Fields (comma-separated)
                </label>                <input
                  type="text"
                  value={fieldsToString(formData.optionalFields || [])}
                  onChange={(e) => setFormData({ ...formData, optionalFields: parseFields(e.target.value) })}
                  className="input-primary w-full"
                  placeholder="field1, field2, field3"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={handleCancel} className="btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={handleSave} className="btn-primary flex-1">
                {isCreating ? 'Create Template' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Existing Templates ({templates.length})</h4>
            
            <div className="space-y-2">
              {templates.map(template => (
                <div key={template.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-gray-900">{template.name}</h5>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        {template.role}
                      </span>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded">
                        {template.useCase}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                    <div className="text-xs text-gray-500">
                      Required: {template.requiredFields.join(', ') || 'None'} | 
                      Optional: {template.optionalFields?.join(', ') || 'None'}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(template)}
                      className="btn-ghost p-2"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="btn-ghost p-2 text-red-600 hover:bg-red-50"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              
              {templates.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No templates found. Create your first template to get started!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
