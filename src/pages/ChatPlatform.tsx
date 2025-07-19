import React, { useState, useEffect } from 'react';
import { PanelResizeHandle, Panel, PanelGroup } from 'react-resizable-panels';
import { useParams } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/chat/Sidebar';
import ChatArea from '../components/chat/ChatArea';
import CodeEditor from '../components/ide/CodeEditor';
import OutputPanel from '../components/ide/OutputPanel';
import Toolbar from '../components/chat/Toolbar';
import VisualizationPanel from '../components/ide/VisualizationPanel';
import { PanelLeftOpen, PanelLeftClose, Code, BarChart3, Terminal, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

type PanelType = 'chat' | 'code' | 'output' | 'visualization' | 'iframe';

function ChatPlatform() {
  const { conversationId } = useParams();
  const { state, dispatch, getCurrentConversation } = useChat();
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activePanels, setActivePanels] = useState<PanelType[]>(['chat', 'code']);
  const [codeContent, setCodeContent] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [executionResults, setExecutionResults] = useState<any[]>([]);

  useEffect(() => {
    if (conversationId && state.currentConversationId !== conversationId) {
      dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: conversationId });
    }
  }, [conversationId, state.currentConversationId, dispatch]);

  const currentConversation = getCurrentConversation();

  const togglePanel = (panel: PanelType) => {
    setActivePanels(prev => {
      if (prev.includes(panel)) {
        return prev.filter(p => p !== panel);
      } else {
        return [...prev, panel];
      }
    });
  };

  const executeCode = async () => {
    if (!codeContent.trim()) return;

    const result = {
      id: crypto.randomUUID(),
      language: selectedLanguage,
      code: codeContent,
      output: '',
      error: null,
      timestamp: new Date()
    };

    try {
      // Mock code execution for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (selectedLanguage === 'python') {
        if (codeContent.includes('print(')) {
          const printMatch = codeContent.match(/print\(["'`]([^"'`]+)["'`]\)/);
          result.output = printMatch ? printMatch[1] : 'Hello, World!';
        } else {
          result.output = 'Code executed successfully';
        }
      } else if (selectedLanguage === 'javascript') {
        result.output = 'JavaScript code executed';
      }
    } catch (error) {
      result.error = 'Execution failed: ' + (error as Error).message;
    }

    setExecutionResults(prev => [result, ...prev]);
    
    // Show output panel if not visible
    if (!activePanels.includes('output')) {
      setActivePanels(prev => [...prev, 'output']);
    }
  };

  const renderMainContent = () => {
    const panelCount = activePanels.length;
    
    if (panelCount === 1) {
      return (
        <div className="h-full">
          {renderPanel(activePanels[0])}
        </div>
      );
    }

    if (panelCount === 2) {
      return (
        <PanelGroup direction="horizontal" className="h-full">
          <Panel defaultSize={50} minSize={30}>
            {renderPanel(activePanels[0])}
          </Panel>
          <PanelResizeHandle className="w-2 bg-gray-800 hover:bg-gray-700 transition-colors" />
          <Panel defaultSize={50} minSize={30}>
            {renderPanel(activePanels[1])}
          </Panel>
        </PanelGroup>
      );
    }

    // 3+ panels - use grid layout
    return (
      <PanelGroup direction="horizontal" className="h-full">
        <Panel defaultSize={40} minSize={30}>
          {renderPanel(activePanels[0])}
        </Panel>
        <PanelResizeHandle className="w-2 bg-gray-800 hover:bg-gray-700 transition-colors" />
        <Panel defaultSize={60} minSize={30}>
          <PanelGroup direction="vertical">
            <Panel defaultSize={50} minSize={30}>
              {renderPanel(activePanels[1])}
            </Panel>
            <PanelResizeHandle className="h-2 bg-gray-800 hover:bg-gray-700 transition-colors" />
            <Panel defaultSize={50} minSize={30}>
              {activePanels[2] ? renderPanel(activePanels[2]) : <div className="h-full bg-gray-900" />}
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    );
  };

  const renderPanel = (panel: PanelType) => {
    switch (panel) {
      case 'chat':
        return (
          <div className="h-full bg-gray-900 border border-gray-800 rounded-lg">
            <ChatArea conversation={currentConversation} />
          </div>
        );
      case 'code':
        return (
          <div className="h-full bg-gray-900 border border-gray-800 rounded-lg">
            <CodeEditor
              value={codeContent}
              onChange={setCodeContent}
              language={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              onExecute={executeCode}
            />
          </div>
        );
      case 'output':
        return (
          <div className="h-full bg-gray-900 border border-gray-800 rounded-lg">
            <OutputPanel results={executionResults} />
          </div>
        );
      case 'visualization':
        return (
          <div className="h-full bg-gray-900 border border-gray-800 rounded-lg">
            <VisualizationPanel />
          </div>
        );
      case 'iframe':
        return (
          <div className="h-full bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="h-full bg-white rounded">
              <iframe
                src="https://plotly.com/javascript/"
                className="w-full h-full rounded"
                title="Web Content"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
        );
      default:
        return <div className="h-full bg-gray-900 border border-gray-800 rounded-lg" />;
    }
  };

  return (
    <div className="h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          width: sidebarCollapsed ? '0px' : '320px',
          opacity: sidebarCollapsed ? 0 : 1
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="relative border-r border-gray-800 overflow-hidden"
      >
        {!sidebarCollapsed && (
          <Sidebar
            conversations={state.conversations}
            currentConversationId={state.currentConversationId}
            onConversationSelect={(id) => dispatch({ type: 'SET_CURRENT_CONVERSATION', payload: id })}
            onNewConversation={() => {
              const conv = {
                id: crypto.randomUUID(),
                title: 'New Chat',
                messages: [],
                model: state.selectedModel,
                provider: state.selectedProvider,
                createdAt: new Date(),
                updatedAt: new Date()
              };
              dispatch({ type: 'ADD_CONVERSATION', payload: conv });
            }}
          />
        )}
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <Toolbar
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
            activePanels={activePanels}
            onTogglePanel={togglePanel}
            currentConversation={currentConversation}
          />
        </div>

        {/* Resizable Panels */}
        <div className="flex-1 p-4">
          {renderMainContent()}
        </div>
      </div>

      {/* Panel Toggle Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2">
        {[
          { type: 'code' as PanelType, icon: Code, label: 'Code Editor' },
          { type: 'output' as PanelType, icon: Terminal, label: 'Output' },
          { type: 'visualization' as PanelType, icon: BarChart3, label: 'Visualization' }
        ].map(({ type, icon: Icon, label }) => (
          <motion.button
            key={type}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => togglePanel(type)}
            className={`w-12 h-12 rounded-full shadow-lg border transition-all ${
              activePanels.includes(type)
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
            title={label}
          >
            <Icon className="w-5 h-5 mx-auto" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default ChatPlatform;