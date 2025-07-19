import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Copy, Download, Upload, Settings, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  onLanguageChange: (language: string) => void;
  onExecute: () => void;
}

const SUPPORTED_LANGUAGES = [
  { id: 'python', name: 'Python', extension: '.py' },
  { id: 'javascript', name: 'JavaScript', extension: '.js' },
  { id: 'typescript', name: 'TypeScript', extension: '.ts' },
  { id: 'html', name: 'HTML', extension: '.html' },
  { id: 'css', name: 'CSS', extension: '.css' },
  { id: 'json', name: 'JSON', extension: '.json' },
  { id: 'markdown', name: 'Markdown', extension: '.md' },
  { id: 'sql', name: 'SQL', extension: '.sql' }
];

const CODE_EXAMPLES = {
  python: `# Python Example - Data Analysis
import pandas as pd
import matplotlib.pyplot as plt

# Create sample data
data = {
    'name': ['Alice', 'Bob', 'Charlie', 'Diana'],
    'age': [25, 30, 35, 28],
    'score': [85, 92, 78, 95]
}

df = pd.DataFrame(data)
print("Data Overview:")
print(df.head())
print(f"\nAverage score: {df['score'].mean():.2f}")

# Create a simple plot
plt.figure(figsize=(8, 6))
plt.bar(df['name'], df['score'])
plt.title('Scores by Person')
plt.ylabel('Score')
plt.show()`,
  
  javascript: `// JavaScript Example - Web API Integration
const fetchUserData = async (userId) => {
  try {
    const response = await fetch(\`https://jsonplaceholder.typicode.com/users/\${userId}\`);
    const user = await response.json();
    
    console.log('User Data:', user);
    
    // Process user data
    const userInfo = {
      name: user.name,
      email: user.email,
      city: user.address.city,
      company: user.company.name
    };
    
    return userInfo;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

// Example usage
fetchUserData(1).then(user => {
  if (user) {
    console.log(\`Hello \${user.name} from \${user.city}!\`);
  }
});`,
  
  typescript: `// TypeScript Example - Type-safe API Client
interface User {
  id: number;
  name: string;
  email: string;
  address: {
    city: string;
    zipcode: string;
  };
}

interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
}

class UserService {
  private baseUrl = 'https://jsonplaceholder.typicode.com';
  
  async getUser(id: number): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(\`\${this.baseUrl}/users/\${id}\`);
      const user: User = await response.json();
      
      return {
        data: user,
        status: 'success'
      };
    } catch (error) {
      return {
        data: {} as User,
        status: 'error',
        message: 'Failed to fetch user'
      };
    }
  }
}

// Usage
const userService = new UserService();
userService.getUser(1).then(response => {
  if (response.status === 'success') {
    console.log('User:', response.data.name);
  }
});`
};

function CodeEditor({ value, onChange, language, onLanguageChange, onExecute }: CodeEditorProps) {
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const currentLanguage = SUPPORTED_LANGUAGES.find(lang => lang.id === language) || SUPPORTED_LANGUAGES[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(value);
    toast.success('Code copied to clipboard');
  };

  const handleDownloadCode = () => {
    const blob = new Blob([value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code${currentLanguage.extension}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Code downloaded');
  };

  const handleUploadCode = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onChange(content);
        toast.success('File uploaded successfully');
      };
      reader.readAsText(file);
    }
  };

  const handleLanguageSelect = (languageId: string) => {
    onLanguageChange(languageId);
    setShowLanguageDropdown(false);
  };

  const loadExample = (exampleLang: keyof typeof CODE_EXAMPLES) => {
    onChange(CODE_EXAMPLES[exampleLang]);
    onLanguageChange(exampleLang);
    setShowExamples(false);
    toast.success(`${exampleLang} example loaded`);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800 bg-gray-900/50">
        <div className="flex items-center space-x-3">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="flex items-center space-x-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
            >
              <span>{currentLanguage.name}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {showLanguageDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50"
                >
                  <div className="p-1">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => handleLanguageSelect(lang.id)}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          language === lang.id
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Examples Button */}
          <div className="relative">
            <button
              onClick={() => setShowExamples(!showExamples)}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
            >
              Examples
            </button>

            <AnimatePresence>
              {showExamples && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-1 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50"
                >
                  <div className="p-1">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Load Example
                    </div>
                    {Object.keys(CODE_EXAMPLES).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => loadExample(lang as keyof typeof CODE_EXAMPLES)}
                        className="w-full text-left px-3 py-2 rounded text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors capitalize"
                      >
                        {lang} Example
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyCode}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="Copy code"
          >
            <Copy className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleDownloadCode}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="Download code"
          >
            <Download className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleUploadCode}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="Upload file"
          >
            <Upload className="w-4 h-4" />
          </button>
          
          <div className="w-px h-6 bg-gray-700" />
          
          <button
            onClick={onExecute}
            disabled={!value.trim()}
            className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-all transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" />
            <span>Run</span>
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          value={value}
          onChange={(value) => onChange(value || '')}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: "'Fira Code', 'Courier New', monospace",
            lineNumbers: 'on',
            wordWrap: 'on',
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            folding: true,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 3,
            glyphMargin: false,
            renderWhitespace: 'selection',
            cursorBlinking: 'blink',
            cursorStyle: 'line',
            formatOnPaste: true,
            formatOnType: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            quickSuggestions: true,
            parameterHints: { enabled: true },
            hover: { enabled: true },
            contextmenu: true,
            mouseWheelZoom: true
          }}
        />
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".py,.js,.ts,.html,.css,.json,.md,.sql,.txt"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
}

export default CodeEditor;