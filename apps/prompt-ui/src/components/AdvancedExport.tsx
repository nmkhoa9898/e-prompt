import React, { useState } from 'react';
import { usePromptStore } from '../store/promptStore';
import { useToast } from './Toast';
import jsPDF from 'jspdf';
import type { PromptTemplate, PromptContext } from '@promptverse/prompt-engine';

interface ExportData {
  template: string;
  context: PromptContext;
  generatedPrompt: string;
  aiResponse: string;
  refinedContent: string;
  lastRefinementTool: string;
  timestamp: string;
  modelConfig?: any;
}

interface AdvancedExportProps {
  data: ExportData;
  className?: string;
}

export const AdvancedExport: React.FC<AdvancedExportProps> = ({ 
  data, 
  className = '' 
}) => {
  const { showToast } = useToast();
  const [exportFormat, setExportFormat] = useState<'json' | 'pdf' | 'markdown' | 'docx'>('json');
  const [isExporting, setIsExporting] = useState(false);
  const [includeContext, setIncludeContext] = useState(true);
  const [includePrompt, setIncludePrompt] = useState(true);
  const [includeResponse, setIncludeResponse] = useState(true);
  const [includeRefinements, setIncludeRefinements] = useState(true);

  const generateFileName = (format: string) => {
    const timestamp = new Date().toISOString().slice(0, 10);
    const templateName = data.template.replace(/\s+/g, '-').toLowerCase();
    return `promptverse-${templateName}-${timestamp}.${format}`;
  };

  const exportAsJSON = () => {
    const exportData = {
      ...(includeContext && { context: data.context }),
      ...(includePrompt && { generatedPrompt: data.generatedPrompt }),
      ...(includeResponse && { aiResponse: data.aiResponse }),
      ...(includeRefinements && { 
        refinedContent: data.refinedContent,
        lastRefinementTool: data.lastRefinementTool 
      }),
      template: data.template,
      timestamp: data.timestamp,
      modelConfig: data.modelConfig
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    downloadBlob(blob, generateFileName('json'));
  };

  const exportAsPDF = async () => {
    try {
      const pdf = new jsPDF();
      let yPosition = 20;
      const pageHeight = pdf.internal.pageSize.height;
      const margin = 20;
      const maxWidth = pdf.internal.pageSize.width - (margin * 2);

      // Helper function to add text with word wrapping
      const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        
        const lines = pdf.splitTextToSize(text, maxWidth);
        
        // Check if we need a new page
        if (yPosition + (lines.length * fontSize * 0.5) > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        
        pdf.text(lines, margin, yPosition);
        yPosition += lines.length * fontSize * 0.5 + 5;
      };

      // Title
      addText('PromptVerse Export', 18, true);
      yPosition += 10;

      // Template info
      addText(`Template: ${data.template}`, 14, true);
      addText(`Generated: ${new Date(data.timestamp).toLocaleString()}`, 10);
      yPosition += 10;

      // Context
      if (includeContext && Object.keys(data.context).length > 0) {
        addText('Context:', 14, true);
        Object.entries(data.context).forEach(([key, value]) => {
          if (value) {
            addText(`${key}: ${value}`, 10);
          }
        });
        yPosition += 10;
      }

      // Generated Prompt
      if (includePrompt && data.generatedPrompt) {
        addText('Generated Prompt:', 14, true);
        addText(data.generatedPrompt, 10);
        yPosition += 10;
      }

      // AI Response
      if (includeResponse && data.aiResponse) {
        addText('AI Response:', 14, true);
        addText(data.aiResponse, 10);
        yPosition += 10;
      }

      // Refined Content
      if (includeRefinements && data.refinedContent) {
        addText(`Refined Content (${data.lastRefinementTool}):`, 14, true);
        addText(data.refinedContent, 10);
      }

      // Save the PDF
      pdf.save(generateFileName('pdf'));
      showToast('PDF exported successfully!', 'success');
    } catch (error) {
      console.error('PDF export error:', error);
      showToast('Failed to export PDF', 'error');
    }
  };

  const exportAsMarkdown = () => {
    let markdown = `# PromptVerse Export\n\n`;
    markdown += `**Template:** ${data.template}\n`;
    markdown += `**Generated:** ${new Date(data.timestamp).toLocaleString()}\n\n`;

    if (includeContext && Object.keys(data.context).length > 0) {
      markdown += `## Context\n\n`;
      Object.entries(data.context).forEach(([key, value]) => {
        if (value) {
          markdown += `- **${key}:** ${value}\n`;
        }
      });
      markdown += `\n`;
    }

    if (includePrompt && data.generatedPrompt) {
      markdown += `## Generated Prompt\n\n`;
      markdown += `\`\`\`\n${data.generatedPrompt}\n\`\`\`\n\n`;
    }

    if (includeResponse && data.aiResponse) {
      markdown += `## AI Response\n\n`;
      markdown += `${data.aiResponse}\n\n`;
    }

    if (includeRefinements && data.refinedContent) {
      markdown += `## Refined Content (${data.lastRefinementTool})\n\n`;
      markdown += `${data.refinedContent}\n\n`;
    }

    const blob = new Blob([markdown], { type: 'text/markdown' });
    downloadBlob(blob, generateFileName('md'));
  };

  const exportAsDocx = async () => {
    // Note: This is a simplified implementation
    // In a production app, you'd use a library like docx.js
    
    let content = `PromptVerse Export\n\n`;
    content += `Template: ${data.template}\n`;
    content += `Generated: ${new Date(data.timestamp).toLocaleString()}\n\n`;

    if (includeContext && Object.keys(data.context).length > 0) {
      content += `Context:\n`;
      Object.entries(data.context).forEach(([key, value]) => {
        if (value) {
          content += `${key}: ${value}\n`;
        }
      });
      content += `\n`;
    }

    if (includePrompt && data.generatedPrompt) {
      content += `Generated Prompt:\n${data.generatedPrompt}\n\n`;
    }

    if (includeResponse && data.aiResponse) {
      content += `AI Response:\n${data.aiResponse}\n\n`;
    }

    if (includeRefinements && data.refinedContent) {
      content += `Refined Content (${data.lastRefinementTool}):\n${data.refinedContent}\n\n`;
    }

    // Create a basic RTF file (can be opened by Word)
    const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}\\f0\\fs24 ${content.replace(/\n/g, '\\par ')}}`;
    
    const blob = new Blob([rtfContent], { type: 'application/rtf' });
    downloadBlob(blob, generateFileName('rtf'));
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    if (!data.generatedPrompt && !data.aiResponse) {
      showToast('No content to export', 'error');
      return;
    }

    setIsExporting(true);
    
    try {
      switch (exportFormat) {
        case 'json':
          exportAsJSON();
          break;
        case 'pdf':
          await exportAsPDF();
          break;
        case 'markdown':
          exportAsMarkdown();
          break;
        case 'docx':
          await exportAsDocx();
          break;
      }
      
      showToast(`Exported as ${exportFormat.toUpperCase()}!`, 'success');
    } catch (error) {
      console.error('Export error:', error);
      showToast('Export failed', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const previewContent = () => {
    switch (exportFormat) {
      case 'json':
        return JSON.stringify({
          template: data.template,
          ...(includeContext && { context: data.context }),
          ...(includePrompt && { generatedPrompt: data.generatedPrompt }),
          ...(includeResponse && { aiResponse: data.aiResponse })
        }, null, 2);
      
      case 'markdown':
        let md = `# PromptVerse Export\n\n**Template:** ${data.template}\n\n`;
        if (includePrompt) md += `## Generated Prompt\n\n${data.generatedPrompt}\n\n`;
        if (includeResponse) md += `## AI Response\n\n${data.aiResponse}\n\n`;
        return md;
      
      default:
        return 'Preview not available for this format';
    }
  };

  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Advanced Export</h3>
          <p className="text-sm text-gray-600">
            Export your content in multiple formats
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Export Format
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { value: 'json', label: 'JSON', icon: '{}' },
              { value: 'pdf', label: 'PDF', icon: '📄' },
              { value: 'markdown', label: 'Markdown', icon: '📝' },
              { value: 'docx', label: 'Word', icon: '📋' }
            ].map(format => (
              <button
                key={format.value}
                onClick={() => setExportFormat(format.value as any)}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  exportFormat === format.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="text-lg mb-1">{format.icon}</div>
                <div className="text-sm font-medium">{format.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Content Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Include in Export
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeContext}
                onChange={(e) => setIncludeContext(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Context Data</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includePrompt}
                onChange={(e) => setIncludePrompt(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Generated Prompt</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeResponse}
                onChange={(e) => setIncludeResponse(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">AI Response</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeRefinements}
                onChange={(e) => setIncludeRefinements(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Refined Content</span>
            </label>
          </div>
        </div>

        {/* Preview */}
        {(exportFormat === 'json' || exportFormat === 'markdown') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview
            </label>
            <div className="bg-gray-50 p-3 rounded-lg border max-h-40 overflow-y-auto">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                {previewContent()}
              </pre>
            </div>
          </div>
        )}

        {/* Export Button */}
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={isExporting || (!includeContext && !includePrompt && !includeResponse && !includeRefinements)}
            className="btn-primary flex-1"
          >
            {isExporting ? (
              <>
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export as {exportFormat.toUpperCase()}
              </>
            )}
          </button>
          
          <div className="text-xs text-gray-500 self-center">
            File: {generateFileName(exportFormat)}
          </div>
        </div>

        {/* Format Info */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-800">
            {exportFormat === 'json' && (
              <>📊 <strong>JSON:</strong> Structured data format, perfect for importing back into applications</>
            )}
            {exportFormat === 'pdf' && (
              <>📄 <strong>PDF:</strong> Professional document format with formatting preserved</>
            )}
            {exportFormat === 'markdown' && (
              <>📝 <strong>Markdown:</strong> Lightweight markup for documentation and wikis</>
            )}
            {exportFormat === 'docx' && (
              <>📋 <strong>Word:</strong> Rich text format compatible with Microsoft Word</>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
