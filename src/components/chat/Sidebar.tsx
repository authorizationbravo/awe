import React, { useState } from 'react';
import { Plus, MessageSquare, Search, MoreHorizontal, Trash2, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Conversation } from '../../contexts/ChatContext';

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onConversationSelect: (id: string) => void;
  onNewConversation: () => void;
}

function Sidebar({
  conversations,
  currentConversationId,
  onConversationSelect,
  onNewConversation
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditStart = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setEditTitle(conversation.title);
  };

  const handleEditSave = () => {
    // In a real app, this would update the conversation title
    setEditingId(null);
    setEditTitle('');
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) {
      return hours === 0 ? 'Just now' : `${hours}h ago`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    }
  };

  return (
    <div className="w-80 h-full bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <button
          onClick={onNewConversation}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Search conversations..."
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {searchQuery ? 'No conversations found' : 'No conversations yet'}
              </p>
              <p className="text-xs mt-1">
                {searchQuery ? 'Try a different search term' : 'Start a new chat to begin'}
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation, index) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className={`group relative cursor-pointer border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${
                  currentConversationId === conversation.id ? 'bg-blue-900/20 border-blue-800' : ''
                }`}
                onClick={() => onConversationSelect(conversation.id)}
              >
                <div className="p-4">
                  {editingId === conversation.id ? (
                    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleEditSave();
                          if (e.key === 'Escape') handleEditCancel();
                        }}
                        autoFocus
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={handleEditSave}
                          className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleEditCancel}
                          className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-medium truncate ${
                            currentConversationId === conversation.id ? 'text-blue-300' : 'text-white'
                          }`}>
                            {conversation.title}
                          </h3>
                          <p className="text-xs text-gray-400 mt-1">
                            {conversation.model} • {formatDate(conversation.updatedAt)}
                          </p>
                          {conversation.messages.length > 0 && (
                            <p className="text-sm text-gray-500 mt-1 truncate">
                              {conversation.messages[conversation.messages.length - 1].content.substring(0, 60)}...
                            </p>
                          )}
                        </div>
                        
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Show context menu or handle more options
                            }}
                            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {conversation.templateType && (
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            conversation.templateType === 'code' ? 'bg-green-900/30 text-green-300' :
                            conversation.templateType === 'data-analysis' ? 'bg-purple-900/30 text-purple-300' :
                            conversation.templateType === 'research' ? 'bg-orange-900/30 text-orange-300' :
                            'bg-blue-900/30 text-blue-300'
                          }`}>
                            {conversation.templateType.replace('-', ' ')}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="text-xs text-gray-500 text-center">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;