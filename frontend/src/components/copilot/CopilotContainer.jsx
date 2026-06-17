import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { X, Maximize2, Minimize2, PanelLeftClose, PanelLeftOpen, Terminal, Dock } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

import { CopilotSidebar } from './CopilotSidebar';
import { CopilotWelcome } from './CopilotWelcome';
import { CopilotMessageList } from './CopilotMessageList';
import { CopilotInput } from './CopilotInput';

export const CopilotContainer = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDocked, setIsDocked] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId]);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/chat/conversations');
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (id) => {
    try {
      const res = await api.get(`/chat/conversations/${id}/messages`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const createConversation = async (initialTitle) => {
    try {
      const res = await api.post('/chat/conversations', { title: initialTitle });
      setConversations([res.data, ...conversations]);
      setActiveConversationId(res.data._id);
      return res.data._id;
    } catch (err) {
      console.error(err);
      toast.error('Failed to create conversation');
      return null;
    }
  };

  const handleUpdateConversation = async (id, updates) => {
    try {
      const res = await api.put(`/chat/conversations/${id}`, updates);
      setConversations(prev => prev.map(c => c._id === id ? { ...c, ...res.data } : c));
    } catch (err) {
      console.error(err);
      toast.error('Failed to update conversation');
    }
  };

  const handleDeleteConversation = async (id) => {
    try {
      await api.delete(`/chat/conversations/${id}`);
      setConversations(prev => prev.filter(c => c._id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete conversation');
    }
  };

  const handleSend = async (messageText = input) => {
    if (!messageText.trim() || isLoading) return;

    let convId = activeConversationId;
    if (!convId) {
      convId = await createConversation(messageText.slice(0, 30) + '...');
      if (!convId) return;
    }

    const tempMessage = {
      _id: 'temp-' + Date.now(),
      role: 'user',
      content: messageText.trim()
    };
    
    setMessages(prev => [...prev, tempMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('vanish_token');
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';
      const response = await fetch(`${API_BASE}/chat/conversations/${convId}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: messageText.trim(),
          contextUrl: location.pathname
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Stream request failed: ${response.status} ${response.statusText} - ${errText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      const assistantMessageId = 'model-' + Date.now();
      setMessages(prev => [...prev, { _id: assistantMessageId, role: 'model', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6);
            if (dataStr === '[DONE]') continue;
            
            try {
              const data = JSON.parse(dataStr);
              if (data.text) {
                setMessages(prev => prev.map(msg => {
                  if (msg._id === assistantMessageId) {
                    return { ...msg, content: msg.content + data.text };
                  }
                  return msg;
                }));
              }
            } catch (e) {
              // Ignore incomplete JSON chunks
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat Error:', error);
      toast.error('System encountered an error.');
    } finally {
      setIsLoading(false);
      fetchMessages(convId);
      fetchConversations();
    }
  };

  const handlePromptSelect = (prompt) => {
    handleSend(prompt);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.95 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            x: 0,
            width: isFullscreen ? '100vw' : (isDocked ? (isSidebarOpen ? '710px' : '450px') : (isSidebarOpen ? '800px' : '450px')),
            height: isFullscreen ? '100vh' : (isDocked ? '100vh' : '85vh'),
            right: isFullscreen ? 0 : (isDocked ? 0 : '32px'),
            bottom: isFullscreen ? 0 : (isDocked ? 0 : '32px'),
            top: (isFullscreen || isDocked) ? 0 : 'auto',
            borderRadius: (isFullscreen || isDocked) ? 0 : '16px'
          }}
          exit={{ opacity: 0, x: 20, scale: 0.95 }}
          transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
          className="fixed z-100 flex overflow-hidden bg-[#0a0a0a] border-l border-white/10 shadow-[-10px_0_50px_rgba(0,0,0,0.5)] font-sans"
        >
          {/* Sidebar */}
          <CopilotSidebar 
            isOpen={isSidebarOpen}
            conversations={conversations}
            activeId={activeConversationId}
            onSelect={setActiveConversationId}
            onNew={() => setActiveConversationId(null)}
            onUpdate={handleUpdateConversation}
            onDelete={handleDeleteConversation}
          />

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-[350px] relative bg-[#0a0a0a]">
            {/* Header */}
            <div className="h-12 flex items-center justify-between px-4 border-b border-white/5 bg-[#0a0a0a] relative z-10">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-1.5 text-slate-500 hover:text-white transition-colors rounded hover:bg-white/5"
                >
                  {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
                </button>
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-brand-emerald" />
                  <h2 className="text-white text-xs font-mono font-bold tracking-widest uppercase">VanishLink AI Copilot</h2>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsDocked(!isDocked)}
                  className={`p-1.5 transition-colors rounded hover:bg-white/5 ${isDocked ? 'text-brand-emerald' : 'text-slate-500 hover:text-white'}`}
                  title="Toggle Dock"
                >
                  <Dock className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-1.5 text-slate-500 hover:text-white transition-colors rounded hover:bg-white/5"
                  title="Toggle Fullscreen"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={onClose}
                  className="p-1.5 text-slate-500 hover:text-white transition-colors rounded hover:bg-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">
              {messages.length === 0 && !activeConversationId ? (
                <CopilotWelcome onPromptSelect={handlePromptSelect} />
              ) : (
                <CopilotMessageList messages={messages} isLoading={isLoading} />
              )}
            </div>

            {/* Input Area */}
            <CopilotInput 
              input={input}
              setInput={setInput}
              handleSend={() => handleSend()}
              isLoading={isLoading}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
