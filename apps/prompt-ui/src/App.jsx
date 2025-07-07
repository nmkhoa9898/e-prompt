import React, { useEffect } from 'react';
import { usePromptStore } from './store/promptStore';
import { sampleTemplates } from '@promptverse/templates';
import { Layout } from './components/Layout';
import { TemplateLibrary } from './components/TemplateLibrary';
import { Playground } from './components/Playground';
import { ContextManager } from './components/ContextManager';
import { PromptHistory } from './components/PromptHistory';

function App() {
  const { setTemplates, selectedTemplate } = usePromptStore();

  useEffect(() => {
    // Load sample templates on app initialization
    setTemplates(sampleTemplates);
  }, [setTemplates]);

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Left Panel - Template Library */}
        <div className="lg:col-span-1">
          <TemplateLibrary />
        </div>

        {/* Middle Panel - Playground */}
        <div className="lg:col-span-1">
          {selectedTemplate ? (
            <Playground />
          ) : (
            <div className="card h-full flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Select a Template
                </h3>
                <p className="text-gray-600">
                  Choose a template from the library to start generating prompts
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Context Manager & History */}
        <div className="lg:col-span-1 space-y-6">
          <ContextManager />
          <PromptHistory />
        </div>
      </div>
    </Layout>
  );
}

export default App;
