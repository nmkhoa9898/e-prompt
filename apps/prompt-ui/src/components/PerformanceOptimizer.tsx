import React, { useState, useEffect } from 'react';
import { useToast } from './Toast';

interface PerformanceMetrics {
  responseTime: number;
  tokensGenerated: number;
  requestsCount: number;
  cacheHitRate: number;
  averageResponseTime: number;
  totalTokensUsed: number;
  lastUpdated: Date;
}

interface CacheEntry {
  key: string;
  content: string;
  timestamp: Date;
  hits: number;
  size: number;
}

interface PerformanceOptimizerProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({ 
  className = '',
  isOpen = false,
  onClose
}) => {
  const { showToast } = useToast();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    responseTime: 0,
    tokensGenerated: 0,
    requestsCount: 0,
    cacheHitRate: 0,
    averageResponseTime: 0,
    totalTokensUsed: 0,
    lastUpdated: new Date()
  });
  
  const [cacheEntries, setCacheEntries] = useState<CacheEntry[]>([]);
  const [cacheEnabled, setCacheEnabled] = useState(true);
  const [maxCacheSize, setMaxCacheSize] = useState(50);
  const [preloadTemplates, setPreloadTemplates] = useState(true);
  const [streamingEnabled, setStreamingEnabled] = useState(true);
  const [compressionEnabled, setCompressionEnabled] = useState(true);

  useEffect(() => {
    loadMetrics();
    loadCacheEntries();
    loadSettings();
  }, []);

  const loadMetrics = () => {
    const stored = localStorage.getItem('promptverse-metrics');
    if (stored) {
      const parsed = JSON.parse(stored);
      setMetrics({
        ...parsed,
        lastUpdated: new Date(parsed.lastUpdated)
      });
    }
  };

  const saveMetrics = (newMetrics: PerformanceMetrics) => {
    localStorage.setItem('promptverse-metrics', JSON.stringify(newMetrics));
    setMetrics(newMetrics);
  };

  const loadCacheEntries = () => {
    const stored = localStorage.getItem('promptverse-cache');
    if (stored) {
      const parsed = JSON.parse(stored).map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }));
      setCacheEntries(parsed);
    }
  };

  const saveCacheEntries = (entries: CacheEntry[]) => {
    localStorage.setItem('promptverse-cache', JSON.stringify(entries));
    setCacheEntries(entries);
  };

  const loadSettings = () => {
    const settings = localStorage.getItem('promptverse-performance-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setCacheEnabled(parsed.cacheEnabled ?? true);
      setMaxCacheSize(parsed.maxCacheSize ?? 50);
      setPreloadTemplates(parsed.preloadTemplates ?? true);
      setStreamingEnabled(parsed.streamingEnabled ?? true);
      setCompressionEnabled(parsed.compressionEnabled ?? true);
    }
  };

  const saveSettings = () => {
    const settings = {
      cacheEnabled,
      maxCacheSize,
      preloadTemplates,
      streamingEnabled,
      compressionEnabled
    };
    localStorage.setItem('promptverse-performance-settings', JSON.stringify(settings));
    showToast('Performance settings saved!', 'success');
  };

  const clearCache = () => {
    localStorage.removeItem('promptverse-cache');
    setCacheEntries([]);
    showToast('Cache cleared successfully!', 'success');
  };

  const clearMetrics = () => {
    const resetMetrics: PerformanceMetrics = {
      responseTime: 0,
      tokensGenerated: 0,
      requestsCount: 0,
      cacheHitRate: 0,
      averageResponseTime: 0,
      totalTokensUsed: 0,
      lastUpdated: new Date()
    };
    saveMetrics(resetMetrics);
    showToast('Metrics reset successfully!', 'success');
  };

  const updateMetrics = (responseTime: number, tokens: number, cacheHit: boolean = false) => {
    const newMetrics: PerformanceMetrics = {
      ...metrics,
      responseTime,
      tokensGenerated: tokens,
      requestsCount: metrics.requestsCount + 1,
      totalTokensUsed: metrics.totalTokensUsed + tokens,
      averageResponseTime: ((metrics.averageResponseTime * metrics.requestsCount) + responseTime) / (metrics.requestsCount + 1),
      cacheHitRate: cacheHit 
        ? ((metrics.cacheHitRate * metrics.requestsCount) + 1) / (metrics.requestsCount + 1)
        : (metrics.cacheHitRate * metrics.requestsCount) / (metrics.requestsCount + 1),
      lastUpdated: new Date()
    };
    saveMetrics(newMetrics);
  };

  const optimizeCache = () => {
    const threshold = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days
    const optimized = cacheEntries.filter(entry => 
      entry.hits > 1 || entry.timestamp.getTime() > threshold
    );
    
    saveCacheEntries(optimized);
    showToast(`Cache optimized! Removed ${cacheEntries.length - optimized.length} entries.`, 'success');
  };

  const getTotalCacheSize = () => {
    return cacheEntries.reduce((total, entry) => total + entry.size, 0);
  };

  const formatBytes = (bytes: number) => {
    const kb = bytes / 1024;
    return kb > 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb.toFixed(2)} KB`;
  };

  const formatTime = (ms: number) => {
    return ms > 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms.toFixed(0)}ms`;
  };

  // Only return null if it's being used as a modal and not open
  if (onClose && !isOpen) return null;

  const content = (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Performance Metrics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-600 font-medium">Avg Response Time</div>
            <div className="text-lg font-bold text-blue-900">
              {formatTime(metrics.averageResponseTime)}
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="text-sm text-green-600 font-medium">Cache Hit Rate</div>
            <div className="text-lg font-bold text-green-900">
              {(metrics.cacheHitRate * 100).toFixed(1)}%
            </div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
            <div className="text-sm text-purple-600 font-medium">Total Requests</div>
            <div className="text-lg font-bold text-purple-900">
              {metrics.requestsCount.toLocaleString()}
            </div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
            <div className="text-sm text-orange-600 font-medium">Tokens Used</div>
            <div className="text-lg font-bold text-orange-900">
              {metrics.totalTokensUsed.toLocaleString()}
            </div>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-500">
          Last updated: {metrics.lastUpdated.toLocaleString()}
        </div>
      </div>

      {/* Performance Settings */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Performance Settings</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-sm">Response Caching</div>
              <div className="text-xs text-gray-600">Cache AI responses to improve speed</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={cacheEnabled}
                onChange={(e) => setCacheEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-sm">Streaming Responses</div>
              <div className="text-xs text-gray-600">Stream AI responses for faster perceived performance</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={streamingEnabled}
                onChange={(e) => setStreamingEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-sm">Template Preloading</div>
              <div className="text-xs text-gray-600">Preload templates for faster switching</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preloadTemplates}
                onChange={(e) => setPreloadTemplates(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-sm">Data Compression</div>
              <div className="text-xs text-gray-600">Compress cached data to save space</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={compressionEnabled}
                onChange={(e) => setCompressionEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-sm">Max Cache Size</div>
              <span className="text-sm text-gray-600">{maxCacheSize} entries</span>
            </div>
            <input
              type="range"
              min="10"
              max="200"
              step="10"
              value={maxCacheSize}
              onChange={(e) => setMaxCacheSize(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="mt-4">
          <button onClick={saveSettings} className="btn-primary">
            Save Settings
          </button>
        </div>
      </div>

      {/* Cache Management */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Cache Management</h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-medium text-sm">Cache Status</div>
              <div className="text-xs text-gray-600">
                {cacheEntries.length} entries • {formatBytes(getTotalCacheSize())}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={optimizeCache} className="btn-secondary text-xs">
                Optimize
              </button>
              <button onClick={clearCache} className="btn-danger text-xs">
                Clear Cache
              </button>
            </div>
          </div>

          {cacheEntries.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {cacheEntries.slice(0, 10).map((entry, index) => (
                <div key={index} className="flex items-center justify-between text-xs bg-white p-2 rounded">
                  <div className="flex-1 truncate">
                    <div className="font-medium truncate">{entry.key}</div>
                    <div className="text-gray-500">
                      {entry.hits} hits • {formatBytes(entry.size)}
                    </div>
                  </div>
                  <div className="text-gray-500 ml-2">
                    {entry.timestamp.toLocaleDateString()}
                  </div>
                </div>
              ))}
              {cacheEntries.length > 10 && (
                <div className="text-xs text-gray-500 text-center">
                  ... and {cacheEntries.length - 10} more entries
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-200">
        <button onClick={clearMetrics} className="btn-secondary">
          Reset Metrics
        </button>
        <button 
          onClick={() => {
            // Simulate a performance test
            const start = Date.now();
            setTimeout(() => {
              updateMetrics(Date.now() - start, Math.floor(Math.random() * 500), Math.random() > 0.5);
              showToast('Performance test completed!', 'success');
            }, Math.random() * 2000 + 500);
          }}
          className="btn-primary"
        >
          Run Performance Test
        </button>
      </div>
    </div>
  );

  // Return modal version if onClose is provided, otherwise return content directly
  if (onClose) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Performance Optimizer</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className={`p-6 ${className}`}>
            {content}
          </div>
        </div>
      </div>
    );
  }

  // Return content directly for tab usage
  return (
    <div className={`${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Performance Optimizer</h2>
        <p className="text-gray-600">Monitor and optimize application performance</p>
      </div>
      {content}
    </div>
  );
};
