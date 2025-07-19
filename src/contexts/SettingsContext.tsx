import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface LLMProvider {
  id: string;
  name: string;
  models: string[];
  requiresApiKey: boolean;
  apiKeyPlaceholder?: string;
}

export interface UserSettings {
  theme: 'dark' | 'light' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  language: string;
  apiKeys: Record<string, string>;
  defaultModel: string;
  defaultProvider: string;
  codeTheme: string;
  autoSave: boolean;
  notifications: boolean;
}

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;
  providers: LLMProvider[];
  getAvailableModels: (provider: string) => string[];
  hasApiKey: (provider: string) => boolean;
}

const defaultSettings: UserSettings = {
  theme: 'dark',
  fontSize: 'medium',
  language: 'en',
  apiKeys: {},
  defaultModel: 'gpt-4',
  defaultProvider: 'openai',
  codeTheme: 'vs-dark',
  autoSave: true,
  notifications: true
};

const providers: LLMProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    requiresApiKey: true,
    apiKeyPlaceholder: 'sk-...'
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    requiresApiKey: true,
    apiKeyPlaceholder: 'sk-ant-...'
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    models: ['mistral-large', 'mistral-medium', 'mistral-small'],
    requiresApiKey: true,
    apiKeyPlaceholder: 'api_key_...'
  },
  {
    id: 'local',
    name: 'Local Models',
    models: ['llama-2-7b', 'llama-2-13b', 'codellama-7b'],
    requiresApiKey: false
  }
];

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('chatPlatformSettings');
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
    return defaultSettings;
  });

  const updateSettings = (updates: Partial<UserSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    localStorage.setItem('chatPlatformSettings', JSON.stringify(newSettings));
  };

  const getAvailableModels = (provider: string): string[] => {
    const providerData = providers.find(p => p.id === provider);
    return providerData?.models || [];
  };

  const hasApiKey = (provider: string): boolean => {
    const providerData = providers.find(p => p.id === provider);
    if (!providerData?.requiresApiKey) return true;
    return Boolean(settings.apiKeys[provider]);
  };

  const value: SettingsContextType = {
    settings,
    updateSettings,
    providers,
    getAvailableModels,
    hasApiKey
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}