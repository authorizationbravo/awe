import React, { useState } from 'react';
import { Terminal, Copy, Download, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import toast from 'react-hot-toast';

interface ExecutionResult {
  id: string;
  language: string;
  code: string;
  output?: string;
  error?: string | null;
  timestamp: Date;
}

interface OutputPanelProps {
  results: ExecutionResult[];
}

function OutputPanel({ results }: OutputPanelProps) {
  const [selectedResult, setSelectedResult] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'success' | 'error'>('all');

  const filteredResults = results.filter(result => {
    switch (filter) {
      case 'success':
        return !result.error;
      case 'error':
        return result.error;
      default:
        return true;
    }
  });

  const handleCopyOutput = (output: string) => {
    navigator.clipboard.writeText(output);
    toast.success('Output copied to clipboard');
  };

  const handleDownloadOutput = (result: ExecutionResult) => {
    const content = `// Execution Result - ${result.language}\n// Timestamp: ${result.timestamp.toISOString()}\n\n// Code:\n${result.code}\n\n// Output:\n${result.output || 'No output'}\n\n// Error:\n${result.error || 'No errors'}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `execution-${result.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Output downloaded');
  };

  const clearResults = () => {
    // In a real app, this would clear the results
    toast.success('Results cleared');
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes < 1) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else {
      return timestamp.toLocaleTimeString();
    }
  };

  if (results.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="border-b border-gray-800 p-3 bg-gray-900/50">
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-gray-400" />
            <h3 className="font-medium text-white">Output</h3>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Terminal className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">No Output Yet</h3>
            <p className="text-gray-500 text-sm">
              Run some code to see the execution results here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 p-3 bg-gray-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-gray-400" />
            <h3 className="font-medium text-white">Output</h3>
            <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
              {results.length} execution{results.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Filter Buttons */}
            <div className="flex space-x-1">
              {[
                { key: 'all', label: 'All', icon: null },
                { key: 'success', label: 'Success', icon: CheckCircle },
                { key: 'error', label: 'Errors', icon: AlertCircle }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
                    filter === key
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {Icon && <Icon className="w-3 h-3" />}
                  <span>{label}</span>
                </button>
              ))}
            </div>
            
            <div className="w-px h-4 bg-gray-700" />
            
            <button
              onClick={clearResults}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Clear all results"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {filteredResults.map((result, index) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="border-b border-gray-800 last:border-b-0"
            >
              <div className="p-4">
                {/* Result Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      result.error ? 'bg-red-500' : 'bg-green-500'
                    }`} />
                    <span className="text-sm font-medium text-white capitalize">
                      {result.language}
                    </span>
                    <div className="flex items-center space-x-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimestamp(result.timestamp)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleCopyOutput(result.output || result.error || '')}
                      className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                      title="Copy output"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDownloadOutput(result)}
                      className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                      title="Download result"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setSelectedResult(
                        selectedResult === result.id ? null : result.id
                      )}
                      className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                      title="Toggle details"
                    >
                      <Terminal className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Code Preview */}
                {selectedResult === result.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mb-3"
                  >
                    <div className="text-xs text-gray-400 mb-2">Code:</div>
                    <SyntaxHighlighter
                      language={result.language}
                      style={vscDarkPlus}
                      className="rounded-lg text-xs"
                      customStyle={{
                        margin: 0,
                        padding: '8px',
                        fontSize: '11px',
                        maxHeight: '150px',
                        overflow: 'auto'
                      }}
                    >
                      {result.code}
                    </SyntaxHighlighter>
                  </motion.div>
                )}

                {/* Output/Error Display */}
                <div>
                  {result.error ? (
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span className="text-sm font-medium text-red-400">Error</span>
                      </div>
                      <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                        <pre className="text-sm text-red-300 font-mono whitespace-pre-wrap">
                          {result.error}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-medium text-green-400">Output</span>
                      </div>
                      <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                        <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap">
                          {result.output || 'No output produced'}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default OutputPanel;