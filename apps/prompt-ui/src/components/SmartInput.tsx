import React, { useState, useEffect } from 'react';
import { usePromptStore } from '../store/promptStore';
import type { PromptTemplate } from '@promptverse/prompt-engine';

interface SmartInputProps {
  onTemplateSelect?: (template: PromptTemplate) => void;
}

interface TemplateMatch {
  template: PromptTemplate;
  score: number;
  matchedTerms: string[];
}

export const SmartInput: React.FC<SmartInputProps> = ({ onTemplateSelect }) => {
  const { templates, setSelectedTemplate } = usePromptStore();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<TemplateMatch[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Keywords mapping for better matching
  const keywordMapping = {
    'user story': ['user story', 'story', 'requirement', 'feature'],
    'code review': ['code review', 'review', 'code', 'feedback'],
    'test case': ['test case', 'test', 'testing', 'qa'],
    'bug report': ['bug', 'issue', 'defect', 'error'],
    'project plan': ['project', 'plan', 'planning', 'roadmap'],
    'documentation': ['doc', 'documentation', 'guide', 'manual'],
    'api': ['api', 'endpoint', 'service', 'integration'],
    'database': ['database', 'db', 'sql', 'schema'],
    'ui': ['ui', 'interface', 'design', 'frontend'],
    'backend': ['backend', 'server', 'api', 'service']
  };

  const findBestMatches = (query: string): TemplateMatch[] => {
    if (!query.trim()) return [];
    
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);
    
    const matches: TemplateMatch[] = [];
    
    templates.forEach(template => {
      let score = 0;
      const matchedTerms: string[] = [];
      
      // Direct name matching (highest weight)
      if (template.name.toLowerCase().includes(queryLower)) {
        score += 10;
        matchedTerms.push('name');
      }
      
      // Use case matching (high weight)
      if (template.useCase.toLowerCase().includes(queryLower)) {
        score += 8;
        matchedTerms.push('use case');
      }
      
      // Description matching (medium weight)
      if (template.description.toLowerCase().includes(queryLower)) {
        score += 6;
        matchedTerms.push('description');
      }
      
      // Role matching (medium weight)
      if (template.role.toLowerCase().includes(queryLower)) {
        score += 5;
        matchedTerms.push('role');
      }
      
      // Word-by-word matching
      queryWords.forEach(word => {
        // Check template fields
        if (template.name.toLowerCase().includes(word)) {
          score += 3;
          if (!matchedTerms.includes('name')) matchedTerms.push('name');
        }
        if (template.description.toLowerCase().includes(word)) {
          score += 2;
          if (!matchedTerms.includes('description')) matchedTerms.push('description');
        }
        if (template.useCase.toLowerCase().includes(word)) {
          score += 2;
          if (!matchedTerms.includes('use case')) matchedTerms.push('use case');
        }
        if (template.role.toLowerCase().includes(word)) {
          score += 1;
          if (!matchedTerms.includes('role')) matchedTerms.push('role');
        }
        
        // Check template content
        if (template.template.toLowerCase().includes(word)) {
          score += 1;
          if (!matchedTerms.includes('template')) matchedTerms.push('template');
        }
      });
      
      // Keyword mapping bonus
      Object.entries(keywordMapping).forEach(([key, synonyms]) => {
        if (synonyms.some(synonym => queryLower.includes(synonym))) {
          if (template.name.toLowerCase().includes(key) || 
              template.description.toLowerCase().includes(key) ||
              template.useCase.toLowerCase().includes(key)) {
            score += 4;
            matchedTerms.push('keyword match');
          }
        }
      });
      
      if (score > 0) {
        matches.push({ template, score, matchedTerms });
      }
    });
    
    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    const matches = findBestMatches(value);
    setSuggestions(matches);
    setIsOpen(matches.length > 0);
    setSelectedIndex(-1);
  };

  const handleSelectTemplate = (template: PromptTemplate) => {
    setSelectedTemplate(template);
    onTemplateSelect?.(template);
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectTemplate(suggestions[selectedIndex].template);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };
  const handleClickOutside = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  useEffect(() => {
    const handleGlobalClick = () => {
      setIsOpen(false);
      setSelectedIndex(-1);
    };

    if (isOpen) {
      document.addEventListener('click', handleGlobalClick);
      return () => document.removeEventListener('click', handleGlobalClick);
    }
  }, [isOpen]);

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-gray-900">Smart Input</h3>
        <p className="text-sm text-gray-600">Describe what you want to create</p>
      </div>
      
      <div className="relative" onClick={e => e.stopPropagation()}>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query && setIsOpen(suggestions.length > 0)}
            placeholder="e.g., 'Create user stories for login feature' or 'Review my React code'"
            className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          />
          
          {/* Search icon */}
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        {/* Suggestions dropdown */}
        {isOpen && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-50 max-h-80 overflow-y-auto">
            {suggestions.map((match, index) => (
              <button
                key={match.template.id}
                onClick={() => handleSelectTemplate(match.template)}
                className={`w-full text-left p-3 border-b border-gray-100 last:border-b-0 transition-colors ${
                  index === selectedIndex 
                    ? 'bg-primary-50 border-primary-200' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {match.template.name}
                      </span>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        {match.template.role}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {match.template.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded">
                        {match.template.useCase}
                      </span>
                      {match.matchedTerms.length > 0 && (
                        <span className="text-xs text-gray-500">
                          Matched: {match.matchedTerms.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-3">
                    <div className="text-xs text-gray-500">
                      Score: {match.score}
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
        
        {/* No results message */}
        {isOpen && query && suggestions.length === 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-50 p-4">
            <div className="text-center text-gray-500">
              <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm">No matching templates found</p>
              <p className="text-xs text-gray-400">Try different keywords or create a custom template</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Quick suggestions */}
      {!query && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Try these examples:</p>
          <div className="flex flex-wrap gap-2">
            {[
              'Create user stories',
              'Review my code',
              'Write test cases',
              'Plan project',
              'Document API'
            ].map((example) => (
              <button
                key={example}
                onClick={() => handleQueryChange(example)}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
