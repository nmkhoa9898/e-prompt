import { useEffect, useState } from 'react';
import { usePromptStore } from './store/promptStore';
import { sampleTemplates } from '@promptverse/templates';
import { 
  Layout, 
  TemplateLibrary, 
  Playground, 
  ContextManager, 
  PromptHistory, 
  SmartInput, 
  ConversationManager, 
  AdvancedExport, 
  PerformanceOptimizer 
} from './components';

type AppTab = 'workspace' | 'conversations' | 'export' | 'performance';

function App() {
  const { 
    setTemplates, 
    selectedTemplate, 
    currentContext, 
    currentPromptOutput, 
    aiResponse, 
    refinedContent, 
    lastRefinementTool, 
    modelConfig 
  } = usePromptStore();
  const [activeTab, setActiveTab] = useState<AppTab>('workspace');

  useEffect(() => {
    // Load sample templates on app initialization
    setTemplates(sampleTemplates);
  }, [setTemplates]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'workspace':
        return (
          <>
            {/* Smart Input - Prominent placement at the top */}
            <div className="mb-6">
              <SmartInput />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
              {/* Left Panel - Template Library */}
              <div className="lg:col-span-1">
                <TemplateLibrary />
              </div>

              {/* Middle Panel - Playground (wider) */}
              <div className="lg:col-span-2">
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
          </>
        );

      case 'conversations':
        return (
          <div className="w-full">
            <ConversationManager />
          </div>
        );

      case 'export':
        return (
          <div className="w-full">
            <AdvancedExport
              data={{
                template: selectedTemplate?.name || 'No Template Selected',
                context: currentContext,
                generatedPrompt: currentPromptOutput?.prompt || '',
                aiResponse: aiResponse,
                refinedContent: refinedContent,
                lastRefinementTool: lastRefinementTool,
                timestamp: new Date().toISOString(),
                modelConfig
              }}
            />
          </div>
        );

      case 'performance':
        return (
          <div className="w-full">
            <PerformanceOptimizer />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'workspace', label: 'Workspace', icon: '🏠' },
              { id: 'conversations', label: 'Conversations', icon: '💬' },
              { id: 'export', label: 'Export', icon: '📤' },
              { id: 'performance', label: 'Performance', icon: '⚡' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AppTab)}
                className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </Layout>
  );
}

export default App;
