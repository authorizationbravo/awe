import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';
import { useChat } from '../contexts/ChatContext';
import { Code, ChevronRight, Sparkles, Database, BarChart, Key } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const { updateSettings, providers } = useSettings();
  const { createConversation } = useChat();
  const navigate = useNavigate();

  const steps = [
    {
      title: 'Welcome to AI Chat IDE',
      description: 'Your AI-powered development environment'
    },
    {
      title: 'Choose Your Template',
      description: 'Select a starting point for your project'
    },
    {
      title: 'Configure API Keys',
      description: 'Add your LLM provider credentials (optional)'
    },
    {
      title: 'Ready to Build!',
      description: 'Your workspace is ready'
    }
  ];

  const templates = [
    {
      id: 'general',
      title: 'General Chat',
      description: 'Open-ended conversations with AI assistants',
      icon: Sparkles,
      color: 'bg-blue-500'
    },
    {
      id: 'code',
      title: 'Code Development',
      description: 'Write, debug, and execute code with AI help',
      icon: Code,
      color: 'bg-green-500'
    },
    {
      id: 'data-analysis',
      title: 'Data Analysis',
      description: 'Analyze data and create visualizations',
      icon: BarChart,
      color: 'bg-purple-500'
    },
    {
      id: 'research',
      title: 'Research Assistant',
      description: 'Conduct research and gather insights',
      icon: Database,
      color: 'bg-orange-500'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    // Save settings
    updateSettings({ apiKeys });
    
    // Create initial conversation based on template
    if (selectedTemplate) {
      const template = templates.find(t => t.id === selectedTemplate);
      createConversation(`New ${template?.title || 'Chat'}`, selectedTemplate);
    }
    
    toast.success('Welcome to AI Chat IDE! 🎉');
    navigate('/chat');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Code className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Welcome to AI Chat IDE</h2>
            <p className="text-gray-400 text-lg mb-8">
              A powerful development environment that combines AI chat, code execution, 
              data visualization, and web integration in one seamless platform.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <Code className="w-6 h-6 text-blue-400 mb-2" />
                <div className="text-sm text-gray-300">Code Execution</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <BarChart className="w-6 h-6 text-purple-400 mb-2" />
                <div className="text-sm text-gray-300">Data Viz</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <Sparkles className="w-6 h-6 text-green-400 mb-2" />
                <div className="text-sm text-gray-300">Multi-LLM</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <Database className="w-6 h-6 text-orange-400 mb-2" />
                <div className="text-sm text-gray-300">Web Integration</div>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4 text-center">Choose Your Starting Template</h2>
            <p className="text-gray-400 text-center mb-8">
              Select a template that matches your intended use case
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <motion.div
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedTemplate === template.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className={`w-12 h-12 rounded-lg ${template.color} flex items-center justify-center mb-4`}>
                    <template.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{template.title}</h3>
                  <p className="text-gray-400 text-sm">{template.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4 text-center">Configure API Keys</h2>
            <p className="text-gray-400 text-center mb-8">
              Add your API keys to unlock the full potential of different LLM providers
            </p>
            <div className="space-y-6">
              {providers.filter(p => p.requiresApiKey).map((provider) => (
                <div key={provider.id} className="bg-gray-800/50 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Key className="w-5 h-5 text-gray-400 mr-2" />
                    <h3 className="text-lg font-semibold text-white">{provider.name}</h3>
                  </div>
                  <input
                    type="password"
                    placeholder={provider.apiKeyPlaceholder}
                    value={apiKeys[provider.id] || ''}
                    onChange={(e) => setApiKeys({ ...apiKeys, [provider.id]: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <p className="text-sm text-gray-400 mt-2">
                    Models: {provider.models.join(', ')}
                  </p>
                </div>
              ))}
              <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-300">
                  💡 <strong>Tip:</strong> You can skip this step and add API keys later in settings. 
                  The platform will work with demo responses until you add your keys.
                </p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">You're All Set!</h2>
            <p className="text-gray-400 text-lg mb-8">
              Your AI Chat IDE workspace is ready. Start building amazing projects with AI assistance!
            </p>
            <div className="bg-gray-800/50 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-white mb-2">What you can do:</h3>
              <ul className="text-left text-gray-300 space-y-2">
                <li>• Chat with multiple AI models</li>
                <li>• Execute Python, JavaScript, TypeScript</li>
                <li>• Create interactive data visualizations</li>
                <li>• Embed web content and iframes</li>
                <li>• Collaborate in real-time</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-purple-950 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex-1 h-2 rounded-full mx-1 ${
                  index <= currentStep ? 'bg-blue-500' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
          <div className="text-center">
            <p className="text-gray-400">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep].description}
            </p>
          </div>
        </div>

        {/* Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8 mb-8"
        >
          {renderStepContent()}
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-500 transition-colors"
          >
            Previous
          </button>
          
          <button
            onClick={handleNext}
            disabled={currentStep === 1 && !selectedTemplate}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-semibold flex items-center gap-2 transition-all disabled:cursor-not-allowed"
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default OnboardingPage;