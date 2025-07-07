import React, { useState } from 'react';
import { TemplateManager } from './TemplateManager';
import { PerformanceOptimizer } from './PerformanceOptimizer';
import { TemplateManagerProvider } from './TemplateManagerContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [showPerformanceSettings, setShowPerformanceSettings] = useState(false);
  const [openInCreateMode, setOpenInCreateMode] = useState(false);

  const openTemplateManager = () => {
    setOpenInCreateMode(false);
    setShowTemplateManager(true);
  };

  const openTemplateManagerForCreate = () => {
    setOpenInCreateMode(true);
    setShowTemplateManager(true);
  };

  const closeTemplateManager = () => {
    setShowTemplateManager(false);
    setOpenInCreateMode(false);
  };
  return (
    <TemplateManagerProvider
      openTemplateManager={openTemplateManager}
      openTemplateManagerForCreate={openTemplateManagerForCreate}
    >
      <div className="min-h-screen bg-gray-50">      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary-600">
                  PromptVerse
                </h1>
              </div>
              <div className="ml-4">
                <span className="text-sm text-gray-500">
                  AI-powered prompt generation
                </span>
              </div>
            </div>
              <div className="flex items-center space-x-4">              <button 
                onClick={openTemplateManager}
                className="btn-ghost"
                title="Manage Templates"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </button>
              
              <button 
                onClick={() => setShowPerformanceSettings(true)}
                className="btn-ghost"
                title="Performance Settings"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              
              <button className="btn-ghost">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>      {/* Main Content */}
      <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              © 2025 PromptVerse. Built with ❤️ for better AI interactions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
                Documentation
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
                GitHub
              </a>
            </div>          </div>
        </div>
      </footer>        {/* Template Manager Modal */}
      <TemplateManager
        isOpen={showTemplateManager}
        onClose={closeTemplateManager}
        openInCreateMode={openInCreateMode}
      />
      
      {/* Performance Settings Modal */}
      <PerformanceOptimizer
        isOpen={showPerformanceSettings}
        onClose={() => setShowPerformanceSettings(false)}
      />
    </div>
    </TemplateManagerProvider>
  );
};
