import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { Send, Paperclip, Mic, Square, Volume2, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import type { Conversation } from '../../contexts/ChatContext';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

interface ChatAreaProps {
  conversation: Conversation | null;
}

function ChatArea({ conversation }: ChatAreaProps) {
  const { state, sendMessage } = useChat();
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || state.isLoading) return;
    
    const message = inputMessage.trim();
    setInputMessage('');
    
    try {
      await sendMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Message copied to clipboard');
  };

  const renderMessage = (message: any, index: number) => {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';
    
    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}
      >
        <div className={`group max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
          {!isUser && !isSystem && (
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm font-semibold">AI</span>
              </div>
              <span className="text-gray-400 text-sm">
                {conversation?.model} • {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
          )}
          
          <div className={`relative rounded-2xl px-4 py-3 ${
            isUser 
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white ml-12'
              : isSystem
              ? 'bg-yellow-900/20 border border-yellow-800 text-yellow-200'
              : 'bg-gray-800 text-gray-100'
          }`}>
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    return match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-lg my-2"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="bg-gray-700 px-1 py-0.5 rounded text-sm" {...props}>
                        {children}
                      </code>
                    );
                  },
                  pre({ children }) {
                    return <>{children}</>;
                  },
                  a({ href, children }) {
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        {children}
                      </a>
                    );
                  }
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
            
            {/* Message Actions */}
            {!isSystem && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-8 right-0 flex space-x-1">
                <button
                  onClick={() => handleCopyMessage(message.content)}
                  className="p-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 hover:text-white transition-colors"
                  title="Copy message"
                >
                  <Copy className="w-3 h-3" />
                </button>
                
                {!isUser && (
                  <>
                    <button
                      className="p-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 hover:text-green-400 transition-colors"
                      title="Good response"
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </button>
                    <button
                      className="p-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 hover:text-red-400 transition-colors"
                      title="Poor response"
                    >
                      <ThumbsDown className="w-3 h-3" />
                    </button>
                    <button
                      className="p-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 hover:text-blue-400 transition-colors"
                      title="Read aloud"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          
          {isUser && (
            <div className="flex items-center justify-end mt-2 mr-3">
              <span className="text-gray-400 text-sm">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Start a New Conversation</h3>
          <p className="text-gray-400">Select a conversation from the sidebar or create a new one to begin chatting.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 p-4">
        <h2 className="text-lg font-semibold text-white">{conversation.title}</h2>
        <p className="text-sm text-gray-400">
          {conversation.provider} • {conversation.model}
          {conversation.messages.length > 0 && (
            <span> • {conversation.messages.length} message{conversation.messages.length !== 1 ? 's' : ''}</span>
          )}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Ready to Chat!</h3>
              <p className="text-gray-400 mb-4">
                Start the conversation by typing a message below. You can ask questions, 
                request code examples, analyze data, or get help with any task.
              </p>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-gray-300">"📝 Write a Python function to analyze CSV data"</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-gray-300">"📈 Create a visualization showing sales trends"</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-gray-300">"🤖 Help me debug this JavaScript code"</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {conversation.messages.map(renderMessage)}
            {state.isLoading && (
              <div className="flex justify-start mb-6">
                <div className="bg-gray-800 rounded-2xl px-4 py-3">
                  <LoadingSpinner size="small" text="AI is thinking..." />
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-end space-x-3">
          {/* Attachment Button */}
          <button
            className="p-3 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none min-h-[48px] max-h-32"
              rows={1}
              disabled={state.isLoading}
            />
          </div>

          {/* Voice Input Button */}
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`p-3 rounded-lg transition-colors ${
              isRecording
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            title={isRecording ? 'Stop recording' : 'Voice input'}
          >
            {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || state.isLoading}
            className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg transition-all transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
            title="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatArea;