import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    model?: string;
    tokens?: number;
    attachments?: string[];
    codeExecution?: {
      id: string;
      language: string;
      code: string;
      output?: string;
      error?: string;
    };
  };
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  provider: string;
  systemPrompt?: string;
  templateType?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  isLoading: boolean;
  selectedModel: string;
  selectedProvider: string;
  systemPrompt: string;
}

type ChatAction =
  | { type: 'SET_CONVERSATIONS'; payload: Conversation[] }
  | { type: 'ADD_CONVERSATION'; payload: Conversation }
  | { type: 'UPDATE_CONVERSATION'; payload: { id: string; updates: Partial<Conversation> } }
  | { type: 'DELETE_CONVERSATION'; payload: string }
  | { type: 'SET_CURRENT_CONVERSATION'; payload: string | null }
  | { type: 'ADD_MESSAGE'; payload: { conversationId: string; message: Message } }
  | { type: 'UPDATE_MESSAGE'; payload: { conversationId: string; messageId: string; updates: Partial<Message> } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_MODEL'; payload: string }
  | { type: 'SET_PROVIDER'; payload: string }
  | { type: 'SET_SYSTEM_PROMPT'; payload: string };

const initialState: ChatState = {
  conversations: [],
  currentConversationId: null,
  isLoading: false,
  selectedModel: 'gpt-4',
  selectedProvider: 'openai',
  systemPrompt: 'You are a helpful AI assistant with access to code execution and data visualization capabilities.'
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload };
      
    case 'ADD_CONVERSATION':
      return {
        ...state,
        conversations: [action.payload, ...state.conversations],
        currentConversationId: action.payload.id
      };
      
    case 'UPDATE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.id
            ? { ...conv, ...action.payload.updates, updatedAt: new Date() }
            : conv
        )
      };
      
    case 'DELETE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.filter(conv => conv.id !== action.payload),
        currentConversationId: state.currentConversationId === action.payload ? null : state.currentConversationId
      };
      
    case 'SET_CURRENT_CONVERSATION':
      return { ...state, currentConversationId: action.payload };
      
    case 'ADD_MESSAGE':
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.conversationId
            ? {
                ...conv,
                messages: [...conv.messages, action.payload.message],
                updatedAt: new Date()
              }
            : conv
        )
      };
      
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.conversationId
            ? {
                ...conv,
                messages: conv.messages.map(msg =>
                  msg.id === action.payload.messageId
                    ? { ...msg, ...action.payload.updates }
                    : msg
                )
              }
            : conv
        )
      };
      
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
      
    case 'SET_MODEL':
      return { ...state, selectedModel: action.payload };
      
    case 'SET_PROVIDER':
      return { ...state, selectedProvider: action.payload };
      
    case 'SET_SYSTEM_PROMPT':
      return { ...state, systemPrompt: action.payload };
      
    default:
      return state;
  }
}

interface ChatContextType {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
  createConversation: (title: string, templateType?: string) => Conversation;
  getCurrentConversation: () => Conversation | null;
  sendMessage: (content: string, attachments?: string[]) => Promise<void>;
  executeCode: (code: string, language: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const createConversation = (title: string, templateType?: string): Conversation => {
    const conversation: Conversation = {
      id: uuidv4(),
      title,
      messages: [],
      model: state.selectedModel,
      provider: state.selectedProvider,
      systemPrompt: state.systemPrompt,
      templateType,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    dispatch({ type: 'ADD_CONVERSATION', payload: conversation });
    return conversation;
  };

  const getCurrentConversation = (): Conversation | null => {
    if (!state.currentConversationId) return null;
    return state.conversations.find(conv => conv.id === state.currentConversationId) || null;
  };

  const sendMessage = async (content: string, attachments?: string[]) => {
    const currentConv = getCurrentConversation();
    if (!currentConv) return;

    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
      metadata: { attachments }
    };

    dispatch({
      type: 'ADD_MESSAGE',
      payload: { conversationId: currentConv.id, message: userMessage }
    });

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Mock AI response for demo
      const aiResponse = await simulateAIResponse(content, currentConv.provider, currentConv.model);
      
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        metadata: {
          model: currentConv.model,
          tokens: aiResponse.tokens
        }
      };

      dispatch({
        type: 'ADD_MESSAGE',
        payload: { conversationId: currentConv.id, message: assistantMessage }
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };

      dispatch({
        type: 'ADD_MESSAGE',
        payload: { conversationId: currentConv.id, message: errorMessage }
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const executeCode = async (code: string, language: string) => {
    const currentConv = getCurrentConversation();
    if (!currentConv) return;

    // Mock code execution for demo
    const result = await simulateCodeExecution(code, language);
    
    // Add the execution result as a message
    const message: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: `Code execution completed:\n\n**Output:**\n\`\`\`\n${result.output}\n\`\`\`${result.error ? `\n\n**Error:**\n\`\`\`\n${result.error}\n\`\`\`` : ''}`,
      timestamp: new Date(),
      metadata: {
        codeExecution: {
          id: uuidv4(),
          language,
          code,
          output: result.output,
          error: result.error
        }
      }
    };

    dispatch({
      type: 'ADD_MESSAGE',
      payload: { conversationId: currentConv.id, message }
    });
  };

  const value: ChatContextType = {
    state,
    dispatch,
    createConversation,
    getCurrentConversation,
    sendMessage,
    executeCode
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

// Mock functions for demo purposes
async function simulateAIResponse(content: string, provider: string, model: string) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // Generate contextual responses based on content
  let response = '';
  
  if (content.toLowerCase().includes('code') || content.toLowerCase().includes('function')) {
    response = `I'd be happy to help you with coding! Here's a Python example:\n\n\`\`\`python\ndef hello_world():\n    print("Hello, World!")\n    return "Success"\n\nhello_world()\n\`\`\`\n\nWould you like me to execute this code or help you with something else?`;
  } else if (content.toLowerCase().includes('chart') || content.toLowerCase().includes('plot') || content.toLowerCase().includes('visualize')) {
    response = `I can help you create data visualizations! Here's an example using Plotly:\n\n\`\`\`python\nimport plotly.graph_objects as go\nimport numpy as np\n\n# Sample data\nx = np.linspace(0, 10, 100)\ny = np.sin(x)\n\n# Create plot\nfig = go.Figure(data=go.Scatter(x=x, y=y, mode='lines'))\nfig.update_layout(title='Sine Wave')\nfig.show()\n\`\`\`\n\nWould you like me to generate a specific type of chart?`;
  } else if (content.toLowerCase().includes('data') || content.toLowerCase().includes('analyze')) {
    response = `I can help you analyze data! Here are some common data analysis tasks I can assist with:\n\n1. **Data Cleaning**: Remove duplicates, handle missing values\n2. **Statistical Analysis**: Calculate means, correlations, distributions\n3. **Data Visualization**: Create charts and plots\n4. **Machine Learning**: Build predictive models\n\nWhat specific data analysis task would you like help with?`;
  } else {
    const responses = [
      `That's a great question! I'm here to help you with coding, data analysis, and visualization tasks. What would you like to work on today?`,
      `I understand! As an AI assistant with IDE capabilities, I can help you write code, execute it, create visualizations, and analyze data. What's your project about?`,
      `Interesting! I have access to code execution and data visualization tools. Would you like me to demonstrate any of these capabilities?`,
      `Thanks for sharing that with me! I'm equipped to help with programming tasks, data analysis, and creating interactive charts. How can I assist you?`
    ];
    response = responses[Math.floor(Math.random() * responses.length)];
  }
  
  return {
    content: response,
    tokens: Math.floor(response.length / 4) // Rough token estimate
  };
}

async function simulateCodeExecution(code: string, language: string) {
  // Simulate execution delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  
  // Mock execution results based on code content
  if (code.includes('print(')) {
    const printMatch = code.match(/print\(["'`]([^"'`]+)["'`]\)/);
    if (printMatch) {
      return {
        output: printMatch[1],
        error: null
      };
    }
  }
  
  if (code.includes('hello') || code.includes('Hello')) {
    return {
      output: 'Hello, World!',
      error: null
    };
  }
  
  if (code.includes('error') || code.includes('Error')) {
    return {
      output: '',
      error: 'NameError: name \'undefined_variable\' is not defined'
    };
  }
  
  if (language.toLowerCase() === 'python') {
    return {
      output: 'Code executed successfully\nResult: 42',
      error: null
    };
  }
  
  if (language.toLowerCase() === 'javascript') {
    return {
      output: 'undefined',
      error: null
    };
  }
  
  return {
    output: `${language} code executed successfully`,
    error: null
  };
}