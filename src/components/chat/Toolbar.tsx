import React, { useState } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  PanelLeftOpen,
  PanelLeftClose,
  MessageSquare,
  Code,
  Terminal,
  BarChart3,
  Globe,
  Settings,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Conversation } from '../../contexts/ChatContext';

type PanelType = 'chat' | 'code' | 'output' | 'visualization' | 'iframe';

interface ToolbarProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  activePanels: PanelType[];
  onTogglePanel: (panel: PanelType) => void;
  currentConversation: Conversation | null;
}

function Toolbar({
  sidebarCollapsed,
  onToggleSidebar,
  activePanels,
  onTogglePanel,
  currentConversation
}: ToolbarProps) {
  const { state, dispatch } = useChat();
  const { settings, providers, updateSettings } = useSettings();
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const currentProvider = providers.find(p => p.id === state.selectedProvider);
  const availableModels = currentProvider?.models || [];

  const panelButtons = [
    { type: 'chat' as PanelType, icon: MessageSquare, label: 'Chat' },
    { type: 'code' as PanelType, icon: Code, label: 'Code' },
    { type: 'output' as PanelType, icon: Terminal, label: 'Output' },
    { type: 'visualization' as PanelType, icon: BarChart3, label: 'Visualization' },
    { type: 'iframe' as PanelType, icon: Globe, label: 'Web Content' }
  ];

  const handleModelChange = (provider: string, model: string) => {
    dispatch({ type: 'SET_PROVIDER', payload: provider });
    dispatch({ type: 'SET_MODEL', payload: model });
    updateSettings({ defaultProvider: provider, defaultModel: model });
    setShowModelSelector(false);
  };

  return (
    <div className="flex items-center justify-between px-4 py-3">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        {/* Sidebar Toggle */}
        <button
          onClick={onToggleSidebar}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          title={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
        >
          {sidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>

        {/* Conversation Title */}
        <div className="text-white font-medium">
          {currentConversation?.title || 'New Chat'}
        </div>
      </div>

      {/* Center Section - Panel Toggles */}
      <div className="flex items-center space-x-2">
        {panelButtons.map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            onClick={() => onTogglePanel(type)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activePanels.includes(type)
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            title={label}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden md:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* Model Selector */}
        <div className="relative">
          <button
            onClick={() => setShowModelSelector(!showModelSelector)}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
          >
            <span>{currentProvider?.name || 'Select Provider'}</span>
            <span className="text-gray-500">/</span>
            <span>{state.selectedModel}</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {showModelSelector && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50"
              >
                <div className="p-2">
                  {providers.map((provider) => (
                    <div key={provider.id} className="mb-2">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {provider.name}
                      </div>
                      {provider.models.map((model) => (
                        <button
                          key={`${provider.id}-${model}`}
                          onClick={() => handleModelChange(provider.id, model)}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            state.selectedProvider === provider.id && state.selectedModel === model
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          }`}
                        >
                          {model}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Settings */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="hidden md:inline text-sm">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
            </span>
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50"
              >
                <div className="p-2">
                  <div className="px-3 py-2 border-b border-gray-700">
                    <div className="text-sm font-medium text-white">
                      {user?.user_metadata?.full_name || 'User'}
                    </div>
                    <div className="text-xs text-gray-400">{user?.email}</div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setShowSettings(true);
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded transition-colors flex items-center space-x-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  
                  <button
                    onClick={signOut}
                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded transition-colors flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default Toolbar;