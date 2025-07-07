import React, { useState, useEffect } from 'react';
import { usePromptStore } from '../store/promptStore';
import { useToast } from './Toast';
import type { PromptTemplate } from '@promptverse/prompt-engine';

interface TemplateVersion {
  id: string;
  version: string;
  template: PromptTemplate;
  changelog: string;
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
}

interface TemplateVersionManagerProps {
  template: PromptTemplate;
  onVersionSelect: (version: TemplateVersion) => void;
  className?: string;
}

export const TemplateVersionManager: React.FC<TemplateVersionManagerProps> = ({
  template,
  onVersionSelect,
  className = ''
}) => {
  const [versions, setVersions] = useState<TemplateVersion[]>([]);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [newVersionData, setNewVersionData] = useState({
    version: '',
    changelog: '',
    createdBy: 'User'
  });
  const { showToast } = useToast();

  useEffect(() => {
    loadVersionHistory();
  }, [template.id]);

  const loadVersionHistory = () => {
    // Load from localStorage for now - in real app would be from backend
    const storedVersions = localStorage.getItem(`template-versions-${template.id}`);
    if (storedVersions) {
      const parsedVersions = JSON.parse(storedVersions).map((v: any) => ({
        ...v,
        createdAt: new Date(v.createdAt),
        template: {
          ...v.template,
          createdAt: new Date(v.template.createdAt),
          updatedAt: new Date(v.template.updatedAt)
        }
      }));
      setVersions(parsedVersions);
    } else {
      // Create initial version
      const initialVersion: TemplateVersion = {
        id: `${template.id}-v1.0.0`,
        version: '1.0.0',
        template: { ...template },
        changelog: 'Initial version',
        createdBy: 'System',
        createdAt: template.createdAt,
        isActive: true
      };
      setVersions([initialVersion]);
      saveVersionHistory([initialVersion]);
    }
  };

  const saveVersionHistory = (versionHistory: TemplateVersion[]) => {
    localStorage.setItem(`template-versions-${template.id}`, JSON.stringify(versionHistory));
  };

  const generateNextVersion = (currentVersions: TemplateVersion[]) => {
    if (currentVersions.length === 0) return '1.0.0';
    
    const latestVersion = currentVersions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    
    const [major, minor, patch] = latestVersion.version.split('.').map(Number);
    return `${major}.${minor}.${patch + 1}`;
  };

  const createNewVersion = () => {
    if (!newVersionData.changelog.trim()) {
      showToast('Please provide a changelog for the new version', 'error');
      return;
    }

    const newVersion: TemplateVersion = {
      id: `${template.id}-v${newVersionData.version || generateNextVersion(versions)}`,
      version: newVersionData.version || generateNextVersion(versions),
      template: { ...template, updatedAt: new Date() },
      changelog: newVersionData.changelog,
      createdBy: newVersionData.createdBy,
      createdAt: new Date(),
      isActive: true
    };

    // Mark all other versions as inactive
    const updatedVersions = versions.map(v => ({ ...v, isActive: false }));
    const newVersionHistory = [newVersion, ...updatedVersions];
    
    setVersions(newVersionHistory);
    saveVersionHistory(newVersionHistory);
    
    setIsCreatingVersion(false);
    setNewVersionData({ version: '', changelog: '', createdBy: 'User' });
    showToast(`Version ${newVersion.version} created successfully!`, 'success');
  };

  const restoreVersion = (version: TemplateVersion) => {
    // Mark as active version
    const updatedVersions = versions.map(v => ({
      ...v,
      isActive: v.id === version.id
    }));
    
    setVersions(updatedVersions);
    saveVersionHistory(updatedVersions);
    onVersionSelect(version);
    showToast(`Restored to version ${version.version}`, 'success');
  };

  const deleteVersion = (versionId: string) => {
    if (versions.length <= 1) {
      showToast('Cannot delete the only remaining version', 'error');
      return;
    }

    const versionToDelete = versions.find(v => v.id === versionId);
    if (versionToDelete?.isActive) {
      showToast('Cannot delete the active version', 'error');
      return;
    }

    const updatedVersions = versions.filter(v => v.id !== versionId);
    setVersions(updatedVersions);
    saveVersionHistory(updatedVersions);
    showToast('Version deleted successfully', 'success');
  };

  const compareVersions = (v1: TemplateVersion, v2: TemplateVersion) => {
    // Simple diff highlighting - in real app would use proper diff library
    const changes = [];
    
    if (v1.template.name !== v2.template.name) {
      changes.push(`Name: "${v1.template.name}" → "${v2.template.name}"`);
    }
    if (v1.template.description !== v2.template.description) {
      changes.push('Description changed');
    }
    if (v1.template.template !== v2.template.template) {
      changes.push('Template content changed');
    }
    if (JSON.stringify(v1.template.requiredFields) !== JSON.stringify(v2.template.requiredFields)) {
      changes.push('Required fields changed');
    }
    
    return changes;
  };

  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Version History</h3>
          <p className="text-sm text-gray-600">
            Manage template versions and track changes
          </p>
        </div>
        <button
          onClick={() => setIsCreatingVersion(true)}
          className="btn-primary"
          disabled={isCreatingVersion}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Version
        </button>
      </div>

      {/* Create new version form */}
      {isCreatingVersion && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-3">Create New Version</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Version Number (optional)
              </label>
              <input
                type="text"
                value={newVersionData.version}
                onChange={(e) => setNewVersionData({ ...newVersionData, version: e.target.value })}
                placeholder={`Auto: ${generateNextVersion(versions)}`}
                className="input-primary w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Changelog <span className="text-red-500">*</span>
              </label>
              <textarea
                value={newVersionData.changelog}
                onChange={(e) => setNewVersionData({ ...newVersionData, changelog: e.target.value })}
                placeholder="Describe what changed in this version..."
                className="textarea-primary h-20"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Created By
              </label>
              <input
                type="text"
                value={newVersionData.createdBy}
                onChange={(e) => setNewVersionData({ ...newVersionData, createdBy: e.target.value })}
                className="input-primary w-full"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={createNewVersion} className="btn-primary">
                Create Version
              </button>
              <button 
                onClick={() => setIsCreatingVersion(false)} 
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version list */}
      <div className="space-y-3">
        {versions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="w-12 h-12 mx-auto mb-3 text-gray-300">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p>No version history available</p>
          </div>
        ) : (
          versions.map((version, index) => {
            const previousVersion = versions[index + 1];
            const changes = previousVersion ? compareVersions(previousVersion, version) : [];
            
            return (
              <div 
                key={version.id}
                className={`p-4 border rounded-lg transition-colors ${
                  version.isActive 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">
                        Version {version.version}
                      </span>
                      {version.isActive && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                          Active
                        </span>
                      )}
                      <span className="text-sm text-gray-500">
                        by {version.createdBy}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {version.changelog}
                    </p>
                    
                    {changes.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-gray-700 mb-1">Changes:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {changes.map((change, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-yellow-500 mt-0.5">•</span>
                              {change}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      Created {version.createdAt.toLocaleDateString()} at {version.createdAt.toLocaleTimeString()}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    {!version.isActive && (
                      <button
                        onClick={() => restoreVersion(version)}
                        className="btn-secondary text-xs"
                        title="Restore this version"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Restore
                      </button>
                    )}
                    
                    {!version.isActive && versions.length > 1 && (
                      <button
                        onClick={() => deleteVersion(version.id)}
                        className="btn-danger text-xs"
                        title="Delete this version"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
