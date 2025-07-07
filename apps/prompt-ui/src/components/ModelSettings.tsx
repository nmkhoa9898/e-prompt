import React, { useState } from 'react';
import type { ModelConfig } from '@promptverse/prompt-engine';

interface ModelSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: ModelConfig) => void;
  initialConfig: ModelConfig;
}

export const ModelSettings: React.FC<ModelSettingsProps> = ({
  isOpen,
  onClose,
  onSave,
  initialConfig
}) => {
  const [config, setConfig] = useState<ModelConfig>(initialConfig);

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  const handleReset = () => {
    setConfig({
      provider: 'openai',
      model: 'GPT-4o',
      temperature: 0.7,
      maxTokens: 2000
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">AI Model Settings</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provider
            </label>
            <select
              value={config.provider}
              onChange={(e) => setConfig({ ...config, provider: e.target.value as any })}
              className="input-primary w-full"
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic" disabled>Anthropic (Coming Soon)</option>
              <option value="google" disabled>Google (Coming Soon)</option>
              <option value="local" disabled>Local (Coming Soon)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model
            </label>
            <select
              value={config.model}
              onChange={(e) => setConfig({ ...config, model: e.target.value })}
              className="input-primary w-full"
              disabled={config.provider !== 'openai'}
            >
              <option value="GPT-4o">GPT-4o</option>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temperature: {config.temperature}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={config.temperature || 0.7}
              onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>More Focused</span>
              <span>More Creative</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Tokens
            </label>
            <input
              type="number"
              min="100"
              max="4000"
              step="100"
              value={config.maxTokens || 2000}
              onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) })}
              className="input-primary w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum length of the AI response
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={handleReset} className="btn-ghost flex-1">
            Reset to Default
          </button>
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary flex-1">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
